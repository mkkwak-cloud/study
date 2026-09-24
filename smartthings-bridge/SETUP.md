# SmartThings 직접 연동 — 설정 가이드

`home-assistant/` 허브를 거치지 않고, `tablet-ui`가 이 작은 백엔드를 통해
SmartThings API에 직접 붙는 경로다. 하드웨어(미니PC/HA Green 등) 없이
지금 바로 시작할 수 있다. 대신 **SmartThings에 등록된 기기만** 제어할 수
있고(LG/구글 기기는 범위 밖), 로컬 오프라인 제어는 안 된다(전부 클라우드
경유) — 이 트레이드오프는 대화에서 이미 합의된 내용이다.

> ⚠️ **2026년 10월부터 유료**: SmartThings API를 직접 호출하는 앱을
> 만드는 순간(이 프로젝트가 정확히 그 경우) 삼성의 "비상업적 개인
> 개발자" 요금제(월 $4.99) 대상이다. 공식 SmartThings 앱만 쓰는 건
> 무료로 남지만, 그건 이 프로젝트의 목표(자체 UI)와 맞지 않는다.

---

## 1. SmartThings 개발자 계정 + OAuth 앱 등록

1. https://developer.smartthings.com/workspace 에서 삼성 계정으로 로그인.
2. **API 전용 앱(API-only Integration)** 생성 — SmartApp이 아니라
   "API Access" 타입을 선택한다(디바이스에 설치되는 앱이 아니라, 순수
   서버-투-서버 OAuth 클라이언트).
3. 앱 등록 화면에서:
   - **Redirect URI**: 로컬 테스트 시 `http://localhost:4310/auth/callback`
     (포트를 바꾸면 `.env`의 `SMARTTHINGS_REDIRECT_URI`도 같이 바꾼다)
   - **Scopes**: 최소 `r:devices:*`, `x:devices:*`, `r:locations:*`
     (기기 조회 + 제어 + 위치 조회. `config.ts`의 `scopes` 배열과 일치해야 한다)
4. 등록 완료 후 발급되는 **Client ID**, **Client Secret**을 복사해 둔다.
   (Client Secret은 재발급 전까지 다시 보여주지 않으니 안전한 곳에 저장)

---

## 2. 로컬 실행

```bash
cd smartthings-bridge
npm install
cp .env.example .env
# .env 를 열어 SMARTTHINGS_CLIENT_ID / SMARTTHINGS_CLIENT_SECRET 채우기

npm run dev
```

`smartthings-bridge listening on http://localhost:4310` 이 뜨면 준비 완료.

## 3. 계정 연결 (최초 1회)

브라우저에서 `http://localhost:4310/auth/login` 접속 → 삼성 계정 로그인 →
권한 동의 화면에서 허용 → `SmartThings 계정 연결 완료` 메시지가 뜨면 성공.

이때 발급된 access/refresh token은 `smartthings-bridge/tokens.json`에
저장된다(이 파일은 `.gitignore` 대상 — **절대 커밋되지 않는다**, NFR-20).
access token이 만료되면(보통 24시간) 서버가 refresh token으로 자동
갱신한다 — PAT와 달리 매일 재로그인할 필요 없다.

## 4. 연결 확인

```bash
curl http://localhost:4310/auth/status
# {"connected":true}

curl http://localhost:4310/api/devices
# 실제 등록된 기기 목록(JSON)
```

기기 목록이 실제로 나오면 연동 완료. 이제 `tablet-ui`가 이 서버를 바라보게
연결하는 작업(다음 단계)으로 넘어갈 수 있다.

---

## API 요약

| 엔드포인트 | 설명 |
|---|---|
| `GET /auth/login` | SmartThings 로그인 화면으로 리다이렉트 |
| `GET /auth/callback` | OAuth 콜백 (직접 호출하지 않음) |
| `GET /auth/status` | 연동 여부 확인 |
| `GET /api/devices` | 전체 기기 목록 |
| `GET /api/devices/:id/status` | 기기 상태 조회 |
| `POST /api/devices/:id/commands` | 명령 전송 (`{"commands":[{"capability":"switch","command":"on"}]}`) |

명령/상태 조회는 기기별로 분당 12회 제한(NFR-05)을 넘지 않도록
`rateLimiter.ts`에서 자동으로 큐잉된다 — 앱 쪽에서 별도로 신경 쓸 필요 없다.

## 다음 단계

- [ ] `tablet-ui/src/data/homeStore.ts`를 이 백엔드 호출로 교체(현재는 mock)
- [ ] 실제 기기 목록을 보고 `docs/ASSUMPTIONS.md` 샘플 인벤토리를 실제 값으로 갱신
- [ ] LG/구글 기기가 생기면 `home-assistant/` 경로로 확장 검토(SETUP_GUIDE.md 참고)
