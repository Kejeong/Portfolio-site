# 김은정 개인 사이트

이력, 프로젝트, 공부 기록을 담는 개인 블로그입니다. Next.js로 만들고 Vercel에 배포합니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 배포 전 확인
```

## 글 쓰기

`content/posts`에 `.md` 파일을 추가하면 됩니다. 파일 이름이 주소가 됩니다 (`content/posts/my-post.md` → `/blog/my-post`).

```md
---
title: 글 제목
date: 2026-11-25
category: BackEnd   # Database / BackEnd / FrontEnd / Infra / Monitoring 중 하나 (사이드바 기록 메뉴)
tags: [Spring, DB]
summary: 목록에 보일 한 줄 설명
cover: DB → outbox → Kafka   # 목록 오른쪽 썸네일 문구 (선택)
draft: true   # 넣으면 사이트에 안 보여요 (선택)
---

본문은 마크다운으로 씁니다.
```

## 수정 위치

| 내용 | 파일 |
| --- | --- |
| 이름, 사이드바 소개, 경력, 학력, 자격증 | `lib/profile.ts` |
| 홈 소개 (인사말, MBTI, 좋아하는 것, 키워드) | `lib/profile.ts`의 `about` |
| 프로필 사진 | `public/profile.jpg` |
| 이력서 PDF (사이드바 메뉴) | `public/resume.pdf` |
| 포트폴리오 PDF (사이드바 메뉴) | `public/portfolio.pdf` |
| 프로젝트 상세 | `content/projects/*.md` |
| 실무 설계 상세 (Experience 페이지) | `content/projects/cloudlab.md` |
| 블로그 글 | `content/posts/*.md` |
| 디자인 | `app/globals.css` |

## Vercel 배포

1. 이 폴더를 GitHub 저장소로 올립니다
2. vercel.com에서 Add New → Project → 저장소 선택 → Deploy
3. 이후에는 GitHub에 push할 때마다 자동으로 배포됩니다

## 다이어그램

글이나 프로젝트 본문에 ```` ```mermaid ```` 코드 블록을 쓰면 그림으로 그려집니다 (ERD, 흐름도 등). 예시는 `content/projects/palette.md`의 ERD 섹션을 보세요.

## 방문 통계

Vercel Analytics가 연결돼 있습니다. Vercel 대시보드에서 프로젝트 → **Analytics** 탭 → **Enable**을 한 번 눌러야 수집이 시작됩니다. 방문자 수, 페이지별 조회수, 유입 경로를 볼 수 있고, 사이트 화면에는 표시되지 않습니다.
