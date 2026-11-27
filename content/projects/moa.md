---
title: 모아 (Moa)
period: 26.06 — 26.10
type: 팀 프로젝트, 2명
summary: 감정 하나로 하루를 기록하고, 5명 이내의 친구 그룹과만 공유하는 React Native 앱의 백엔드 API
tech: [Java 21, Spring Boot, Spring Security, JPA, PostgreSQL, Flyway, React Native]
github: https://github.com/Mony-Co/Moa_backend
order: 3
---

**맡은 일**: 기획, Backend 70%, Frontend 30%

## 프로젝트 소개

**모아**(Moa)는 "오늘 하루를 모으다"라는 뜻을 담은 감정 기록 앱입니다. 긴 일기 대신 **감정 하나로 하루를 기록**하고, **5명 이내의 친한 친구 그룹**과만 감정과 일상을 나눕니다. 이 저장소는 React Native 앱이 쓰는 Spring Boot API 서버입니다.

- **개인 테마**: 나만 보는 비공개 감정 기록. 날짜별 대표 감정을 골라 월별 캘린더와 주간 감정 그래프로 돌아봅니다
- **친구 테마**: 친구 그룹 안에서 감정과 글을 공유하고 공감, 댓글, 질문으로 서로의 하루에 반응합니다

<div class="shots">
<figure><img src="/projects/moa-personal-feed.png" alt="모아 개인 테마 피드 화면: 날짜별 기록과 대표 감정"><figcaption>개인 테마 · 날짜별 기록과 대표 감정</figcaption></figure>
<figure><img src="/projects/moa-friend-feed.png" alt="모아 친구 테마 공유 피드 화면: 친구 글, 공감, 댓글, 질문하기"><figcaption>친구 테마 · 공유 피드와 질문하기</figcaption></figure>
</div>

React Native 앱이라 **Android Studio 에뮬레이터와 Xcode iOS 시뮬레이터**에서 앱을 직접 실행해, 로그인부터 기록 작성, 피드, 공감, 댓글, 질문까지 API가 화면에서 제대로 동작하는지 두 플랫폼 모두에서 확인했습니다.

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| 언어, 프레임워크 | Java 21, Spring Boot 4.1, Gradle |
| 인증 | Spring Security, OAuth2 Resource Server(JWT), 카카오 로그인 |
| 데이터 | PostgreSQL, Spring Data JPA, Flyway |
| API 문서 | springdoc-openapi (Swagger UI) |
| 개발 환경 | Docker Compose(PostgreSQL), Actuator |
| 앱 확인 | React Native, Android Studio 에뮬레이터, Xcode iOS 시뮬레이터 |
| 테스트 | JUnit, H2(PostgreSQL 호환 모드), Flyway 마이그레이션 테스트 |

## 프로젝트 구조

도메인별로 패키지를 나누고, 각 도메인 안은 `api`, `application`, `domain`, `infrastructure` 계층으로 정리했습니다.

```
com.moa.backend
├── auth            # 카카오 토큰 검증, 회원 가입·로그인, Moa JWT 발급
├── personalfeed    # 개인 기록 CRUD, 대표 감정, 추천 태그
├── group           # 그룹, 친구 피드, 공감, 댓글, 질문과 답변
│   └── domain      # 그룹 정원, 질문 생성, 댓글 내용 정책
├── system          # 상태 확인 API
└── common          # 공통 응답·예외, 보안·CORS·OpenAPI 설정
```

## 주요 기능과 API

| 기능 | API | 설명 |
| --- | --- | --- |
| 카카오 로그인 | `POST /api/v1/auth/kakao` | 앱이 받은 카카오 토큰을 검증하고 Moa JWT 발급 |
| 내 정보 | `GET /api/v1/auth/me` | 현재 로그인한 사용자 조회 |
| 개인 피드 | `GET /api/v1/personal-feed` | 기간별 개인 기록 조회, 작성·수정·삭제 |
| 추천 태그 | `GET /api/v1/personal-feed/tags/recommendations` | 개인 기록에 가장 많이 쓴 태그 상위 8개 |
| 대표 감정 | `PUT /api/v1/personal-feed/posts/{postId}/representative-emotion` | 날짜별 대표 감정 지정과 해제 |
| 공감 | `POST /api/v1/groups/{groupId}/posts/{postId}/reaction` | 좋아요, 응원, 안아주기 선택과 취소 |
| 댓글 | `/api/v1/groups/{groupId}/posts/{postId}/comments` | 등록, 조회, 수정, 삭제 |
| 질문 | `/api/v1/groups/{groupId}/questions` | 그룹 멤버에게 질문하고 답변 |

## 설계 포인트

- **카카오 토큰 검증**: 앱이 보낸 카카오 액세스 토큰을 서버가 카카오 토큰 정보·사용자 정보 API로 다시 확인하고, 발급한 앱 ID까지 검사한 뒤 1시간짜리 Moa JWT를 발급합니다
- **그룹 정원**: 그룹 최대 인원 5명을 도메인 정책(`GroupCapacityPolicy`)으로 분리해 참여할 때마다 검사합니다
- **질문 동시성**: 질문을 등록하거나 답할 때 그룹 멤버와 질문 행을 비관적 락으로 잠근 뒤 검증해, 탈퇴나 중복 답변과 동시에 일어나도 규칙이 깨지지 않게 했습니다
- **공감 중복 방지**: 한 글에 여러 종류의 공감을 남길 수 있도록 유니크 인덱스를 (글, 사용자, 공감 종류) 조합으로 바꿨고, 같은 종류를 다시 누르면 그 공감만 취소됩니다
- **대표 감정**: 대표 감정을 지정하면 같은 날짜의 기존 대표 감정을 교체해 하루에 하나만 남게 했습니다
- **권한 확인**: 모든 요청은 JWT의 사용자 ID로 기록 소유자와 그룹 멤버십을 확인해, 다른 사람의 개인 기록이나 가입하지 않은 그룹에 접근할 수 없습니다
- **일관된 오류 응답**: 오류는 `code`, `message`, `fields`, `timestamp` 형식으로 통일하고 400, 401, 403, 404, 502로 구분했습니다
- **스키마 관리**: DB 변경은 Flyway 마이그레이션으로 관리하고, 마이그레이션 자체도 테스트로 검증했습니다

## 내가 맡은 일

- **도메인 설계**: ERD를 설계하고 그에 맞춰 JPA 엔터티를 정리했습니다
- **개인 피드**: 개인 기록 작성·조회·수정·삭제 API, 대표 감정 지정, 추천 태그를 구현했습니다
- **친구 피드**: 공감 저장, 댓글, 질문하기 기능을 구현했습니다
- **로그인**: 카카오 로그인 초기 구현을 맡았습니다
- **협업**: 코딩 컨벤션 문서와 AI 에이전트 작업 지침(AGENTS.md)을 두고 같은 규칙으로 개발했습니다
