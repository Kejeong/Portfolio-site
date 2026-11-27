---
title: Outbox와 Kafka로 서비스끼리 이벤트 주고받기
date: 2026-11-20
category: BackEnd
tags: [Kafka, Outbox, MSA, 팔레트]
cover: DB → outbox → Kafka
summary: 토픽 3개로 서비스끼리 어떤 이벤트를 주고받는지, 유실과 중복 없이 보내고 받기 위해 고민한 것들
---

팔레트에서 서비스를 나누고 나니, 한 서비스의 변화를 다른 서비스에 알려야 하는 일이 생겼습니다. 회원이 가입하면 결제 서비스가 지갑을 만들어야 하고, 주문이 구매 확정되면 정산 서비스가 정산 후보를 만들어야 합니다. 이 글은 **토픽 3개로 서비스끼리 어떤 이벤트를 주고받는지**, 그리고 그 과정에서 이벤트가 사라지거나 두 번 처리되지 않도록 고민한 내용을 정리한 기술 노트입니다.

[![토픽 3개로 주고받는 이벤트: member.events, seller.events, order.events와 구독 서비스](/posts/palette-event-topics.png)](/posts/palette-event-topics.png)

보내는 서비스는 비즈니스 변경과 이벤트를 한 트랜잭션에 저장하고, 릴레이가 Kafka로 보내고, 받는 서비스는 처리 기록과 비즈니스 반영을 한 트랜잭션으로 묶습니다. 아래 그림이 전체 흐름이고, 이어지는 내용은 각 단계를 하나씩 풀어 쓴 것입니다.

[![Outbox와 Kafka 전체 흐름: outbox_event 저장, 릴레이, Kafka 토픽, 컨슈머, processed_event, DLT](/posts/palette-outbox-flow.png)](/posts/palette-outbox-flow.png)

## 1. Outbox 패턴: 왜 쓰나요

서비스가 "DB 변경"과 "Kafka 발행"을 따로 하면, 둘 중 하나만 성공하는 순간이 생깁니다.

| 순서 | 문제 |
| --- | --- |
| DB 커밋 → Kafka 발행 | 커밋 직후 앱이 죽으면 이벤트가 사라져요 (주문은 확정됐는데 정산 후보가 안 생김) |
| Kafka 발행 → DB 커밋 | 커밋이 실패하면 없는 일이 이벤트로 나가요 |

Outbox는 이벤트를 **같은 DB, 같은 트랜잭션에 행으로 저장**하는 방식입니다.

```java
// EventPublisher.publish — 반드시 쓰기 트랜잭션 안에서 호출
outboxEventRepository.save(OutboxEvent.create(envelope, payloadJson));   // status = PENDING
```

- **함께 롤백, 함께 커밋**: 비즈니스 변경이 롤백되면 이벤트도 함께 롤백되고, 커밋되면 이벤트도 반드시 남습니다
- **트랜잭션 밖 호출 차단**: 트랜잭션 밖에서 부르면 바로 예외를 던집니다. 이벤트를 저장할 곳이 없으면 유실되기 때문입니다
- **이벤트 위치 제한**: `com.backend.shared` 밖에 있는 이벤트 클래스도 바로 막습니다. 릴레이와 컨슈머가 이벤트 타입을 찾지 못하면 저장만 되고 영영 못 보내기 때문입니다

이벤트는 봉투(`EventEnvelope`)에 싸서 저장합니다.

| 필드 | 예 | 용도 |
| --- | --- | --- |
| `eventId` | UUID | 컨슈머 중복 방지의 기준 |
| `eventType` | `OrderConfirmedEvent` | 컨슈머가 어떤 클래스로 읽을지 |
| `aggregateType` | `ORDER` | 토픽 이름 |
| `aggregateId` | 주문 ID | 메시지 키 (순서 보장) |
| `occurredAt` | 발생 시각 | |
| `payload` | 이벤트 내용 (JSON) | |

## 2. 릴레이: outbox → Kafka

`OutboxRelayScheduler`가 이전 실행이 끝난 뒤 1초마다(`fixedDelay`) `OutboxRelay.relayPending()`을 부릅니다. 한 번 실행할 때 최대 100건을 보냅니다.

### 한 건씩, 각자 트랜잭션으로

```sql
select * from outbox_event e
where e.status = 'PENDING' and e.id > :afterId
  and not exists (                       -- 같은 대상의 앞선 PENDING 이벤트가 있으면 건너뜀
      select 1 from outbox_event earlier
      where earlier.aggregate_type = e.aggregate_type
        and earlier.aggregate_id  = e.aggregate_id
        and earlier.status = 'PENDING' and earlier.id < e.id)
order by e.id
limit 1
for update skip locked                   -- 다른 릴레이가 잠근 행은 건너뜀
```

PENDING 이벤트 하나 잠가서 가져오기 → Kafka로 보내고 ack 기다리기 → PUBLISHED로 바꾸고 커밋

- **ack까지 기다림**: 브로커가 기록을 마쳤다는 응답(ack)까지 기다립니다 (`acks: all`, 최대 10초)
- **같은 대상의 순서**: 같은 주문의 앞 이벤트가 아직 PENDING이면 뒤 이벤트를 꺼내지 않습니다
- **여러 서버에서 동시 실행**: `SKIP LOCKED` 덕분에 같은 행을 두 릴레이가 동시에 잡지 않습니다

### 실패는 두 종류로 나눠서 처리

| 실패 | 판단 기준 | 처리 |
| --- | --- | --- |
| Kafka에 닿지 못함 (브로커 다운, 시간 초과) | `RetriableException`, `TimeoutException` | 이번 실행을 바로 멈춰요. 행은 롤백돼서 PENDING 그대로고, 재시도 횟수도 안 세요. 1초 뒤 다시 해요 |
| Kafka가 메시지를 거부함 (너무 큰 메시지 등) | 그 밖의 오류 | 별도 트랜잭션에서 `retry_count + 1` 하고 다음 이벤트로 넘어가요. 5번째 실패면 FAILED가 되고 더 이상 보내지 않아요 |

Kafka가 몇 시간 내려가 있어도 이벤트는 PENDING으로 쌓여 있다가, 살아나면 순서대로 나갑니다. 재시도 횟수는 **메시지 자체가 문제**일 때만 셉니다.

### 상태 흐름

```text
PENDING ──(ack 받음)──────────────────────▶ PUBLISHED
   │
   └─(거부됨, retry_count+1)─▶ PENDING ... ─(5번째)─▶ FAILED  (ERROR 로그 → Slack)
```

> ⚠️ **"최소 한 번" 전달입니다.** Kafka에 보낸 뒤 PUBLISHED로 커밋하기 전에 앱이 죽으면, 다음 실행에서 같은 이벤트를 한 번 더 보냅니다. 그래서 받는 쪽이 반드시 중복을 걸러야 합니다 (4번 참고).

## 3. 토픽 만들기

| 항목 | 값 | 어디서 |
| --- | --- | --- |
| 토픽 이름 | `aggregateType` 소문자 + `.events` → `member.events`, `seller.events`, `order.events` | `EventMessages.topicOf` |
| 메시지 키 | `aggregateId` (회원·판매자·주문 ID) | `OutboxKafkaSender` |
| 헤더 | `eventId`, `eventType` | `OutboxKafkaSender` |
| 파티션 | 3개 | `custom.outbox.topicPartitions` |
| 복제 수 | 1 (브로커 1대) | 코드 상수 |
| 보관 | 3일 또는 파티션당 512MB | compose의 Kafka 설정 |

- **토픽 생성**: 토픽은 릴레이가 처음 보낼 때 만듭니다(`kafkaAdmin.createOrModifyTopics`). 브로커의 자동 생성은 꺼 두었습니다(`AUTO_CREATE_TOPICS_ENABLE=false`). 오타로 엉뚱한 토픽이 생기는 걸 막기 위해서입니다
- **키와 순서**: 키가 같으면 같은 파티션으로 갑니다. 그래서 같은 판매자의 "제재 → 철회 반려" 이벤트는 보낸 순서대로 처리됩니다. 키가 다른 이벤트끼리는 순서가 보장되지 않고, 그럴 필요도 없습니다
- **짧은 보관 기간**: Kafka는 원본 저장소가 아닙니다. 원본은 `outbox_event`에 남아 있어서 보관 기간을 3일로 짧게 둬도 됩니다

## 4. 컨슈머: 받아서 처리하기

지금 있는 컨슈머는 세 개입니다.

| 컨슈머 (groupId) | 토픽 | 하는 일 |
| --- | --- | --- |
| payment | `member.events` | 회원가입 → 지갑 생성 |
| settlement | `order.events` | 구매 확정 → 정산 후보 생성 |
| market | `seller.events` | 제재·철회 요청 → 상품 중지, 철회 반려 → 재개 |

groupId가 서비스마다 다릅니다. 그래서 같은 토픽을 여러 서비스가 각자 처음부터 끝까지 받습니다. 예를 들어 `seller.events`는 market과 (예정인) settlement가 각자 받습니다.

### 메시지 하나를 처리하는 순서 (전부 한 트랜잭션)

```java
@KafkaListener(topics = "order.events", groupId = "settlement")
@Transactional
public void handle(ConsumerRecord<String, String> record) {
    // 1. 헤더의 eventType으로 먼저 거름 — 관심 없는 이벤트는 payload를 읽지도 않음
    // 2. 봉투 JSON을 읽어 이벤트 클래스로 되돌림
    // 3. processed_event에 (eventId, "settlement") insert — 이미 있으면 false → 그냥 끝
    // 4. 실제 처리 (정산 후보 생성)
}
```

- **기록과 처리를 함께**: 3번과 4번이 같은 트랜잭션입니다. 4번이 실패하면 3번 기록도 롤백돼서, 다시 받으면 처음부터 다시 처리합니다
- **동시에 와도 한 번**: 3번은 `insert ... on conflict do nothing`이라, 동시에 두 번 와도 하나만 성공합니다
- **멱등 처리**: 그래서 릴레이가 같은 이벤트를 두 번 보내도 결과는 한 번 처리한 것과 같습니다. 그 위에 도메인 쪽 유니크 제약(`wallet.member_id`, `order_item_id`)이 한 번 더 막습니다

### 설정

| 설정 | 값 | 의미 |
| --- | --- | --- |
| `enable-auto-commit` | false | Kafka가 멋대로 "읽음" 처리하지 않아요 |
| `ack-mode` | record | 메시지 하나를 다 처리한 뒤에 offset을 커밋해요 |
| `auto-offset-reset` | earliest | 처음 보는 groupId는 토픽에 남아 있는 가장 오래된 메시지부터 읽어요 |

> 💡 **서비스를 옮길 때 주의할 점**: groupId를 그대로 유지하면 Kafka가 "어디까지 읽었는지"를 기억해서 이어서 읽습니다. groupId를 바꾸면 남아 있는 최대 3일치를 처음부터 다시 읽습니다. 이때 새 스키마의 `processed_event`가 비어 있으면 이미 처리한 이벤트를 또 처리합니다. 그래서 DB 분리 계획에 "processed_event를 컨슈머별로 복사"하는 단계가 들어가 있습니다.

## 5. 재시도와 DLT (Dead Letter Topic)

`KafkaConsumerConfig`가 모든 `@KafkaListener`에 같은 실패 처리를 붙입니다.

### 다시 처리하면 될 수도 있는 실패

DB가 잠시 끊기거나 상대 서비스에 일시 오류가 났을 때입니다.

```text
1번째 실패 → 1초 대기 → 2번째 → 2초 → 3번째 → 4초 → 4번째 → 8초 → 5번째 실패
                                                                      ↓
                                                    <토픽>-dlt 로 보냄 + ERROR 로그
```

- **시도 횟수**: 총 5번 시도하고, 기다리는 시간은 합쳐서 15초입니다
- **순서 유지**: 재시도하는 동안 그 파티션의 뒤 메시지는 기다립니다. 그래서 순서가 깨지지 않습니다. 대신 한 메시지가 막히면 그 파티션 전체가 최대 15초 늦어집니다

### 다시 해도 소용없는 실패는 바로 DLT로

`JacksonException`(JSON 깨짐), `IllegalArgumentException`(봉투 필드 누락, 모르는 이벤트 타입), `DateTimeException`은 재시도하지 않고 바로 DLT로 보냅니다.

### DLT 동작

| 항목 | 내용 |
| --- | --- |
| 토픽 이름 | 원래 토픽 + `-dlt` → `order.events-dlt` |
| 생성 | 처음 보낼 때 원래 토픽과 같은 파티션 수로 만들어요 |
| 파티션 | 키로 정해요. 같은 주문의 실패 메시지는 DLT에서도 한 파티션에 모여요 |
| 알림 | ERROR 로그가 Grafana를 거쳐 Slack으로 가요 |
| 다시 처리 | 자동으로는 안 해요. 원인을 고친 뒤 DLT 메시지를 원래 토픽으로 다시 보내면 돼요. `processed_event`가 있어서 다시 보내도 두 번 처리되지 않아요 |
| DLT 전송 실패 | 브로커 장애 등으로 DLT에 못 보내면 offset을 넘기지 않아요. 원래 메시지를 다시 받으니 유실되지 않아요 |

## 6. 상황별로 무슨 일이 생기나요

| 상황 | 결과 | 유실 | 중복 |
| --- | --- | --- | --- |
| 비즈니스 처리 중 예외 | outbox도 롤백, 이벤트 없음 | — | — |
| Kafka 브로커가 몇 시간 다운 | outbox에 PENDING으로 쌓였다가 복구되면 순서대로 발행 | 없음 | 없음 |
| 보낸 직후, PUBLISHED 커밋 전에 앱이 죽음 | 다음 실행에서 한 번 더 발행 | 없음 | 컨슈머가 거름 |
| Kafka가 메시지를 거부 | 5번 실패하면 FAILED, Slack 알림 | 수동 처리 필요 | — |
| 컨슈머 처리 중 일시 오류 | 1·2·4·8초 재시도 후 성공 | 없음 | 없음 |
| 컨슈머 코드 버그로 계속 실패 | DLT로 가고 Slack 알림, 뒤 메시지는 계속 처리 | 고친 뒤 다시 보내면 복구 | 거름 |
| 컨슈머 서비스가 다운 | Kafka에 쌓였다가 다시 뜨면 이어서 읽음 (3일 안) | 3일 넘으면 유실 위험 | 없음 |
