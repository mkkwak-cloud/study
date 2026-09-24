# 태블릿 키오스크 UI (독립 실행형 목업)

[`../docs/iot-integration-system-prd.md`](../docs/iot-integration-system-prd.md) 7장(UX)과
10장 "A+C 하이브리드"(1단계 HA 기본 대시보드 → 2단계 자체 프론트엔드)에서 언급한
자체 프론트엔드의 선행 구현이다. 오픈 이슈(Q1/Q2/Q4/Q6)는
[`../docs/ASSUMPTIONS.md`](../docs/ASSUMPTIONS.md) 의 샘플 값으로 임시 확정하고
개발을 진행 중이며, 실제 HA 백엔드 연동은 아직 하지 않았으므로 **이 앱은 벽걸이
태블릿(가로)과 휴대용 태블릿/폰(세로) 모두에서 제어 흐름과 화면 구성을 먼저 검증
하기 위한 UI 전용 목업**이다. 목(mock) 스토어가 실제 기기 상태를 대신하며,
`src/data/homeStore.ts` 하나만 HA WebSocket API 클라이언트로 교체하면 나머지
컴포넌트는 그대로 쓰도록 설계했다.

하단 네비게이션(홈/기기/설정), 방 필터 칩("모든 기기" 등), 아이콘 배지 카드
스타일은 삼성 SmartThings 앱의 UI 패턴을 참고해 다듬었다.

## 스택

`../package.json` 루트 앱과 동일한 구성: React 19 + TypeScript + Vite 8 +
Tailwind CSS 4 + oxlint.

## 실행

**빠른 실행(권장)** — 빌드 + 정적 서버 기동 + 브라우저 자동 실행을 한 번에:

```bash
./run.sh          # macOS/Linux (기본 포트 4173, PORT=8080 ./run.sh 로 변경 가능)
run.bat           # Windows
```

**개발 중 수동 실행**:

```bash
npm install
npm run dev       # http://localhost:5173 (HMR 개발 서버)
npm run build     # 타입체크 + 프로덕션 빌드
npm run preview   # 빌드 결과물을 정적 서버로 미리보기
npm run lint
```

## 구현 범위와 PRD 대응

| PRD 항목 | 구현 위치 | 비고 |
|---|---|---|
| UX-03 확장 (반응형: 가로·세로 모두 지원) | `src/index.css` `.device-grid`, `BottomNav.tsx`, `SceneButtons.tsx` | 벽걸이(가로)뿐 아니라 세로 화면에서도 동작하도록 확장. auto-fill 그리드(세로 2열~가로 7열)와 하단 네비게이션으로 폭에 따라 자연스럽게 흐름 |
| UX-04 (터치 타깃 ≥48dp, 씬 버튼 ≥96dp) | `SceneButtons.tsx`(h-24=96px), `.touch-target` 유틸리티 | |
| UX-05 (다크 모드 기본) | `src/index.css` | 고대비 테마(P1)는 범위 밖 |
| UX-06 (화면 절전/스크린세이버) | `useIdleTimer.ts`, `IdleOverlay.tsx` | 데모 60초. 실제 밝기 제어는 태블릿 OS/키오스크 앱 몫 |
| UX-07 (2탭 이내 주요 제어) | `SceneButtons.tsx` | 씬은 1탭으로 실행 |
| UX-08 (색+아이콘 상태 표현) | `device-cards/*` | 상태 텍스트 색상 + 이모지 아이콘 병기 |
| UX-09 (즉각 피드백/진행/실패 사유) | `DeviceCardShell.tsx`, `homeStore.ts`(commit) | 낙관적 업데이트 + 지연 시뮬레이션 + 인위적 실패율로 실패 케이스 재현 |
| UX-10 (고위험 기기 확인 절차) | `DeviceDetailView.tsx` | 카드 탭 → 상세화면 진입 → 토글 시 `window.confirm` 확인, 두 단계 진입이 길게 누르기를 대신함. 실제 배포 시 PIN 입력 다이얼로그로 교체 검토 |
| UX-12 (연결 끊김 배너) | `StatusBar.tsx` | 배너는 상단 고정, 데모 트리거 버튼은 설정 탭으로 이동 |
| FR-10/11/13 (홈/기기/씬 뷰) | `HomeView.tsx`, `DevicesView.tsx`, `BottomNav.tsx` | 방 탭 대신 하단 네비게이션(홈/기기/설정) + 기기 탭 안의 방 필터 칩 구조로 개편(삼성 SmartThings 앱의 하단 탭·"모든 기기" 필터 참고) |
| FR-11 확장 (기기 선택 → 상세 조절 화면) | `DeviceDetailView.tsx`, `DeviceCardShell.tsx`, `App.tsx` | 방 그리드의 카드는 요약 타일(아이콘 배지+이름+상태, `›` 표시)이고, 탭하면 전체화면 상세로 이동해 슬라이더/모드 선택 등 세부 컨트롤을 제공 |
| FR-12 (기기 유형/방별 필터) | `DeviceFilterChips.tsx`, `DevicesView.tsx` | "모든 기기" + 방별 칩. 모든 기기 보기에서는 카드에 방 이름을 함께 표시 |
| FR-01/FR-02 확장 (신규 기기 추가) | `AddDeviceModal.tsx`, `homeStore.ts` `addDevice()` | 기기 탭 상단 `+` 버튼(SmartThings 참고) → 이름/방/종류(가전이면 세부 종류+고위험 여부)/연결경로 입력 폼 → 즉시 그리드에 반영. 실제 연동 시에는 벤더 통합의 자동 기기 발견(mDNS/SSDP/DHCP, config flow)으로 대체되는 자리 |
| FR-14 (연결성 표시) | `DeviceCardShell.tsx`/`DeviceDetailView.tsx` 연결 점·배지 (로컬/클라우드) | |
| FR-21 (낙관적 상태 + 롤백) | `homeStore.ts` `commit()` | |
| FR-22 (고위험 기기 원격 시작 우회 금지) | `DeviceDetailView.tsx` | 세탁기/건조기/식기세척기는 상태 표시만. 인덕션(고위험)은 상세 화면에서 `window.confirm` 확인 후에만 토글 가능 |
| FR-20 확장 (로봇청소기 원격 시작) | `VacuumCard.tsx`, `homeStore.ts` `startCleaning/pauseCleaning/returnVacuumToDock` | `appliance` 도메인과 별도의 `vacuum` 도메인. 세탁기 등과 달리 원격 시작이 표준 기능이라(FR-22 예외) 확인 절차 없이 바로 시작/일시정지/충전독 복귀 가능 |
| FR-40/41/43 (씬/모드) | `homeStore.ts` `setHouseMode()` | `home-assistant/config/packages/scenes_core.yaml` 의 로직을 그대로 옮김 |
| §4.3 (위치 피드백 없는 커버) | `types/home.ts` `CoverDevice.position`(number \| null), `CoverCard.tsx` | C5(IR/RF) 케이스 대비 |

## 아직 하지 않은 것

- **실제 데이터 연동** — 전부 `src/data/initialDevices.ts` 목 데이터. HA
  WebSocket API 연동은 실제 기기가 확정된 뒤 진행한다(현재는 샘플 인벤토리 기준).
- **역할별 접근 제어(FR-80~83)** — 관리자/일반/어린이/게스트 구분 없음.
  현재는 모든 사용자가 모든 조작 가능(단, 고위험 기기는 길게 누르기+확인만 적용).
- **관리 화면 PIN(FR-82)** — Lovelace 쪽과 동일하게 아직 미해결.
- **에너지 모니터링(FR-70~73), 공휴일 스케줄(FR-51), 음성 노출(FR-90~93)** — PRD
  M3(P1) 이후 범위.
- **PWA/키오스크 설치** — `manifest.json`, Service Worker, 화면 회전 잠금 등은
  실제 탭북 도입 후 추가한다(샘플: Galaxy Tab A9+).

## 다음 단계

1. 실제 기기가 `docs/ASSUMPTIONS.md` 샘플과 다르면 그 문서와
   `home-assistant/config/inventory/inventory.yaml.example` 을 먼저 갱신.
2. `src/data/homeStore.ts` 를 HA WebSocket API(`@home-assistant/js-websocket`
   등) 클라이언트로 교체. `commit()` 이 하던 낙관적 업데이트/롤백 로직은
   HA의 `result`/`event` 응답 처리로 대체한다.
3. FR-80~83 역할 기반 접근 제어와 FR-82 관리자 PIN 게이트 추가.
