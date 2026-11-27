---
title: 팔레트 ERD
---

- **구성**: 서비스 7개가 PostgreSQL 하나에서 스키마를 나눠 씁니다. 도메인 테이블 44개, FK 32개
- **서비스 사이**: 다른 서비스의 테이블은 FK 없이 ID만 들고 있고(34곳), 데이터는 내부 API와 Kafka 이벤트로 주고받습니다
- **공통 테이블**: 모든 스키마에 `outbox_event`(발행 대기 이벤트)와 `processed_event`(컨슈머 중복 처리 기록)가 있고, settlement에는 Spring Batch 메타 테이블이 더 있습니다
- **기준**: 각 서비스의 Flyway 마이그레이션을 끝까지 적용한 결과입니다

### 서비스 간 참조

화살표는 왼쪽 서비스가 오른쪽 서비스의 ID를 들고 있다는 뜻이고, 라벨은 그 컬럼 이름입니다. FK는 두지 않았습니다.

```mermaid
flowchart LR
  market["market<br/>상품·주문"]
  member["member<br/>회원·판매자"]
  payment["payment<br/>예치금·결제"]
  settlement["settlement<br/>정산"]
  delivery["delivery<br/>배송"]
  notification["notification<br/>알림"]
  ai["ai<br/>추천·챗봇"]
  market -.->|"member_id, buyer_id<br/>seller_id, influencer_id"| member
  payment -.->|member_id| member
  payment -.->|order_id| market
  settlement -.->|seller_id| member
  settlement -.->|"order_id, order_item_id"| market
  settlement -.->|wallet_tx_id| payment
  delivery -.->|"buyer_id, seller_id"| member
  delivery -.->|"order_id, order_item_id<br/>product_id, option_id"| market
  notification -.->|member_id| member
  notification -.->|order_id| market
  ai -.->|"member_id, influencer_id"| member
  ai -.->|product id| market
```

### 서비스별 테이블

눌러서 펼치면 서비스마다 테이블과 컬럼을 볼 수 있습니다. 그림이 넓으면 옆으로 스크롤해 보세요. 주요 컬럼만 추렸습니다.

<details>
<summary><b>member</b> · 회원, 판매자, 인플루언서 · 테이블 6개</summary>

```mermaid
erDiagram
  member {
    bigint id PK
    varchar email UK
    varchar password
    varchar name
    varchar role
    varchar status
    timestamp deleted_at
  }
  member_social_account {
    bigint id PK
    bigint member_id FK
    varchar provider
    varchar provider_user_id
    varchar profile_image_url
  }
  seller {
    bigint id PK
    bigint member_id FK,UK
    varchar business_number UK
    varchar business_name
    varchar representative_name
    varchar phone_number
    varchar bank_name
    varchar account_holder
    varchar account_number
    varchar status
    timestamp applied_at
    timestamp approved_at
    bigint version
  }
  seller_status_history {
    bigint id PK
    bigint seller_id FK
    varchar from_status
    varchar to_status
    varchar reason
    timestamp changed_at
  }
  influencer {
    bigint id PK
    bigint member_id FK,UK
    varchar activity_name
    varchar introduction
    varchar sns_url
    varchar status
    timestamp applied_at
    timestamp decided_at
    bigint version
  }
  influencer_status_history {
    bigint id PK
    bigint influencer_id FK
    varchar from_status
    varchar to_status
    varchar reason
    timestamp changed_at
  }
  member ||--o{ member_social_account : "member_id"
  member ||--o| seller : "member_id"
  seller ||--o{ seller_status_history : "seller_id"
  member ||--o| influencer : "member_id"
  influencer ||--o{ influencer_status_history : "influencer_id"
```

</details>

<details>
<summary><b>market</b> · 상품, 장바구니, 주문, 쿠폰, 리뷰 · 테이블 20개</summary>

#### 상품, 재고

```mermaid
erDiagram
  category {
    bigint id PK
    bigint parent_id FK
    varchar name
    int sort_order
  }
  product {
    bigint id PK
    bigint category_id FK
    bigint seller_id "→ member.seller"
    varchar name
    bigint price
    varchar status
    text ingredients_text
    bigint version
  }
  product_option {
    bigint id PK
    bigint product_id FK
    varchar option_value_1
    bigint additional_price
  }
  option_stock {
    bigint option_id PK,FK
    int stock
  }
  stock_history {
    bigint id PK
    bigint option_id FK
    bigint order_item_id "ID 참조"
    varchar change_type
    int change_qty
    int stock_after
  }
  product_image {
    bigint id PK
    bigint product_id FK
    varchar image_key
  }
  product_discount {
    bigint id PK
    bigint product_id FK
    bigint sale_price
    timestamp ends_at
  }
  product_stop_request {
    bigint id PK
    bigint product_id FK,UK
    varchar status
  }
  category ||--o{ category : "parent_id"
  category ||--o{ product : "category_id"
  product ||--o{ product_option : "product_id"
  product ||--o{ product_image : "product_id"
  product ||--o{ product_discount : "product_id"
  product ||--o| product_stop_request : "product_id"
  product_option ||--o| option_stock : "option_id"
  product_option ||--o{ stock_history : "option_id"
```

#### 장바구니, 주문

```mermaid
erDiagram
  cart {
    bigint id PK
    bigint member_id UK "→ member.member"
  }
  cart_item {
    bigint id PK
    bigint cart_id FK
    bigint option_id "ID 참조"
    int quantity
    bool selected
  }
  market_order {
    bigint id PK
    varchar order_number UK
    bigint buyer_id "→ member.member"
    varchar status
    bigint pay_amount
    bigint shipping_fee
    varchar idempotency_key
    varchar payment_idempotency_key
    timestamp paying_started_at
    timestamp expires_at
    bigint version
  }
  market_order_item {
    bigint id PK
    bigint order_id FK
    bigint product_id "ID 참조"
    bigint option_id "ID 참조"
    bigint seller_id "→ member.seller"
    int quantity
    bigint line_amount
  }
  order_status_history {
    bigint id PK
    bigint order_id FK
    varchar from_status
    varchar to_status
  }
  product_option {
    bigint id PK
  }
  cart ||--o{ cart_item : "cart_id"
  market_order ||--o{ market_order_item : "order_id"
  market_order ||--o{ order_status_history : "order_id"
  product_option ||..o{ cart_item : "option_id"
  product_option ||..o{ market_order_item : "option_id"
```

#### 쿠폰, 제휴

```mermaid
erDiagram
  coupon {
    bigint id PK
    varchar coupon_type
    varchar issuer_type
    varchar status
    int remaining_quantity
    timestamp valid_until
  }
  cart_coupon_tier {
    bigint id PK
    bigint coupon_id FK
    bigint min_order_amount
    bigint discount_amount
  }
  coupon_usage {
    bigint id PK
    bigint coupon_id FK
    bigint member_id "→ member.member"
    bigint order_id "ID 참조"
    varchar status
  }
  partnership {
    bigint id PK
    bigint seller_id "→ member.seller"
    bigint influencer_id "→ member.influencer"
    varchar status
    int commission_rate
  }
  product_coupon {
    bigint id PK
    bigint coupon_id FK,UK
    bigint partnership_id FK
    bigint product_id "ID 참조"
    varchar code UK
  }
  market_order {
    bigint id PK
  }
  coupon ||--o{ cart_coupon_tier : "coupon_id"
  coupon ||--o{ coupon_usage : "coupon_id"
  coupon ||--o| product_coupon : "coupon_id"
  partnership ||--o{ product_coupon : "partnership_id"
  market_order ||..o{ coupon_usage : "order_id"
```

#### 리뷰, 찜

```mermaid
erDiagram
  review {
    bigint id PK
    bigint product_id "ID 참조"
    bigint order_item_id UK "ID 참조"
    bigint member_id "→ member.member"
    int rating
    varchar content
  }
  wishlist {
    bigint id PK
    bigint product_id FK
    bigint member_id "→ member.member"
  }
  product {
    bigint id PK
  }
  market_order_item {
    bigint id PK
  }
  product ||--o{ wishlist : "product_id"
  product ||..o{ review : "product_id"
  market_order_item ||..o| review : "order_item_id"
```

</details>

<details>
<summary><b>payment</b> · 예치금, 충전, 결제, 환불 · 테이블 7개</summary>

```mermaid
erDiagram
  wallet {
    bigint id PK
    bigint member_id UK "→ member.member"
    bigint balance
  }
  wallet_transaction {
    bigint id PK
    bigint wallet_id FK
    varchar type
    bigint amount
    bigint balance_after
    varchar reference_type
    bigint reference_id
    varchar idempotency_key UK
  }
  payment {
    bigint id PK
    bigint wallet_id FK
    bigint member_id "→ member.member"
    bigint order_id "→ market.market_order"
    varchar order_number
    bigint amount
    bigint shipping_fee
    varchar status
    varchar idempotency_key UK
    timestamp paid_at
  }
  wallet_holding {
    bigint id PK
    bigint wallet_id FK
    bigint payment_id FK,UK
    bigint order_id UK "→ market.market_order"
    bigint amount
    bigint settled_amount
    varchar status
  }
  payment_refund {
    bigint id PK
    bigint payment_id FK
    bigint order_id UK "→ market.market_order"
    bigint amount
    varchar status
    int retry_count
  }
  topup {
    bigint id PK
    bigint wallet_id FK
    bigint member_id "→ member.member"
    varchar order_id UK
    varchar payment_key UK
    varchar pg_provider
    bigint amount
    bigint remaining_amount
    varchar status
  }
  topup_usage {
    bigint id PK
    bigint topup_id FK
    bigint payment_id FK
    bigint amount
  }
  wallet ||--o{ wallet_transaction : "wallet_id"
  wallet ||--o{ payment : "wallet_id"
  wallet ||--o{ wallet_holding : "wallet_id"
  wallet ||--o{ topup : "wallet_id"
  payment ||--o| wallet_holding : "payment_id"
  payment ||--o{ payment_refund : "payment_id"
  topup ||--o{ topup_usage : "topup_id"
  payment ||--o{ topup_usage : "payment_id"
```

</details>

<details>
<summary><b>settlement</b> · 월 정산 · 테이블 3개</summary>

```mermaid
erDiagram
  settlement {
    bigint id PK
    bigint seller_id "→ member.seller"
    char settlement_month
    bigint total_sale_price
    bigint total_fee
    bigint payout_amount
    varchar status
    varchar idempotency_key UK
    bigint wallet_tx_id "→ payment.wallet_transaction"
    int retry_count
    date payable_on
  }
  settlement_candidate {
    bigint id PK
    bigint settlement_id FK
    bigint seller_id "→ member.seller"
    bigint order_id "→ market.market_order"
    bigint order_item_id UK "→ market.market_order_item"
    bigint sale_price
    int fee_rate
    bigint fee
    bigint payout_amount
    varchar status
    uuid source_event_id
  }
  settlement_process_history {
    bigint id PK
    bigint target_id
    varchar target_type
    varchar trigger_type
    varchar stage
    varchar result
    int attempt_no
  }
  settlement ||--o{ settlement_candidate : "settlement_id"
```

</details>

<details>
<summary><b>delivery</b> · 배송, 배송 추적 · 테이블 2개</summary>

```mermaid
erDiagram
  delivery {
    bigint id PK
    bigint order_id UK "→ market.market_order"
    bigint buyer_id "→ member.member"
    varchar status
    varchar courier
    varchar tracking_number
    timestamp shipped_at
    timestamp delivered_at
    varchar last_tracking_status
  }
  delivery_item {
    bigint id PK
    bigint delivery_id FK
    bigint order_item_id UK "→ market.market_order_item"
    bigint product_id "→ market.product"
    bigint option_id "→ market.product_option"
    bigint seller_id "→ member.seller"
    int quantity
  }
  delivery ||--o{ delivery_item : "delivery_id"
```

</details>

<details>
<summary><b>notification</b> · SSE 알림 · 테이블 1개</summary>

```mermaid
erDiagram
  notification {
    bigint id PK
    bigint member_id "→ member.member"
    bigint order_id "→ market.market_order"
    varchar type
    varchar message
    varchar tracking_number
    timestamp read_at
  }
```

</details>

<details>
<summary><b>ai</b> · 설문, 맞춤 추천, 챗봇 · 테이블 5개</summary>

```mermaid
erDiagram
  beauty_profile {
    bigint id PK
    bigint member_id UK "→ member.member"
    bigint influencer_id "→ member.influencer"
    varchar skin_type
    text_array concerns
    text_array avoided_ingredients
    vector embedding
  }
  recommend_product {
    bigint id PK "→ market.product"
    varchar name
    bigint price
    text ingredients_text
    text_array ingredient_tags
    bool on_sale
    vector embedding
  }
  faq {
    bigint id PK
    varchar category
    varchar question
    text answer
    bool visible
    vector embedding
  }
  chat_conversation {
    bigint id PK
    bigint member_id "→ member.member"
    varchar title
    timestamp last_message_at
  }
  chat_message {
    bigint id PK
    bigint conversation_id FK
    varchar role
    text content
    text_array source_faq_ids
  }
  chat_conversation ||--o{ chat_message : "conversation_id"
```

</details>
