---
title: Let's Encrypt로 팔레트에 HTTPS 붙이기
date: 2026-11-11
category: BackEnd
tags: [HTTPS, Nginx, Let's Encrypt, 팔레트]
cover: 80 → 443 · Let's Encrypt
summary: 인증서 발급부터 http → https 전환, 90일마다 돌아오는 자동 갱신과 실패 알림까지
---

팔레트는 처음에 http로만 서비스했습니다. 그런데 기능이 늘수록 https가 꼭 필요해졌습니다.

- **배송 웹훅**: 배송 추적에 쓰는 Delivery Tracker는 https 주소로만 콜백을 보냅니다
- **로그인 쿠키**: 인증 쿠키에 `Secure`를 붙여 https에서만 오가게 하려면 https가 먼저 있어야 합니다
- **결제와 개인정보**: 예치금 충전, 주소, 연락처가 오가는 서비스라 평문 통신은 둘 수 없었습니다

그래서 무료 인증서인 **Let's Encrypt**로 Nginx에 HTTPS를 붙였습니다. 팀에서 함께 적용한 내용을 정리한 기술 노트입니다.

## 세 번에 나눠 붙인 이유

Nginx는 설정에 적힌 인증서 파일이 없으면 **아예 시작하지 않습니다.** 인증서가 없는 상태에서 443 설정부터 넣으면 서버 전체가 멈출 수 있어서, 순서를 세 단계로 나눴습니다.

발급 확인 경로 열기 → 인증서로 443 열기 → http를 https로 넘기기

| 단계 | 한 일 |
| --- | --- |
| 1. 발급 준비 | 80에서 발급 확인 경로(`/.well-known/acme-challenge/`)를 열어 두고, 서버에서 certbot으로 인증서를 발급 |
| 2. 443 열기 | 발급된 인증서로 443(ssl)을 열고 TLS 설정 |
| 3. https로 전환 | 80은 443으로 301 이동(발급 확인 경로만 예외), HSTS 추가, 쿠키 `Secure`와 CORS를 https 기준으로 변경 |

## Nginx 설정

```nginx
# 80: 인증서 확인 경로만 http로 답하고, 나머지는 https로 넘긴다
server {
    listen 80;
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    http2 on;
    ssl_certificate     /etc/letsencrypt/live/palette-shop.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/palette-shop.duckdns.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    add_header Strict-Transport-Security "max-age=300" always;
    ...
}
```

- **발급 확인 경로는 예외**: Let's Encrypt는 도메인 주인인지 확인하려고 http로 파일을 가져갑니다. 처음 발급할 때와 90일마다 갱신할 때 모두 http로 오기 때문에 이 경로만은 https로 넘기지 않습니다
- **약한 방식 차단**: TLS 1.0·1.1은 받지 않고 1.2·1.3만 허용했습니다
- **HTTP/2**: https에서는 한 연결로 여러 요청을 동시에 보내 화면 파일을 빨리 받습니다
- **HSTS는 짧게 시작**: 브라우저에 "앞으로 https로만 접속하라"고 알리는 HSTS는 잘못 설정하면 되돌리기 어렵습니다. 그래서 처음에는 5분만 기억하게 하고, 문제가 없으면 1년으로 늘리기로 했습니다
- **인증서 경로 고정**: `live/` 아래 파일은 갱신될 때마다 최신 인증서를 가리키므로, 갱신해도 Nginx 설정은 바꾸지 않습니다

## 인증서는 Docker 볼륨으로 나눠 갖기

certbot이 서버의 `/etc/letsencrypt`에 인증서를 저장하고, Nginx 컨테이너는 그 폴더를 **읽기 전용**으로 연결했습니다. 발급 확인 파일을 두는 폴더도 certbot은 쓰고 Nginx는 읽기만 합니다. 역할이 섞이지 않게 쓰는 쪽과 읽는 쪽을 나눴습니다.

## 90일마다 돌아오는 갱신을 자동으로

Let's Encrypt 인증서는 90일짜리라 갱신을 잊으면 서비스가 바로 막힙니다. 서버 cron이 매일 04:30에 갱신 스크립트(`renew-cert.sh`)를 돌립니다.

인증서 갱신 확인 → 바뀌었으면 Nginx reload → 남은 기간 확인 → 문제면 Slack 알림

- **매일 돌려도 안전**: certbot은 만료 30일 전부터만 실제로 갱신하므로 매일 실행해도 됩니다
- **멈추지 않고 갱신**: Nginx를 끄지 않고 webroot 방식으로 갱신하고, 인증서가 바뀌었을 때만 `nginx -s reload`로 접속을 끊지 않고 새 인증서를 읽게 했습니다
- **갱신 여부 판단**: 갱신 전후에 `live` 인증서가 가리키는 실제 파일을 비교해 바뀌었는지 확인합니다
- **실패 알림**: 갱신이 실패하거나 만료까지 20일 이하로 남으면 팀 Slack 채널로 알림을 보냅니다. 정상이라면 30일 전에 갱신되므로, 20일 이하라는 건 뭔가 잘못됐다는 뜻입니다
- **연습 실행**: `--dry-run`으로 실제 발급이나 알림 없이 미리 확인할 수 있게 했습니다

## 정리

| 고민 | 선택 |
| --- | --- |
| 인증서 없이 443을 열면 Nginx가 안 뜬다 | 발급 → 443 → 전환, 세 단계로 나눠 적용 |
| 갱신할 때도 http 확인이 필요하다 | 발급 확인 경로만 301 예외 |
| HSTS는 되돌리기 어렵다 | 5분으로 시작해 확인 후 1년으로 |
| 90일마다 만료된다 | 매일 cron 갱신, 바뀌었을 때만 reload |
| 갱신 실패를 늦게 알면 서비스가 멈춘다 | 실패나 20일 이하면 Slack 알림 |

HTTPS를 붙인 덕분에 Delivery Tracker 웹훅도 받을 수 있게 됐습니다. 배송 추적 연동은 [Delivery Tracker 글](/blog/delivery-tracker)에 정리했습니다.
