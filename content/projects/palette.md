---
title: 팔레트 (Palette)
period: 26.09 — 26.11
type: 팀 프로젝트, 5명
summary: 여러 셀러의 뷰티, 의류 상품을 한 곳에서 사고파는 입점형 이커머스 플랫폼
tech: [Java, Spring Boot, JPA, PostgreSQL, pgvector, Redis, Kafka, Spring AI, Spring Batch, Docker, AWS, Grafana]
github: https://github.com/Kejeong/Palette_BE
link: https://palette-shop.duckdns.org/
order: 1
---

**맡은 일**: PO, 공통 설계, 주문 서비스 분리, 결제 HTTP 연결, 배송 외부 API 연동, 반품, AI 추천, 로그 모니터링

## 프로젝트 소개

> 다양한 셀러의 뷰티·의류 상품으로 나만의 취향을 완성하는 입점형 이커머스 플랫폼

여러 판매자가 입점해 상품을 팔고, 플랫폼이 중개·결제·정산을 맡습니다. 주문은 **예치금**으로 결제하고, 결제 금액은 구매 확정 전까지 플랫폼이 보관(홀딩)했다가 **매월 10일 수수료 10%를 뺀 금액**을 판매자에게 정산합니다. 모놀리스로 시작해 서비스 7개와 Gateway로 나누면서, 주문 한 건이 결제부터 반품까지 돈과 재고가 어긋나지 않게 만드는 데 집중했습니다.

- **기간**: 2026.10 ~ 2026.11 (5인 백엔드 팀)
- **규모**: 서비스 8개(AI 포함) + API Gateway, PostgreSQL 서비스별 스키마

## 주요 기능

| 기능 | 내용 |
| --- | --- |
| 회원·인증 | 이메일 인증 가입, 카카오 로그인, JWT, 판매자 입점 심사, 인플루언서 |
| 상품·검색 | 상품·옵션·재고 관리, 판매 중지 심사, Elasticsearch(nori) 검색, 리뷰, 찜 |
| 장바구니·주문 | 여러 판매자 상품을 한 주문으로, 주문 시 재고 차감(15분 미결제 시 만료), 쿠폰, 배송비, 반품, 배송 완료 7일 후 자동 구매 확정 |
| 예치금·결제 | 토스페이먼츠·헥토 충전, 지갑 → 홀딩 결제, 결제 재확인, 반품 환불 |
| 배송 | 송장 등록, 택배사 배송 추적(웹훅·폴링), 배송 완료 반영, 수동 완료 |
| 정산 | 구매 확정 시 정산 후보 생성, 매월 10일 Spring Batch 정산, 실패 재시도 |
| 알림 | 주문·배송 이벤트를 SSE로 실시간 알림 |
| AI | 뷰티 설문 기반 맞춤 상품 추천(피하는 성분 제외·임베딩 유사도), 크리에이터 추천, FAQ 근거 챗봇 |
| 관리자 | 판매자 심사·제재, 판매 중지, 반품 승인, 쿠폰, 정산·결제 관리 |

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 언어, 빌드 | Java 21, Gradle (Kotlin DSL, 멀티모듈) |
| 프레임워크 | Spring Boot 4.1 (Web MVC, Data JPA, Security, Batch, Validation), Spring Cloud Gateway, Spring AI 2.0 |
| 데이터 | PostgreSQL 17 + pgvector, Redis, Elasticsearch, Flyway |
| 메시징 | Apache Kafka (Outbox 패턴) |
| 외부 연동 | 토스페이먼츠, 헥토, 카카오 로그인, OpenAI, 배송 추적 API |
| 관측 | Prometheus, Loki, Grafana Alloy, Grafana, Slack 에러 알림 |
| 배포 | Docker Compose, Nginx, k3s, GitHub Actions, EC2 |
| 문서, 협업 | springdoc-openapi(Swagger UI), GitHub, Jira |

## 시스템 아키텍처

[![팔레트 시스템 아키텍처](/projects/palette-architecture.png)](/projects/palette-architecture.png)

- **MSA**: 서비스 8개와 API Gateway로 나눴고, 모든 요청은 Gateway를 거쳐 각 서비스로 갑니다
- **헥사고날 레이어**: 각 서비스의 도메인은 `in`(컨트롤러·리스너·스케줄러), `app`(유스케이스), `domain`(엔티티·규칙), `out`(Repository·외부 연동)으로 나눴습니다
- **서비스 간 통신**: 바로 결과가 필요한 조회·명령은 내부 HTTP API(`/internal/**`), 상태 변화 알림은 Transactional Outbox → Kafka 이벤트로 연결합니다. 컨슈머는 처리 기록으로 중복을 막고, 실패하면 재시도 후 DLT로 보냅니다
- **요청 흐름**: 사용자 → Nginx → Gateway → 6개 서비스(member, market, payment, settlement, delivery, notification)
- **AI 추천**: k3s(Kubernetes) 위에서 HPA로 1~2개까지 자동으로 늘어나도록 했습니다
- **데이터 서버**: 앱 서버와 분리한 EC2에 Kafka, PostgreSQL(+pgvector), Elasticsearch, Redis를 두고 파일은 S3에 저장합니다
- **외부 API**: 토스 결제, 카카오, 메일, OpenAI, 배송 조회, Slack 알림

## 프로젝트 구조

```
beadv8_2_TRSS_BE
├── common                 # 공통: 보안·예외·Outbox·Kafka, 서비스 간 이벤트·DTO
├── gateway
├── member-service
├── market-service
├── payment-service
├── settlement-service
├── delivery-service
├── notification-service
├── ai-service
├── load-test              # k6 부하 테스트
└── infra                  # Docker Compose, Nginx, 모니터링, 배포 스크립트
```

각 서비스 안은 도메인 컨텍스트마다 같은 구조를 씁니다.

```
{service}/src/main/java/com/backend/boundedContext/{context}
├── in       # 컨트롤러, 이벤트 리스너, 스케줄러
├── app      # 유스케이스, Facade
├── domain   # 엔티티, 상태 규칙, ErrorCode
└── out      # Repository, 외부 연동 어댑터
```

## 모듈 분리 설계

모놀리스를 Gradle 멀티모듈로 나눠 서비스 7개와 Gateway로 옮겼습니다. 한 번에 나누지 않고 서비스 단위로 하나씩 옮겼고, 전환 중에는 기존 모놀리스(8080)를 함께 띄워 두고 Nginx가 경로별로 나눠 보냈습니다.

- **데이터 소유**: 각 서비스는 자기 스키마만 읽고 씁니다
- **서비스 간 연결**: 다른 서비스의 데이터는 내부 API나 Kafka 이벤트로만 얻습니다

### 프로젝트 구조

```
beadv8_2_TRSS_BE/
├── settings.gradle.kts        # 모듈 등록
├── build.gradle.kts           # 공통 빌드 설정
├── infra/                     # Compose, Nginx, Postgres 초기화, 배포 스크립트
│
├── common/                    # 공통 (웹·JPA·보안, outbox·Kafka, 서비스 간 계약)
├── gateway/                   # 라우팅, 인증
├── member-service/            # 회원
├── market-service/            # 상품·주문
├── payment-service/           # 결제
├── settlement-service/        # 정산
├── delivery-service/          # 배송
├── notification-service/      # 알림
└── ai-service/                # AI 추천·챗봇
```

### 서비스별 역할

| 모듈 | 담당 |
| --- | --- |
| `common` | 공통 웹·JPA·보안 설정, outbox·Kafka, 서비스 간 계약(DTO·이벤트·`XxxApi`), 운영용 Slack 알림 |
| `gateway` | 라우팅, JWT 검증, rate limit, CORS |
| `member-service` | 회원, 판매자, 카카오 OAuth |
| `market-service` | 상품·재고·검색·리뷰·찜 / 장바구니·주문·쿠폰·반품 |
| `payment-service` | 예치금(지갑), 충전, 결제, 홀딩, 환불 |
| `settlement-service` | 정산 후보, 정산 배치, 지급 |
| `delivery-service` | 배송, 외부 배송 조회 API 연동 |
| `notification-service` | 사용자 알림 |
| `ai-service` | 추천, 리뷰 요약, 챗봇, 벡터 문서 검색 |

- **알림 구분**: `common`의 Slack 알림은 장애·배치 실패 같은 운영 알림이고, 사용자에게 가는 알림은 `notification-service`가 맡습니다
- **반품과 환불**: 주문 상태를 바꾸는 반품은 market, 돈이 움직이는 환불은 payment가 맡습니다. 반품이 승인되면 market이 이벤트를 발행하고 payment가 환불합니다

### DB 분리

PostgreSQL 하나에서 서비스마다 스키마와 DB 계정을 따로 두었습니다.

| 서비스 | 스키마 / 계정 | 주요 테이블 |
| --- | --- | --- |
| member | `member` / `member_user` | 회원, 판매자 |
| market | `market` / `market_user` | 상품, 옵션, 카테고리, 재고 이력, 이미지, 리뷰, 찜 · 장바구니, 주문, 주문 항목, 상태 이력, 쿠폰, 반품 |
| payment | `payment` / `payment_user` | 지갑, 원장, 충전, 결제, 홀딩, 환불 |
| settlement | `settlement` / `settlement_user` | 정산 후보, 정산서, Spring Batch 메타 테이블 |
| delivery | `delivery` / `delivery_user` | 배송 |
| notification | `notification` / `notification_user` | 알림 |
| ai | `ai` / `ai_user` | 대화 기록, 벡터 색인(pgvector) |

- **외래키 없음**: 서비스 사이에는 FK를 두지 않고 다른 서비스의 ID(`memberId`, `orderId`)를 값으로만 저장합니다
- **outbox는 서비스 안에**: `outbox_event`, `processed_event`는 서비스마다 자기 스키마에 두고, 각 서비스의 첫 Flyway 마이그레이션에 넣었습니다
- **계정 권한**: 서비스 계정은 자기 스키마만 소유하고, 슈퍼유저는 초기화·백업·장애 대응에만 씁니다. 팀원 디버깅과 Grafana 조회용으로 모든 스키마를 읽기만 하는 `readonly_user`를 두었고, `ALTER DEFAULT PRIVILEGES`로 나중에 생기는 테이블도 읽을 수 있게 했습니다
- **초기화**: 스키마와 계정은 `infra/postgres/init/01-init-schemas.sh`가 만들어서, 서비스를 추가할 때 스크립트에 몇 줄만 더하면 됩니다

### 서비스 간 통신

| 방식 | 언제 | 규칙 |
| --- | --- | --- |
| 내부 API (동기) | 결과가 바로 필요할 때 (회원 상태 확인, 결제 요청) | `/internal/v1/{리소스}` 경로, `X-Internal-Key` 헤더, 주소는 `{SERVICE}_SERVICE_URL` 환경 변수 |
| Kafka 이벤트 (비동기) | 알리기만 하면 될 때 (가입, 제재, 구매 확정) | outbox 저장 → relay가 `{aggregate}.events` 토픽으로 발행 → 받는 쪽은 `processed_event`로 중복 처리 차단, 실패는 `{토픽}-dlt`로 |

- **인증**: 사용자 JWT는 Gateway가 검증합니다. Gateway가 생기기 전 전환 기간에는 각 서비스가 같은 `JWT_SECRET`으로 직접 검증했습니다
- **경로 소유**: API 경로마다 어느 서비스 소유인지 문서로 정해 두고 라우팅 기준으로 썼습니다

### 배포와 포트

| 서비스 | 포트 | 실행 위치 | 주요 의존 |
| --- | --- | --- | --- |
| `gateway` | 8000 | EC2-A Compose | Redis(rate limit) |
| `member-service` | 8081 | EC2-A Compose | Postgres, Redis(리프레시 토큰, 로그인 시도, 이메일 인증), Kafka, 카카오 API |
| `market-service` | 8082 | EC2-A Compose | Postgres, Kafka, Elasticsearch |
| `payment-service` | 8083 | EC2-A Compose | Postgres, Kafka |
| `settlement-service` | 8084 | EC2-A Compose | Postgres, Kafka |
| `delivery-service` | 8085 | EC2-A Compose | Postgres, Kafka |
| `notification-service` | 8086 | EC2-A Compose | Postgres, Kafka |
| `ai-service` | 8087 | EC2-A k3s | Postgres(pgvector), Kafka, LLM API |
| Postgres · Kafka · Elasticsearch · Redis | 5432 · 9092 · 9200 · 6379 | EC2-B Compose | - |

- **요청 경로**: 외부 요청은 Nginx(80/443) → Gateway(8000) → 각 서비스 순서로 들어오고, 서비스 포트는 EC2 밖으로 열지 않았습니다
- **메모리 관리**: EC2-A 한 대에 JVM 8개와 k3s가 함께 올라가서, 컨테이너마다 메모리 상한(`mem_limit`)과 `Xmx`를 정해 두었습니다 (market은 1GB)

## 설계

### 설계 기준

- 장애가 **다른 서비스로 번지지 않게**
- 결과를 모르는 결제도 **한 결과로**
- DB와 이벤트가 **어긋나지 않게**
- 동시 요청에도 **재고가 맞게**

### 주문, 결제 흐름

- **동기 (HTTP)**: 주문 서비스(PAYING 저장) → HTTP, 멱등 키 → 결제 서비스 → 응답 → 주문 확정(PAID)
  - 시간 초과로 결과를 모르면 재확인 스케줄러가 같은 멱등 키로 다시 확인하고, 반영할 수 없으면 취소로 보상
- **비동기 (이벤트)**: 주문 DB(상태 변경 + outbox) → 릴레이 → Kafka(order.events) → 정산, 배송, 결제(중복 처리 차단)
  - 상태 변경과 이벤트 저장을 한 트랜잭션으로 묶어 DB와 이벤트가 어긋나지 않게

### 서비스 분리와 기술 선택

- **서비스 분리**: 주문, 재고, 결제가 한 트랜잭션으로 묶인 모놀리스를 장애 격리와 도메인별 병렬 개발을 위해 7개 서비스와 Gateway로 나눴습니다
- **Outbox, Kafka**: 커밋 후 바로 발행하면 전송이 실패했을 때 이벤트가 사라지기 때문에 Transactional Outbox를 선택했고, 전달은 실패해도 메시지를 다시 읽을 수 있는 보관과 재처리, 같은 주문의 이벤트를 차례대로 처리하는 순서 보장이 필요해 Kafka로 결정했습니다

## 개발

### 결제와 이벤트 정합성

- **결제 연결**: 서비스를 나누면서 주문과 결제를 함께 롤백할 수 없고 시간 초과가 나면 결제가 됐는지 알 수 없어서, PAYING 상태와 같은 멱등 키로 다시 호출하는 방식으로 응답을 받지 못한 결제도 하나의 결과로 수렴시키고 반영할 수 없으면 취소로 보상했습니다
- **이벤트 발행**: DB 커밋과 이벤트 발행이 따로 실패하면 정산과 배송이 서로 다른 상태를 보게 되어, Outbox 패턴과 Kafka로 대상별 순서를 보장하고 컨슈머 중복 처리를 막았습니다
- **반품, 환불**: 재고 복원과 이벤트 발행을 한 트랜잭션으로 묶고 환불 확인 스케줄러를 더해 환불 누락을 알림으로 잡아내도록 했습니다

### 동시성과 중복 처리

- **만료 직전 결제**: 만료 직전의 결제와 만료 스케줄러가 같은 주문을 동시에 처리하는 문제를 비관적 락과 상태 재확인으로 막아 결제, 취소, 만료 중 하나만 반영되게 했습니다
- **교착 방지**: 잠금 순서를 상품(ID 오름차순), 주문 순으로 고정해 교착이 생길 여지를 없앴습니다
- **중복 주문**: Idempotency-Key와 유니크 인덱스, 장바구니 잠금으로 중복 주문과 재고 중복 차감을 막았습니다
- **배치 처리**: id 커서로 나눠 건 단위로 처리해 한 건이 실패해도 다른 주문에는 영향이 없도록 했습니다

### 배송 추적 연동

- **Delivery Tracker**: 송장을 등록하면 웹훅을 걸고, 콜백은 신호로만 받아 확인 워커가 직접 조회해 배송 완료를 반영합니다. 초당 호출 제한, 웹훅 만료 전 재등록, 발송 2일 뒤 안전망 조회로 놓치는 배송이 없게 했습니다 ([Delivery Tracker 기술 노트](/blog/delivery-tracker))

### AI 추천과 개발 방식

- **AI 추천**: 임베딩은 요청 경로 밖에서 미리 만들고 기피 성분은 SQL 하드 필터로 제외해서, 외부 장애가 있어도 추천은 응답하고 기피 성분 상품은 추천되지 않습니다 ([Spring AI·pgvector 기술 노트](/blog/spring-ai-embedding))
- **개발 방식**: 로컬에서 Claude Code 하네스를 설계, 개발, 테스트, QA 에이전트로 나눠 썼고, PR 공유 스킬과 ERROR 알림 봇을 팀 스킬로 만들었습니다

## 배포

### 서버 구성과 배포

- **앱 서버 (EC2-A, t3.large)**: Docker Compose로 Nginx, Gateway, 서비스 6개, 모니터링을 띄웠습니다. 서비스마다 컨테이너를 나누되 서버 한 대에서 명령 하나로 함께 올리고 내릴 수 있어서 Compose를 골랐습니다
- **AI 서비스 (k3s + HPA)**: LLM API를 부르는 AI 요청은 응답이 느리고 몰릴 때가 많아서, 다른 서비스와 떼어 k3s에 올리고 HPA로 이 서비스만 늘어나게 했습니다. 앱 서버 메모리(8GB) 안에 들어오도록 최대 2개로 제한했습니다
- **데이터 서버 (EC2-B, t3.medium)**: Kafka, PostgreSQL(서비스별 스키마 + pgvector), Elasticsearch, Redis를 앱 서버와 분리했습니다. 메모리를 추정해 보니 앱 서버만 6.6~8.5GB, 데이터 쪽이 3.3GB로 한 대에 담을 수 없었고, 앱을 다시 배포하거나 앱 쪽 메모리가 부족해져도 데이터 저장소는 영향을 받지 않게 하려는 목적도 있었습니다
- **메모리 상한**: JVM 8개가 한 서버를 나눠 쓰다 보니 하나가 메모리를 다 차지하면 다른 서비스까지 죽을 수 있어서, 컨테이너마다 `mem_limit`과 `Xmx`를 정해 두었습니다
- **CI/CD**: develop 브랜치에 머지되면 GitHub Actions가 서버에 배포합니다. 5명이 서비스별로 나눠 개발하면서 머지한 결과를 바로 개발 서버에서 함께 확인할 수 있도록 자동화했습니다
- **HTTPS**: Let's Encrypt 인증서를 Nginx에 붙이고, 매일 자동 갱신과 실패 시 Slack 알림을 두었습니다 ([HTTPS 기술 노트](/blog/palette-https))

### 검증과 운영

- **부하 테스트**: k6로 재고 100개에 300명 동시 주문, 버튼 연타, 5분 연속 구매 상황을 만들고 DB에서 재고와 결제를 대조해 재고, 결제 오류 0건과 서버 에러 0건을 확인했고, 초당 17건까지는 지연 없이 처리했습니다. 병목은 재고 잠금을 기다리는 동안 커넥션 풀이 고갈되는 부분이었습니다
- **모니터링**: Alloy, Loki, Grafana로 로그를 모으고, ERROR는 Slack으로 알리고, Prometheus로 메트릭을 수집했습니다

## 내가 맡은 일

커밋 300여 개로 주문, 배송, 공통 이벤트 기반, AI 추천을 주로 맡았습니다.

- **공통 기반**: 프로젝트 뼈대와 공통 클래스, 이벤트 공통 규격(DomainEvent, EventEnvelope)을 만들고 Transactional Outbox(테이블, 릴레이, 스케줄러)를 도입해 Kafka 발행으로 전환했습니다. 컨슈머 중복 처리(processed_event)도 추가했습니다
- **장바구니·주문**: 장바구니, 주문 생성·조회·취소, 예치금 결제 요청, 같은 Idempotency-Key 재요청 시 첫 응답 반환, 결제 만료 취소 스케줄러, 수동·7일 자동 구매 확정과 구매 확정 이벤트, 판매자 주문 항목 조회를 구현했습니다
- **동시성**: 판매 중지·삭제로 주문이 취소될 때 상품 → 주문 순서로 잠그도록 바꿔 교착을 막았습니다
- **반품·환불**: 반품 환불 확인 스케줄러와 환불 지연 알림(주문당 한 번)을 추가하고, 회원 탈퇴 검사에 환불 전 반품 주문을 포함했습니다
- **배송 서비스**: delivery-service 모듈을 새로 만들고 배송 도메인, 송장 등록, Delivery Tracker 연동(GraphQL, 초당 호출 제한, 웹훅·확인 워커), 관리자 수동 완료, 배송 추적 실패 목록을 구현했습니다
- **AI 추천**: Spring AI 임베딩과 추천 상품 사본 테이블, 성분 태깅·임베딩 스케줄러, 피하는 성분 하드 필터와 유사도 정렬을 한 번에 하는 SQL, 맞춤 상품·크리에이터 추천 API를 만들었습니다
- **모니터링**: Actuator와 Prometheus 메트릭을 도입하고, 인증 없이 열리는 경로를 health와 prometheus로 좁혔습니다
