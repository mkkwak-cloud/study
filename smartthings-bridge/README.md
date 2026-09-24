# smartthings-bridge

`home-assistant/` 허브를 거치지 않고, SmartThings에 등록된 기기를
[`tablet-ui`](../tablet-ui)가 직접 제어할 수 있게 해주는 작은 백엔드다.
Node.js + TypeScript + Express, OAuth 2.0으로 SmartThings API에 연결한다.

**왜 필요한가**: SmartThings API는 브라우저에서 직접 호출하면 Client
Secret이 노출된다. 이 서버가 그 비밀값과 access/refresh token을 안전하게
들고 있고, `tablet-ui`는 이 서버에만 요청을 보낸다.

**설정 방법**: [`SETUP.md`](./SETUP.md) — SmartThings 개발자 계정에서
OAuth 앱 등록하는 법부터 로컬 실행까지.

## 구조

```
smartthings-bridge/
  src/
    config.ts            # 환경변수 로딩/검증
    tokenStore.ts         # OAuth 토큰 파일 저장(gitignore 대상)
    smartthingsAuth.ts    # OAuth 인가 URL, 코드 교환, 자동 refresh
    smartthingsClient.ts  # 인증된 SmartThings API 호출 래퍼
    rateLimiter.ts         # 기기당 분당 12회 제한 큐(NFR-05)
    routes/
      auth.ts              # /auth/login, /auth/callback, /auth/status
      devices.ts           # /api/devices, .../status, .../commands
    server.ts              # Express 앱 진입점
```

## 실행

```bash
npm install
cp .env.example .env   # 값 채우기 — SETUP.md 참고
npm run dev             # http://localhost:4310
```

## 이 저장소의 다른 경로와의 관계

이 프로젝트는 [`home-assistant/`](../home-assistant)와 **양자택일이
아니라 병행**할 수 있는 경로다. 지금은 SmartThings만 빠르게 검증하고,
LG/구글 기기가 늘어나거나 로컬/오프라인 제어가 필요해지면
`home-assistant/SETUP_GUIDE.md`로 확장하는 흐름을 상정한다
(`docs/iot-integration-system-prd.md` 10장 "A+C 하이브리드" 참고).
