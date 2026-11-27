---
title: 모바일 청첩장 (Wedding)
period: 26.10 — 26.11
type: 개인 프로젝트
summary: 언니 결혼식을 위해 Claude와 함께 기획부터 배포까지 혼자 만든 모바일 청첩장
tech: [Next.js, TypeScript, Tailwind CSS, Supabase, Vercel, Kakao API, Claude Code]
github: https://github.com/Kejeong/Wedding
link: https://jseh-wedding.vercel.app
order: 2
---

**맡은 일**: 1인 개발 (기획, 설계, 개발, 배포)

## 프로젝트 소개

언니 결혼식을 위해 만든 **모바일 청첩장**입니다. Claude를 개발 파트너로 두고 기획, 설계, 개발, 배포까지 혼자 진행했습니다. 하객이 카카오톡으로 받은 링크를 열면 봉투가 열리는 인트로부터 사진, 오시는 길, 마음 전하실 곳, 방명록까지 한 페이지에서 볼 수 있습니다.

- **기간**: 2026.10 ~ 2026.11
- **배포**: Vercel, 데이터베이스는 Supabase(PostgreSQL)

<div class="shots phone">
<figure><span class="device"><img src="/projects/wedding-cover.webp" alt="모바일 청첩장 첫 화면: 신랑 신부 이름과 봉투, 웨딩 사진"></span><figcaption>첫 화면 · 봉투 인트로와 웨딩 사진</figcaption></figure>
<figure><span class="device"><img src="/projects/wedding-guestbook.webp" alt="모바일 청첩장 방명록 화면: 축하 메시지 카드와 메시지 남기기 버튼"></span><figcaption>방명록 · 축하 메시지 남기기</figcaption></figure>
</div>

## 주요 기능

| 기능 | 내용 |
| --- | --- |
| 인트로 | 봉투가 자동으로 열리는 애니메이션 |
| 초대 글, 날짜 | 초대 문구와 예식 날짜 |
| 갤러리 | 고화질 웨딩 사진 |
| 오시는 길 | 카카오맵 API로 예식장 위치 표시 |
| 마음 전하실 곳 | 계좌 번호 복사 |
| 방명록 | 이름, 메시지, 4자리 비밀번호로 작성하고 비밀번호로 삭제 |
| 공유 | 카카오톡 공유 카드, 링크 미리보기 이미지 |

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 프레임워크 | Next.js (App Router), React, TypeScript |
| 스타일 | Tailwind CSS v4, 웹 폰트 |
| 데이터 | Supabase (PostgreSQL) |
| 검증, 보안 | zod, bcryptjs |
| 외부 연동 | 카카오맵 API, 카카오톡 공유 |
| 배포 | Vercel (Vercel Cron) |
| 개발 도구 | Claude Code |

## 구현 포인트

- **방명록 접근 제한**: Supabase 테이블에 RLS를 켜고 정책을 두지 않아 브라우저에서는 직접 읽고 쓸 수 없게 했습니다. 모든 조회와 작성은 서버 API 라우트에서만 처리합니다
- **비밀번호와 개인정보**: 방명록 비밀번호는 bcrypt로 해시해 저장하고, IP는 salt를 섞은 해시로만 남겼습니다
- **도배와 무작위 대입 방지**: 작성은 10분에 5회, 삭제 비밀번호 실패는 10분에 5회·1시간에 10회로 제한해, 4자리 비밀번호를 하나씩 넣어보는 시도를 막았습니다
- **입력 검증**: 이름 20자, 메시지 500자 같은 규칙을 zod와 DB 제약 조건 양쪽에 두었습니다
- **카카오톡 공유**: 공유 카드 이미지를 카카오 서버에 미리 올려 두어 모바일에서 미리보기가 바로 뜨게 했습니다
- **무료 DB 유지**: Supabase 무료 플랜은 오래 쓰지 않으면 멈추기 때문에, Vercel Cron으로 매일 한 번 keepalive 요청을 보냅니다
- **콘텐츠 분리**: 이름, 날짜, 장소, 계좌 같은 내용은 데이터 파일 하나에 모아 문구를 고칠 때 화면 코드를 건드리지 않게 했습니다

## Claude와 함께 만든 과정

기획 → 디자인 섹션 정리 → 화면 개발 → 방명록 API와 DB 설계 → 배포와 공유 설정

- **기획, 설계**: 필요한 섹션과 방명록 규칙을 Claude와 함께 정리하고, 디자인 시안을 섹션별 컴포넌트로 나눠 설계했습니다
- **개발**: Claude Code로 화면과 API를 만들고, 인트로 애니메이션은 참고 영상에 맞춰 여러 번 다듬었습니다
- **배포**: Vercel에 GitHub를 연결해 자동 배포하고, 카카오 개발자 콘솔에 배포 도메인을 등록해 공유 기능을 연결했습니다
