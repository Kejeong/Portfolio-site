---
title: Spring AI와 pgvector로 피부 맞춤 상품 추천 만들기
date: 2026-11-15
category: BackEnd
tags: [Spring AI, OpenAI, pgvector, 임베딩, 팔레트]
cover: 설문 ↔ 상품 · 코사인 거리
summary: 임베딩이 무엇인지부터, 언제 만들고 어디에 저장해 추천 SQL 한 번으로 쓰는지까지
---

팔레트의 AI 서비스(ai-service)에서 **뷰티 설문으로 내 피부에 맞는 상품을 추천하는 기능**을 맡았습니다. 사용자의 피부 타입, 고민, 선호 성분과 상품 설명이 **의미상 얼마나 가까운지**로 순서를 정하고, 피하는 성분이 든 상품은 확실하게 빼는 방식입니다. 이 글은 그 과정에서 쓴 임베딩, Spring AI, pgvector를 정리한 기술 노트입니다.

## 1. 임베딩이란?

글을 **숫자 배열**(벡터)로 바꾼 것입니다. 의미가 비슷한 글은 비슷한 숫자 배열이 됩니다.

```text
"트러블 피부 진정 크림"      → [0.12, -0.03, 0.88, ..., 0.05]   (숫자 1536개)
"여드름 피부용 시카 크림"    → [0.10, -0.01, 0.85, ..., 0.07]   ← 위와 거의 비슷
"면 100% 오버핏 티셔츠"      → [-0.40, 0.66, 0.02, ..., -0.21]  ← 많이 다름
```

- **숫자 1536개**: `text-embedding-3-small` 모델이 글 하나를 숫자 1536개로 바꿉니다. 각 숫자가 무슨 뜻인지는 사람이 알 수 없고, 모델이 학습하면서 정한 "의미 좌표"입니다
- **의미 비교**: 두 벡터의 방향이 얼마나 같은지(코사인 유사도)로 의미가 가까운지 알 수 있습니다. "트러블"과 "여드름"은 글자는 다르지만 의미가 가까워서 벡터도 가깝습니다. 키워드 검색과 가장 다른 점입니다
- **누가 만드나**: OpenAI 서버가 만듭니다. 우리는 글을 보내고 숫자 배열을 받기만 합니다. 이게 OpenAI API 호출입니다

## 2. Spring AI가 해 주는 일

Spring AI는 OpenAI API를 직접 HTTP로 부르지 않게 해 주는 라이브러리입니다.

```yaml
# ai-service/src/main/resources/application.yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}          # OpenAI 인증 키
      embedding:
        options:
          model: text-embedding-3-small   # 어떤 임베딩 모델을 쓸지
          dimensions: 1536                # 숫자 몇 개로 바꿀지
```

이렇게만 적으면 Spring AI가 `EmbeddingModel` 빈을 자동으로 만들어 줍니다. 우리는 주입받아서 쓰기만 하면 됩니다.

```java
// RecommendEmbedUseCase.java
private final EmbeddingModel embeddingModel;   // Spring AI가 만들어 준 빈 (OpenAI 연결)

List<float[]> vectors = embeddingModel.embed(List.of(
        "카테고리: 스킨케어\n상품명: 수분 크림\n설명: 촉촉한 크림",
        "카테고리: 선케어\n상품명: 선크림\n설명: 끈적임 없는 선크림"
));
// vectors.get(0) → float[1536], vectors.get(1) → float[1536]
```

- **묶어서 보내기**: `embed(List<String>)`는 글 여러 개를 HTTP 요청 한 번으로 보냅니다. 그래서 20개씩 묶어서 보냅니다
- **필요한 것만**: 쓰는 건 이 메서드 하나뿐입니다. Spring AI에는 채팅, 이미지 기능도 있지만 모두 꺼 두었습니다(`chat: none` 등)

## 3. 무엇을 임베딩하나

임베딩할 글은 직접 만들어서 보냅니다. 상품과 설문 두 종류입니다.

```java
// RecommendProduct.java — 상품
public String embeddingSource() {
    return "카테고리: " + categoryName + "\n상품명: " + name + "\n설명: " + description;
}
// → "카테고리: 스킨케어\n상품명: 시카 진정 크림\n설명: 트러블 피부를 위한 진정 크림"
```

```java
// BeautyProfile.java — 설문
public String embeddingSource() {
    return "피부 타입: " + skinType.getLabel()
            + "\n피부 고민: " + ...       // 트러블, 모공
            + "\n선호 성분: " + ...       // 시카(병풀), 나이아신아마이드
            + "\n관심 카테고리: " + ...;  // 스킨케어
}
// → "피부 타입: 지성\n피부 고민: 트러블, 모공\n선호 성분: 시카(병풀)\n관심 카테고리: 스킨케어"
```

일부러 넣지 않은 것도 있습니다.

- **상품의 전성분**: 성분은 성분 사전으로 정확하게 처리합니다. 임베딩에 넣으면 사전이 바뀔 때마다 다시 임베딩해야 합니다
- **설문의 피하는 성분**: 순서를 정하는 데 쓰지 않고, SQL로 확실하게 빼는 데만 씁니다

설문 글 "트러블, 모공, 시카"와 상품 글 "트러블 피부를 위한 진정 크림"은 의미가 가까워서 벡터도 가깝게 나옵니다. 이게 **"내 피부에 맞는 순서"의 원리**입니다.

## 4. 언제 만드나

OpenAI는 느리고 실패할 수도 있는 외부 서버라서, 상품 변경 이벤트를 받을 때 바로 부르지 않고 두 단계로 나눴습니다.

```text
① 이벤트 받기 (빠름, DB만)                  ② 임베딩 채우기 (느림, OpenAI)
───────────────────────────────            ─────────────────────────────────
market 상품 변경                            RecommendScheduler (5초마다)
  ↓ Kafka product.events                       ↓
RecommendProductEventListener                 "embedding이 null인 상품 20개 줘"
  ↓                                            ↓
recommend_product에 저장                      embeddingModel.embed(글 20개)  ← OpenAI 호출
  embedding = null  ← "아직 안 만듦" 표시         ↓
                                              recommend_product.embedding에 저장
```

### ① 이벤트 받기

```java
// RecommendApplyProductChangeUseCase.java
public void apply(ProductChangedEvent event, LocalDateTime eventAt) {
    IngredientMatch match = IngredientDictionary.match(event.ingredientsText());  // 성분 태그 (사전)
    RecommendProduct product = recommendProductRepository.findById(event.productId()).orElse(null);

    if (product == null) {
        recommendProductRepository.save(RecommendProduct.create(event, eventAt, match));  // 새 상품: embedding은 null로 시작
    } else {
        String beforeHash = product.getEmbeddingSourceHash();
        product.apply(event, eventAt, match);
        if (!beforeHash.equals(product.getEmbeddingSourceHash())) {   // 글이 바뀌었으면
            recommendVectorRepository.clearProductEmbedding(event.productId());  // 임베딩을 지움 → ②가 다시 만듦
        }
    }
}
```

임베딩할 글(카테고리·이름·설명)의 **SHA-256 해시**를 저장해 둡니다. 가격이나 판매 여부만 바뀌면 글이 같아서 해시도 같고, 그러면 OpenAI를 다시 부르지 않습니다. 비용과 시간이 절약됩니다.

### ② 임베딩 채우기

```java
// RecommendEmbedUseCase.java
private void embedProducts() {
    List<Long> ids = recommendVectorRepository.findProductIdsToEmbed(20);   // embedding이 null인 판매 중 뷰티 상품
    List<RecommendProduct> products = recommendProductRepository.findAllById(ids);

    List<float[]> embeddings = embed("PRODUCT",
            products.stream().map(RecommendProduct::embeddingSource).toList());  // OpenAI 한 번 호출
    if (embeddings == null) return;   // 실패 → 그대로 두고 5초 뒤 다시

    for (int i = 0; i < products.size(); i++) {
        recommendVectorRepository.saveProductEmbedding(
                products.get(i).getId(), products.get(i).getEmbeddingSourceHash(), embeddings.get(i));
    }
}
```

두 단계로 나눈 이유는 이렇습니다.

- **OpenAI가 죽어도 상품 반영은 된다**: 예를 들어 판매 중지 이벤트는 바로 반영돼서 추천에서 빠집니다. 임베딩만 나중에 채워집니다
- **DB 트랜잭션을 오래 잡지 않는다**: OpenAI 응답을 기다리는 동안 DB 연결을 붙잡고 있지 않습니다
- **실패해도 자동으로 다시 시도한다**: `null`인 행이 남아 있으면 다음 5초에 또 집어 갑니다

설문도 같은 방식입니다. 저장할 때 `embedding`을 비우고, 스케줄러가 채웁니다.

## 5. 어디에 저장하나: pgvector

PostgreSQL은 원래 숫자 1536개짜리 배열을 벡터로 다루지 못합니다. **pgvector 확장**이 `vector` 타입과 거리 계산 연산자를 추가해 줍니다. 그래서 DB 이미지를 pgvector가 들어간 것으로 바꾸고 확장을 켰습니다.

```sql
-- V3__create_recommend_product.sql
create table recommend_product (
    ...
    ingredient_tags text[] not null,     -- 성분 태그 (사전 결과)
    embedding vector(1536),              -- 임베딩 (OpenAI 결과). null이면 아직 안 만듦
    ...
);
```

```java
// RecommendVectorRepository.java
public boolean saveProductEmbedding(Long productId, String sourceHash, float[] embedding) {
    return jdbcTemplate.update(
            "update recommend_product set embedding = cast(? as vector) where id = ? and embedding_source_hash = ?",
            toVector(embedding), productId, sourceHash) == 1;
}
// toVector: float[] → "[0.12,-0.03,0.88,...]" 문자열 → SQL에서 vector 타입으로 변환
```

- **옛날 임베딩이 덮어쓰지 않게**: `and embedding_source_hash = ?` 조건이 있어서, OpenAI를 기다리는 동안 상품 글이 바뀌었으면 저장하지 않습니다
- **JPA 대신 JdbcTemplate**: JPA는 `vector` 타입을 모르기 때문에, 엔티티에서는 이 컬럼을 빼고 SQL로 직접 다룹니다

## 6. 어떻게 쓰나: 추천 SQL 한 번

추천은 SQL 한 번으로 합니다. pgvector의 `<=>` 연산자가 두 벡터의 코사인 거리(0에 가까울수록 비슷함)를 계산합니다.

```sql
select p.id, p.name
from recommend_product p
where p.on_sale and p.beauty
  and p.embedding is not null
  and not (p.ingredient_tags && '{ALCOHOL,FRAGRANCE}')   -- ① 피하는 성분이 하나라도 겹치면 제외 (확실하게)
order by p.embedding <=> (select embedding from beauty_profile where member_id = 7)   -- ② 내 설문과 가까운 순
limit 10;
```

- **① 빼기는 정확하게**: 피하는 성분은 성분 태그와 배열 연산(`&&`, 겹치는 게 있나)으로 뺍니다. 임베딩과 상관없이 정확합니다
- **② 순서는 의미로**: 순서는 임베딩 거리로 정합니다. 의미가 비슷한 상품이 위로 옵니다
- **조회할 때는 OpenAI를 부르지 않는다**: 이미 저장된 숫자끼리 DB가 계산만 합니다. 그래서 빠르고 비용이 들지 않습니다

## 정리

| 고민 | 선택 |
| --- | --- |
| 의미가 비슷한 상품을 찾으려면? | 상품 글과 설문 글을 임베딩해 코사인 거리로 비교 |
| 피하는 성분은 확실히 빼야 한다 | 임베딩이 아니라 성분 태그와 SQL 배열 연산으로 제외 |
| OpenAI는 느리고 실패할 수 있다 | 이벤트 반영과 임베딩 생성을 두 단계로 분리 |
| 비용을 줄이려면? | 글의 해시를 비교해 바뀐 상품만 다시 임베딩, 20개씩 묶어 호출 |
| JPA가 vector를 모른다 | 벡터 컬럼만 JdbcTemplate으로 직접 다룸 |
| 추천 조회가 느리면 안 된다 | 조회 때는 OpenAI 없이 DB 계산만 |
