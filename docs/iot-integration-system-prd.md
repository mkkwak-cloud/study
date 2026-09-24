# PRD: 가정용 멀티브랜드 IoT 통합 관리 시스템 (태블릿 월패드)

| 항목 | 내용 |
|---|---|
| 문서 버전 | v0.9.1 (Draft, 아키텍처 설계 입력용) |
| 작성일 | 2026-09-24 (최초), 2026-09-24 갱신(오픈 이슈 일부 확정 반영) |
| 작성 | 제품 기획 에이전트 (Senior PM) |
| 대상 독자 | 아키텍처 설계 에이전트, 시스템 소유자(가정 관리자) |
| 상태 | 오픈 이슈(12장) 확인 후 v1.0 확정 — Q1(커튼 통신방식)/Q2(탭북 OS)/Q4(기존 허브 보유) 부분 해소 |

> 표기 규칙: **[확인 필요]** = 공식 자료로 확정하지 못했거나 사용자 환경에 따라 달라지는 사항. 아키텍처 설계 시 가정(assumption)으로 다루고 검증 태스크를 둘 것.

---

## 1. 개요 / 배경 / 문제정의

### 1.1 개요
집 안의 Samsung(SmartThings), LG(ThinQ), Google(Google Home/Nest) 기기와 전동커튼 IoT 단말을 **하나의 로컬 허브**로 모으고, 벽걸이 **태블릿(“탭북”)** 을 상시 켜진 통합 제어 화면(월패드)으로 쓰는 개인 가정용 DIY 시스템을 구축한다.

### 1.2 배경
- 가정 내 기기가 브랜드마다 다른 앱/클라우드에 등록돼 있다: SmartThings 앱, LG ThinQ 앱, Google Home 앱, 커튼 제조사 앱(예: Tuya 계열 앱 등).
- 사용자는 자동차 전장/SW 엔지니어다. 네트워크, 리눅스, 컨테이너, YAML/스크립트, 프로토콜 문서를 직접 다룰 수 있으므로 **오픈소스 허브 + 설정/코드 기반 구성**이 가능하다.
- 2026년 현재 외부 환경 변화:
  - Samsung은 **2026년 10월부터 SmartThings API의 무료 비상업 이용을 종료**하고 개인 개발자 플랜(월 $4.99)을 도입한다고 발표했다(2026-06-23 공지). 한국 적용 여부, 요금, 쿼터 등 세부 조건은 **[확인 필요]**.
  - Google은 Nest 스피커/디스플레이의 Google Assistant를 **Gemini for Home**으로 전환하는 중이다. 한국어/한국 지역 지원 시점은 **[확인 필요]**.
  - Matter가 성숙해졌다. Home Assistant는 2026-06에 matter.js 기반 Matter Server(Matter 1.5.1, Thread 1.4 OTBR)로 전환했다.

### 1.3 문제정의

| # | 문제 | 영향 |
|---|---|---|
| P1 | 브랜드별 앱을 오가야 함 (앱 3~4개) | 제어 시간 증가, 가족 구성원 사용 장벽 |
| P2 | 브랜드를 가로지르는 자동화가 어렵거나 기능이 제각각 | 예: “LG 에어컨 켜지면 커튼 닫기”를 한 곳에서 만들 수 없음 |
| P3 | 대부분 클라우드 경유라 인터넷 장애나 서비스 정책 변경(유료화, API 폐지)에 취약 | 가용성 저하, 비용 발생 위험 |
| P4 | 집 전체 상태(열린 커튼, 켜진 가전, 에너지)를 한눈에 볼 곳이 없음 | 외출/취침 전 확인이 번거로움 |
| P5 | 어린이/고령자가 쓰기에 스마트폰 앱은 복잡하고 개인 계정이 필요함 | 공용 제어 수단 부재 |

---

## 2. 목표 & 비목표, 성공지표

### 2.1 목표 (Goals)
- G1. 가정 내 IoT 기기를 하나의 허브에 등록하고, 태블릿 UI 한 곳에서 **조회, 제어, 자동화**한다.
- G2. **로컬 우선(local-first)**: 로컬 제어가 가능한 기기는 인터넷 없이 동작하게 한다.
- G3. 브랜드를 가로지르는 씬/자동화(외출, 취침, 아침 커튼 등)를 제공한다.
- G4. 가족 구성원 누구나(어린이, 고령자 포함) 쓸 수 있는 단순한 벽걸이 UI를 제공한다.
- G5. 신규 브랜드/기기를 추가할 때 코어를 수정하지 않는 **플러그인형 연동 구조**로 만든다.

### 2.2 비목표 (Non-Goals)
- NG1. 상용 제품화, 다가구/다세대 지원, 앱스토어 배포.
- NG2. 브랜드 앱을 완전히 대체하는 것. 펌웨어 업데이트, 초기 Wi-Fi 등록, 제조사 전용 고급 기능(예: 세탁 코스 다운로드)은 브랜드 앱에 남긴다.
- NG3. 자체 음성비서 엔진 개발. 기존 Google/Bixby/ThinQ 음성과 공존만 한다.
- NG4. 보안 CCTV의 NVR급 녹화/관제. 카메라는 스트림 조회 정도만 P2로 둔다.
- NG5. 아파트 월패드(단지 홈네트워크: 조명/난방/가스 등) 연동. 필요하면 별도 검토하며 오픈 이슈로 남긴다.

### 2.3 성공지표 (KPI)

| ID | 지표 | 목표치 | 측정 방법 |
|---|---|---|---|
| K1 | 기기 커버리지: 확정 인벤토리 중 허브에서 **제어 가능한** 기기 비율 | MVP ≥ 80%, 확장 단계 ≥ 95% | 인벤토리 표와 허브 엔티티 대조 |
| K2 | 로컬 경로 제어 지연: 터치 → 기기 동작 명령 수신(허브 로그 기준) | p95 ≤ 300 ms | 허브 이벤트 타임스탬프 |
| K3 | 로컬 경로 상태 반영: 기기 상태 변화 → 태블릿 UI 반영 | p95 ≤ 1 s | 수동/자동 측정 스크립트 |
| K4 | 클라우드 경로 제어+반영 (SmartThings/ThinQ/SDM) | p95 ≤ 3 s, p99 ≤ 5 s (클라우드 SLA 밖이므로 목표치) | 동일 |
| K5 | 허브 가용성 (월간) | ≥ 99.5% (월 약 3.6시간 이내 중단) | 외부 헬스체크/Uptime 모니터 |
| K6 | 인터넷 단절 시 로컬 기기 제어 성공률 | 100% (로컬 경로로 분류된 기기) | WAN 차단 테스트 (분기 1회) |
| K7 | 자동화 실행 신뢰도 (스케줄/트리거 실행 성공) | ≥ 99% (월간, 외부 클라우드 오류 제외 시) | 자동화 trace/로그 |
| K8 | 브랜드 앱 사용 빈도 감소 | 일상 제어의 90% 이상을 태블릿 또는 허브에서 처리 (자기보고) | 월 1회 가족 설문 |
| K9 | 복구 시간 (허브 SD/SSD 고장 → 백업 복원) | ≤ 60분 (RTO), 데이터 손실 ≤ 24시간 (RPO) | 반기 1회 복원 리허설 |

> **2026-09-24 갱신:** 전동커튼의 통신방식이 BLE+Wi-Fi로 확정됨에 따라(§4.1, §4.3), BLE 구간이 로컬 제어를 지원하는 모델이면 커튼도 K2/K3/K6(로컬 경로 지연·상태반영·오프라인 제어)의 측정 대상에 포함한다. Wi-Fi 경유 클라우드 의존 모델로 확인되면 K4(클라우드 경로) 기준을 적용한다. 브랜드/모델 확인(오픈 이슈 Q1) 후 확정한다.

---

## 3. 사용자 / 페르소나

| 페르소나 | 설명 | 역할/권한 | 주요 니즈 | UI 고려 |
|---|---|---|---|---|
| **관리자 (사용자 본인)** | 전장/SW 엔지니어, 시스템 구축/운영 담당 | Admin: 기기 등록, 자동화 편집, 통합/토큰 관리, 백업 | 디버깅 가능한 로그, 설정의 코드화(Git), 원격 관리 | 관리 화면은 PC/모바일 중심, 태블릿에서는 숨김 |
| **배우자/성인 가족** | 일반 사용자, 기술 관심 보통 | User: 모든 기기 제어, 씬 실행, 개인 알림 설정 | 빠른 제어, 외출/취침 원터치 | 방별 카드, 씬 버튼 |
| **어린이** | 초등학생 이하 가정 | Restricted: 조명/커튼/TV 등 허용 목록만 | 쉬운 조작, 위험 기기(오븐/인덕션 등) 접근 차단 | 아이콘 위주, 큰 버튼, 잠금 영역 |
| **고령자 (방문/동거 부모님)** | 스마트폰 앱 사용이 익숙하지 않음 | User 또는 Restricted | 글자 크고 단순한 화면, 실수 방지 | 고대비/대형 글꼴 모드, 확인 다이얼로그 최소화(단, 위험 동작은 확인) |
| **게스트/도우미** | 가사도우미, 손님 | Guest: 한정 기간, 한정 기기 | 조명, 에어컨 정도 | 게스트 모드(PIN 또는 시간 제한) |

- 태블릿은 공용 기기이므로 **기본은 “가족 공용 세션”** 으로 두고, 관리 기능은 PIN이나 관리자 인증 뒤에 둔다.
- 개인별 알림(스마트폰 푸시)은 사용자 계정 단위로 구분한다.

---

## 4. 기기 인벤토리 가정

### 4.1 가정 인벤토리 표 (실제 목록 미확정, 대표 카테고리 기준)

> 경로 표기: **L** = 로컬(LAN/Zigbee/Thread/BLE), **C** = 클라우드, **L/C** = 모델에 따라 다름. “1차 경로”는 권장, “대안”은 폴백.

| 브랜드 | 대표 기기 카테고리 | 1차 연동 경로 (권장) | 대안 경로 | 로컬/클라우드 | 비고 |
|---|---|---|---|---|---|
| Samsung | TV (Tizen) | HA `samsungtv` 통합 (LAN WebSocket) | SmartThings API | L (전원 ON은 WoL 등 제약, 모델별 [확인 필요]) | 로컬 통합은 SmartThings 유료화와 무관하게 동작 |
| Samsung | 가전: 냉장고, 세탁기/건조기, 에어컨, 로봇청소기, 공기청정기 | SmartThings API (HA `smartthings` 통합, Cloud Push) | 일부 Matter 지원 모델 → Matter; 스마트플러그 전력 감지 | C | **2026-10부터 API 유료(월 $4.99) 예정.** Matter 지원 삼성 가전을 HA에 직접 커미셔닝하는 것은 현재 제한적이라는 보고가 있음 [확인 필요] |
| Samsung | SmartThings 허브(스테이션) 및 연결된 Zigbee/Z-Wave/Matter 기기 | Matter 멀티어드민 또는 허브에서 기기 이관 | SmartThings API | L/C | **허브(스테이션) 보유 확정**. 정확한 모델(세대, Thread BR 지원 여부)은 확인 필요(Q4) |
| LG | TV (webOS) | HA `webostv` 통합 (LAN) | ThinQ Connect API | L | 최초 페어링 시 TV 화면에서 승인 필요 |
| LG | 가전: 에어컨, 세탁기/건조기, 냉장고, 스타일러, 식기세척기, 공기청정기, 로봇청소기 | **ThinQ Connect API** (공식 개방 API, PAT 인증, MQTT 이벤트) → HA `lg_thinq` 통합 | Matter 지원 모델 [확인 필요]; 스마트플러그 전력 감지 | C | 구형(legacy) 모델은 상태 이벤트 5분 주기, 에너지 데이터는 전일까지만 |
| LG | ThinQ ON 등 LG 허브 | Matter 멀티어드민 [확인 필요] | – | L/C | 보유 여부 [확인 필요] |
| Google | Nest 스피커/디스플레이 (**보유 확정**, 정확한 기종 확인 필요) | HA `cast` 통합 (LAN, 미디어/TTS) | – | L | 음성 비서로서는 “공존” 대상. **Nest Hub 2세대/Hub Max라면 Thread Border Router로 재사용 가능**(정확한 기종에 따라 갈림, Q4) |
| Google | Chromecast / Google TV | HA `cast` / Android TV Remote 통합 | – | L | |
| Google | Nest 온도조절기, Nest 카메라/도어벨 | **SDM API (Device Access)**, 1회 $5, Pub/Sub 푸시 → HA `nest` 통합 | – | C | 소비자(gmail) 계정만, Workspace 계정 불가. 연기/CO 경보기는 미지원 |
| Google | Google Home 앱에 등록된 타사 기기 | 해당 기기를 **원래 제조사 경로나 Matter로 직접** 연동 | Google Home APIs (Android/iOS 앱 SDK) | – | **Google Home APIs는 모바일 SDK 전용이라 서버/허브용 REST API가 없음.** 허브 백엔드의 1차 경로로 쓸 수 없음 |
| 커튼 | 전동커튼 IoT 단말 (**통신방식 확정: BLE+Wi-Fi**, 제조사/모델 확인 필요) | 4.3절 C3(Wi-Fi 경유)/C4(BLE 직접) 우선 검토 | SmartThings 경유(기존 스테이션 보유, 4.3 C7) | BLE 구간 L / Wi-Fi 구간 C (모델별 상이) | 통신방식 확정. 제조사/모델 확인이 남은 최우선 과제(오픈 이슈 Q1) |
| 제어단말 | 벽걸이 태블릿(“탭북”), **OS: Android(확정)** | HA Companion 앱 또는 키오스크 브라우저(7장 UX-01) | – | L | 정확한 기종·화면 크기·설치 위치는 확인 필요(오픈 이슈 Q2) |
| (공통) | 스마트플러그(전력계량), 온습도/문열림/재실 센서 | Zigbee(Zigbee2MQTT/ZHA) 또는 Matter-over-Thread | – | L | 에너지 모니터링과 “비스마트 가전 상태 추정”용으로 추가 구매 권장 (P1) |

### 4.2 실제 기기 목록 확정 체크리스트
관리자가 기기마다 아래 항목을 채운다(스프레드시트 또는 `inventory.yaml`). 아키텍처 에이전트는 이 스키마를 연동 매핑 입력으로 사용한다.

> **2026-09-24 갱신 — 확정된 사항 체크:**
> - [x] 항목 4 (통신 방식) — 커튼: **BLE + Wi-Fi 확정**
> - [x] 항목 6 (현재 연결된 허브) — **SmartThings 허브(스테이션) 보유 확정**, **Google Nest 기기 보유 확정**
> - [x] 제어단말(탭북) OS — **Android 확정**
> - [ ] 항목 1 (브랜드/모델명) — 커튼의 정확한 제조사/모델 확인 필요
> - [ ] 탭북의 정확한 기종/모델·화면 크기 확인 필요
> - [ ] SmartThings 스테이션 정확한 모델, Google Nest 기기의 정확한 종류/세대 확인 필요 (Nest Hub 2세대 여부가 Thread Border Router 보유를 가름)
> - [ ] 공유기 VLAN/다중 SSID 지원 여부 확인 필요

| # | 항목 | 예시 | 이유 |
|---|---|---|---|
| 1 | 브랜드 / 정확한 모델명 / 출시연도 | LG `DQ-...`, 2023 | ThinQ Connect 지원 여부, legacy 여부 판단 |
| 2 | 설치 위치(방) | 거실 | 대시보드 구성 |
| 3 | 현재 등록된 앱/계정 | ThinQ(가족 계정 A) | 토큰 발급 주체 결정 |
| 4 | 통신 방식 | Wi-Fi 2.4GHz / Zigbee / Thread / BLE / IR / RF433 | 로컬 경로 가능성 |
| 5 | Matter 로고/QR 유무, 펌웨어 버전 | Matter 1.2 | 멀티어드민 가능 여부 |
| 6 | 현재 연결된 허브 | SmartThings Station, Nest Hub 2세대 | 이관/브리지 전략 |
| 7 | 필수 기능 / 원하는 자동화 | “외출 시 전원 OFF” | 요구 대비 커버리지 |
| 8 | 안전 등급 | 고위험(열원/잠금/가스) 여부 | 원격 제어 허용 정책 |
| 9 | 고정 IP/DHCP 예약 가능 여부, MAC | – | 로컬 통합 안정성 |
| 10 | 전력 측정 필요 여부 | 세탁기 완료 알림 | 스마트플러그 필요성 |

### 4.3 전동커튼 단말 연동 시나리오 (통신방식 확정: BLE+Wi-Fi / 제조사·모델 확인 필요)

> **확정 (2026-09-24):** 전동커튼은 **블루투스(BLE) + 와이파이** 조합으로 연동됨이 사용자에 의해 확인되었다. 정확한 제조사/모델은 아직 미상(오픈 이슈 Q1). 이 통신방식은 아래 **C3(Wi-Fi, 일부 모델은 초기 프로비저닝에 BLE 병행)** 또는 **C4(BLE 모터 + 별도 Wi-Fi 허브)** 패턴과 가장 부합한다. 한국 시장에서는 SwitchBot Curtain(BLE 모터 + Wi-Fi Hub) 또는 Tuya OEM BLE+Wi-Fi 듀얼모드 커튼에서 흔한 조합이나, 이는 정황상 추정이며 확정된 브랜드는 아니다. C1(순수 Matter)·C2(Zigbee)·C5(IR/RF)·C6(드라이 컨택트)는 확인된 통신방식과 맞지 않아 가능성이 낮다. 기존에 **SmartThings 허브(스테이션)가 설치되어 있음이 확인**되었으므로(§4.1, §9.2), 커튼이 이미 SmartThings 앱에 등록돼 있는지(C7)도 함께 확인한다.

| 경우 | 식별 단서 | 권장 연동 | 로컬 여부 | 위치값(%) 지원 | BLE+Wi-Fi 확정과의 부합도 | 주의 |
|---|---|---|---|---|---|---|
| C1. Matter (Wi-Fi 또는 Thread) | 본체/설명서에 Matter QR | HA Matter 통합에 직접 커미셔닝(또는 기존 생태계에서 멀티어드민 공유). Thread이면 OTBR 필요 | L | Matter WindowCovering 클러스터: 보통 지원 | 낮음 (Matter 로고/QR 없으면 해당 없음) | 여러 Thread 네트워크가 분리되지 않도록 설계(Thread 자격증명 공유) |
| C2. Zigbee (Aqara, Tuya Zigbee 등) | 전용 Zigbee 허브 필요 | USB Zigbee 코디네이터 + Zigbee2MQTT 또는 ZHA로 **재페어링** | L | 대부분 지원 | 낮음 (Zigbee 허브가 별도로 필요하며 BLE/Wi-Fi와는 다른 무선 프로토콜) | 기존 허브(SmartThings 등)에서 해제 후 재페어링 필요. 모델별 지원은 Zigbee2MQTT 기기 DB에서 [확인 필요] |
| C3. Wi-Fi Tuya 계열 (국내 Tuya OEM 브랜드 포함) | Smart Life/Tuya/OEM 앱 사용 | 1차: HA 공식 Tuya 통합(클라우드). 로컬화: `tuya-local`/`localtuya`(커스텀, 로컬 키 필요) | C 또는 L(커스텀) | 대체로 지원 | **높음** (Tuya 계열은 BLE+Wi-Fi 듀얼모드 모듈을 흔히 씀 — BLE는 대개 초기 프로비저닝, Wi-Fi는 상시 제어) | 로컬 키 추출에 Tuya IoT 개발자 계정 필요, 펌웨어 업데이트 시 프로토콜 변경 가능 |
| C4. BLE 봇형 (SwitchBot Curtain 등) | 레일/봉에 부착하는 모터 | HA SwitchBot(BLE) 통합 + BLE 프록시(ESPHome) | L | 지원 | **높음** (SwitchBot Curtain류는 모터↔BLE, 허브↔Wi-Fi 패턴으로 “블루투스+와이파이” 설명과 정확히 부합) | BLE 도달거리, 배터리 |
| C5. IR/RF(433MHz 등) 리모컨식 | 전용 리모컨만 있음 | IR/RF 블래스터(Broadlink, ESPHome) 학습 | L | **미지원(열기/닫기/정지만)**, 상태 피드백 없음 | 낮음 (RF433/IR은 BLE/Wi-Fi와 다른 무선방식) | 상태는 “추정 상태”로 표시해야 함 |
| C6. 유선 접점(드라이 컨택트) | 벽 스위치 연동형 | 릴레이 모듈(Shelly/ESPHome) | L | 시간 기반 추정 | 낮음 (유선 방식이라 BLE/Wi-Fi와 무관) | 전기공사 수반 가능, 안전 검토 |
| C7. SmartThings 연동형(Edge 드라이버 등) | SmartThings 앱에만 등록 | 가능하면 C1/C2로 이관, 아니면 SmartThings API 경유 | C (허브 로컬 실행이어도 외부 API 경로는 클라우드) | 기기별 | 중 (**기존 SmartThings 허브(스테이션) 보유 확정** — Wi-Fi 커튼이 SmartThings에 이미 등록돼 있을 가능성 있음) | 유료화 영향 받음 |
| C8. 아파트 월패드 연동 커튼 | 단지 월패드에서 제어 | 범위 밖(NG5), 별도 검토 | – | – | 낮음 | 제조사/단지별 상이 |

**요구:** 커튼 연동은 **L 경로(C1, C2, C4, C5, C6)** 를 우선한다. **통신방식이 BLE+Wi-Fi로 확정됨에 따라 C3과 C4를 최우선 검증 대상으로 한다.** BLE 구간이 로컬 직접 제어를 지원하면(C4) 우선 채택하고, Wi-Fi 경유 클라우드 의존형(C3)이면 `tuya-local`/`localtuya` 같은 로컬화 방법을 함께 검토한다(9.3 IR-07). 아키텍처는 “위치 피드백 없는 커버(C5)”를 UI와 자동화에서 구분해 처리할 수 있어야 한다.

---

## 5. 핵심 사용 시나리오 / 유저 스토리

| ID | 시나리오 | 유저 스토리 | 관련 기기 | 우선순위 |
|---|---|---|---|---|
| S1 | **외출 모드** | 가족으로서, 현관 앞 태블릿에서 “외출”을 누르면 조명, TV, 에어컨이 꺼지고 커튼이 닫히며, 켜져 있는 위험 가전 목록을 확인받고 싶다 | 전 브랜드 | P0 |
| S2 | **귀가 모드** | 마지막 가족이 귀가하면(스마트폰 재실 또는 도어 센서) 거실 조명이 켜지고 계절에 따라 냉난방이 켜지길 원한다 | 조명, 에어컨, 재실 | P1 |
| S3 | **취침 모드** | 잠들기 전 “취침”으로 모든 조명 OFF, 커튼 닫힘, TV OFF, 공기청정기 수면모드, 태블릿 화면 소등을 원한다 | 커튼, TV, 공기청정기 | P0 |
| S4 | **아침 커튼 자동 개방** | 평일 07:00(또는 일출 기준)에 침실 커튼이 서서히/부분(50%→100%) 열리길 원한다. 주말/공휴일은 제외 | 커튼 | P0 |
| S5 | **가전 완료 알림** | 세탁기/건조기/식기세척기 완료를 태블릿 배너와 스마트폰 푸시, Nest 스피커 음성으로 받고 싶다 | LG/Samsung 가전, Nest | P0(태블릿/푸시), P1(음성) |
| S6 | **에너지 모니터링** | 관리자로서 기기별/일별 전력 사용량과 대기전력 상위 기기를 보고 싶다 | ThinQ 에너지, 스마트플러그 | P1 |
| S7 | **이상 상태 알림** | 냉장고 문 열림, 누수, 에어컨 필터 교체, 허브/통합 장애(토큰 만료 등)를 알림으로 받고 싶다 | 가전, 센서, 허브 | P0(허브 장애), P1(기타) |
| S8 | **외부에서 확인/제어** | 외출 중 스마트폰으로 “커튼 닫혔나/에어컨 꺼졌나”를 확인하고 제어하고 싶다 | 전체 | P1 |
| S9 | **어린이 안전** | 부모로서, 아이가 태블릿에서 오븐/인덕션/잠금 기기를 조작하지 못하게 하고 싶다 | 고위험 기기 | P0 |
| S10 | **음성 공존** | “헤이 구글, 거실 커튼 닫아줘”가 계속 동작하길 원한다(허브 통합 이후에도) | Nest, 커튼 | P1 |
| S11 | **인터넷 장애** | 인터넷이 끊겨도 태블릿으로 조명/커튼/TV 등 로컬 기기를 제어하고 싶다 | 로컬 기기 | P0 |
| S12 | **영화 모드** | TV 입력 전환 시 커튼 닫힘, 조명 디밍 | TV, 커튼, 조명 | P2 |

---

## 6. 기능 요구사항 (FR)

우선순위: **P0** = MVP 필수, **P1** = 확장 1단계, **P2** = 선택.

### 6.1 기기 탐색/등록
| ID | 요구사항 | 우선 |
|---|---|---|
| FR-01 | 허브는 브랜드별 **연동 어댑터(Integration)** 단위로 기기를 등록한다: SmartThings, LG ThinQ Connect, Google Nest SDM, Matter, Zigbee, LAN(TV/Cast), 커튼(4.3절) | P0 |
| FR-02 | mDNS/SSDP/DHCP 기반으로 LAN 기기를 자동 탐지하고 등록 후보로 보여준다 | P1 |
| FR-03 | 모든 기기를 **공통 기기 모델**(도메인: light, switch, cover, climate, media_player, sensor, appliance 등 + 속성/명령)로 정규화한다. 원본 벤더 속성은 확장 필드로 보존한다 | P0 |
| FR-04 | 기기마다 방, 표시 이름, 아이콘, 안전 등급, 연동 경로(L/C), 제어 허용 역할을 메타데이터로 관리한다 | P0 |
| FR-05 | 같은 물리 기기가 여러 경로로 들어온 경우(예: Matter와 SmartThings에 모두 노출) **중복을 식별하고 1차 경로를 지정**한다 | P1 |
| FR-06 | Matter 커미셔닝과 멀티어드민(다른 생태계에서 공유 코드로 추가)을 지원한다 | P0 |

### 6.2 대시보드
| ID | 요구사항 | 우선 |
|---|---|---|
| FR-10 | **홈(요약)** 화면: 날씨/시간, 씬 버튼(외출/귀가/취침/아침), 주의 상태(열린 커튼, 켜진 가전, 알림) | P0 |
| FR-11 | **방별 뷰**: 방 탭 → 기기 카드 그리드 | P0 |
| FR-12 | **기기 유형별 뷰**: 조명, 커튼, 냉난방, 가전, 미디어 | P1 |
| FR-13 | **씬 뷰**: 씬 목록, 실행, 마지막 실행 결과 | P0 |
| FR-14 | 기기 카드에 상태, 연결성(온라인/오프라인/클라우드 지연), 마지막 갱신 시각을 표시한다 | P0 |
| FR-15 | 대시보드 레이아웃은 선언적 설정(YAML/JSON)으로 정의하고 버전 관리한다 | P1 |

### 6.3 제어
| ID | 요구사항 | 우선 |
|---|---|---|
| FR-20 | 기본 제어: On/Off, 밝기/색온도, 커튼 열기/닫기/정지/위치(%), 냉난방 모드/온도/풍량, TV 전원/볼륨/입력, 가전 시작/일시정지(벤더가 허용하는 범위) | P0 |
| FR-21 | 명령을 보낸 직후 UI는 **낙관적 상태(pending)** 를 표시하고, 실제 상태가 확인되면 확정하거나 타임아웃 시 롤백하고 오류를 표시한다 | P0 |
| FR-22 | 고위험 기기(열원, 잠금, 가스 등)의 원격 제어는 역할 권한과 확인 절차를 거친다. 벤더가 원격 시작을 막아 둔 기능(예: 가전의 원격 시작 허용 모드)은 우회하지 않는다 | P0 |
| FR-23 | 그룹 제어(예: 거실 조명 전체, 전 커튼) | P0 |
| FR-24 | 클라우드 API 레이트리밋을 넘지 않도록 **명령 큐잉, 병합(debounce), 재시도(backoff)** 를 적용한다. 예: 밝기 슬라이더 드래그 중 명령 폭주 방지 | P0 |

### 6.4 상태 실시간 반영
| ID | 요구사항 | 우선 |
|---|---|---|
| FR-30 | 태블릿은 허브와 **지속 연결(WebSocket 등 push)** 을 유지하며 폴링하지 않는다 | P0 |
| FR-31 | 벤더 이벤트를 push로 받는다: SmartThings 구독(Cloud Push), ThinQ MQTT, SDM Pub/Sub, Matter/Zigbee 로컬 보고. push가 없는 경로만 폴링하며 주기는 레이트리밋 안에서 설정 가능 | P0 |
| FR-32 | 연결 끊김 후 재연결하면 전체 상태를 재동기화(snapshot)한다 | P0 |
| FR-33 | 상태의 신선도(stale) 판정: 기기별 최대 허용 지연을 넘으면 UI에 “상태 불확실”을 표시한다 | P1 |

### 6.5 씬 / 자동화 규칙
| ID | 요구사항 | 우선 |
|---|---|---|
| FR-40 | 씬: 여러 기기의 목표 상태 묶음. 실행 결과는 기기별 성공/실패로 보고한다 | P0 |
| FR-41 | 자동화: 트리거(시간, 일출/일몰, 상태 변화, 재실, 이벤트) + 조건(요일, 모드, 상태) + 액션(제어, 씬, 알림, 지연) | P0 |
| FR-42 | 자동화는 **허브 로컬에서 실행**한다. 벤더 클라우드 자동화(SmartThings Routine, ThinQ 루틴, Google Home 자동화)에 의존하지 않는다. 기존 벤더 자동화는 목록화하고 이관하거나 비활성화해 중복 실행을 막는다 | P0 |
| FR-43 | 전역 **모드(Home/Away/Sleep/Vacation)** 상태 머신을 두고 자동화 조건으로 쓴다 | P0 |
| FR-44 | 자동화 정의는 텍스트(YAML 등)로 저장해 Git으로 관리하고, 실행 이력(trace)을 조회할 수 있어야 한다 | P1 |
| FR-45 | 자동화가 실패하면(기기 오프라인, API 오류) 재시도 정책을 적용하고 알림을 보낸다 | P1 |

### 6.6 스케줄
| ID | 요구사항 | 우선 |
|---|---|---|
| FR-50 | 요일/시간/일출·일몰 오프셋 기반 스케줄 | P0 |
| FR-51 | 한국 공휴일 캘린더 연동(평일 전용 스케줄 제외 처리) | P1 |
| FR-52 | 태블릿 UI에서 일반 사용자도 스케줄 시간을 쉽게 바꿀 수 있어야 한다(예: 아침 커튼 07:00 → 07:30) | P1 |
| FR-53 | 휴가 모드: 스케줄 일괄 일시정지, 재실 시뮬레이션(조명 랜덤) | P2 |

### 6.7 알림
| ID | 요구사항 | 우선 |
|---|---|---|
| FR-60 | 알림 채널: 태블릿 배너/토스트, 스마트폰 푸시(HA Companion 앱 등), Nest 스피커 TTS(P1), 메신저(텔레그램 등, P2) | P0/P1/P2 |
| FR-61 | 알림 등급: 정보/주의/긴급. 긴급(누수, 연기 등)은 방해금지 시간에도 전달한다 | P0 |
| FR-62 | **시스템 헬스 알림**: 통합 인증 만료, 레이트리밋 초과, 기기 장시간 오프라인, 허브 디스크/메모리 부족, 백업 실패 | P0 |
| FR-63 | 사용자별 구독 설정(누가 어떤 알림을 받을지) | P1 |

### 6.8 에너지 모니터링
| ID | 요구사항 | 우선 |
|---|---|---|
| FR-70 | 전력 측정이 가능한 소스를 수집한다: 스마트플러그(실시간 W, kWh), ThinQ 에너지(일 단위, 전일까지), SmartThings 전력 capability(지원 기기) | P1 |
| FR-71 | 일/주/월별 기기·방별 사용량 그래프와 상위 소비 기기 표시 | P1 |
| FR-72 | 누진 요금 구간 추정(한국 주택용 전력 요금 기준, 요금표 설정값) | P2 |
| FR-73 | 대기전력 알림(예: 야간에 N W 이상 소비 기기) | P2 |

### 6.9 사용자 / 권한
| ID | 요구사항 | 우선 |
|---|---|---|
| FR-80 | 역할: Admin / User / Restricted(어린이) / Guest | P0 |
| FR-81 | 기기/도메인 단위 허용 목록(ACL). 태블릿 공용 세션의 기본 권한은 User에서 고위험 기기를 뺀 수준 | P0 |
| FR-82 | 관리 화면 진입은 PIN 또는 관리자 계정 인증으로 제한한다 | P0 |
| FR-83 | 게스트 접근: 기간 제한 링크 또는 PIN | P2 |

### 6.10 음성비서 공존
| ID | 요구사항 | 우선 |
|---|---|---|
| FR-90 | 기존 음성 제어(Google/Gemini, Bixby, ThinQ)는 벤더 경로로 계속 쓸 수 있어야 한다. 허브 도입이 기존 음성 명령을 깨지 않아야 한다 | P0 |
| FR-91 | 허브에만 있는 기기(Zigbee 커튼 등)를 Google Home에 노출해 음성으로 제어한다. 후보: HA Google Assistant 연동(Nabu Casa 유료 또는 수동 Actions 설정), 또는 Matter 브리지로 노출 [확인 필요] | P1 |
| FR-92 | 이름 충돌 방지: 음성으로 노출하는 기기 이름과 방 이름 규칙을 통일한다 | P1 |
| FR-93 | 로컬 음성비서(HA Assist 등)는 선택 사항 | P2 |

### 6.11 로그 / 이력
| ID | 요구사항 | 우선 |
|---|---|---|
| FR-100 | 기기 상태 이력(시계열)을 기본 30일, 장기 통계(에너지/온도)는 2년 보관 | P0(단기), P1(장기) |
| FR-101 | 제어 감사 로그: 누가/어디서(태블릿, 모바일, 자동화, 음성)/무엇을/결과 | P1 |
| FR-102 | 통합(연동)별 오류 로그와 API 호출량 지표(레이트리밋 대비 사용률) | P1 |
| FR-103 | 로그/지표 내보내기(Prometheus/InfluxDB 등 외부 TSDB 연동) | P2 |

---

## 7. 태블릿 UI/UX 요구

| ID | 요구사항 | 우선 |
|---|---|---|
| UX-01 | **키오스크 모드**: 부팅하면 대시보드가 자동 실행되고, 홈/뒤로 버튼과 상태바를 잠그며, 앱이 비정상 종료되면 자동 재시작한다. **OS 확정: Android.** 후보: Fully Kiosk Browser(Android, 유료 라이선스), HA Companion 앱 + Android 화면 고정(Pinning) 등. 정확한 기종·화면 크기는 [확인 필요: Q2] | P0 |
| UX-02 | **상시 전원** 운영: 배터리 팽창 위험을 줄이기 위해 충전 상한 제한(예: 기기 “배터리 보호 85%” 기능) 또는 스마트플러그로 충전 사이클 제어 | P0 |
| UX-03 | **가로(landscape) 고정** 레이아웃, 10~12인치 기준 3~4열 카드 그리드. 세로 모드는 비목표 | P0 |
| UX-04 | 터치 타깃 최소 **48×48 dp**, 주요 씬 버튼은 **≥ 96 dp**. 버튼 간격 ≥ 8 dp | P0 |
| UX-05 | **다크 모드 기본**(야간 눈부심 방지), 시간대에 따라 자동 전환. 고대비/대형 글꼴 테마 제공(고령자) | P0(다크), P1(고대비) |
| UX-06 | **화면 절전**: 무입력 N분 뒤 디밍 → 스크린세이버(시계/사진) → 소등. 근접 센서, 카메라 모션 감지, 또는 외부 재실 센서로 자동 깨움. 취침 모드와 연동해 소등 | P1 |
| UX-07 | 한 화면 안에서 **2탭 이내**로 자주 쓰는 제어를 끝낸다(씬, 방별 조명/커튼) | P0 |
| UX-08 | 상태를 색과 아이콘으로 동시에 표현한다(색각 이상 고려). 오프라인/불확실 상태는 별도 시각 표시 | P0 |
| UX-09 | 피드백: 터치 즉시 시각 반응(≤ 100 ms), 명령 진행 중 스피너, 실패 시 사유 표시(“LG 클라우드 응답 없음” 등) | P0 |
| UX-10 | 어린이 잠금 영역: 고위험 기기 카드는 길게 누르기와 PIN을 요구하거나 아예 숨긴다 | P0 |
| UX-11 | 태블릿 자체도 허브의 기기로 노출한다(배터리, 화면 밝기, 모션, TTS 스피커): 원격 화면 켜기/끄기, 알림 음성 출력 | P1 |
| UX-12 | 네트워크 장애 시 “허브 연결 끊김” 배너와 자동 재연결. 허브가 LAN에 있으면 인터넷 장애와 무관하게 동작 | P0 |
| UX-13 | 한국어 UI, 24시간/12시간 표기 설정 | P0 |
| UX-14 | 벽걸이 설치: 전원 매립/케이블 정리, 거치 높이(성인 눈높이 약 140~150 cm, 어린이 접근성은 [확인 필요]) | P1 |

---

## 8. 비기능 요구사항 (NFR)

### 8.1 성능
| ID | 요구사항 |
|---|---|
| NFR-01 | 로컬 경로 제어 지연 p95 ≤ 300 ms, 상태 반영 p95 ≤ 1 s (K2, K3) |
| NFR-02 | 클라우드 경로 제어+반영 p95 ≤ 3 s (K4). 벤더 SLA가 없으므로 “목표”로 관리 |
| NFR-03 | 태블릿 대시보드 콜드 로딩 ≤ 3 s, 화면 전환 ≤ 300 ms |
| NFR-04 | 허브 규모 가정: 기기 50~150개, 엔티티 300~1,500개, 자동화 50개, 상태 이벤트 피크 50 events/s |
| NFR-05 | 벤더 레이트리밋 준수. SmartThings 공개 가이드 기준(2026-09 조회): **기기당 GET/명령/이벤트 12 req/min**, 요청당 명령 최대 10개, 설치앱당 구독 40개/기기 30개, 씬 실행 50 req/min 등. 유료 플랜의 한도는 [확인 필요]. ThinQ Connect의 수치 한도는 공개 문서에서 확인하지 못함 [확인 필요]. 초과 시 “API 호출 횟수 초과” 오류 후 일정 시간 차단된다고 보고됨 |

### 8.2 가용성 / 오프라인 동작
| ID | 요구사항 |
|---|---|
| NFR-10 | 허브 월간 가용성 ≥ 99.5%. 전원 복구 후 자동 부팅, 서비스 자동 재시작(watchdog) |
| NFR-11 | **인터넷 단절 시**: 로컬 경로 기기(Matter/Thread, Zigbee, LAN TV/Cast, BLE, IR)의 제어, 로컬 자동화, 스케줄, 태블릿 UI가 계속 동작해야 한다. 클라우드 기기는 “클라우드 불가”로 표시한다 |
| NFR-12 | 허브는 NTP가 없어도 RTC 또는 마지막 시각으로 스케줄을 유지해야 한다(시간 드리프트 허용치 ±1분/일) [확인 필요: 하드웨어 RTC 유무] |
| NFR-13 | 정전 대책: 허브, 네트워크 장비, Thread BR, Zigbee 코디네이터를 소형 UPS에 연결(≥ 15분) — P1 |
| NFR-14 | 클라우드 통합이 장애를 일으켜도(인증 실패, 레이트리밋) 다른 통합과 코어에 전파되지 않도록 격리한다(bulkhead) |
| NFR-15 | Thread 네트워크는 하나로 통합해 운영한다(여러 Border Router가 같은 Thread 자격증명을 공유). 파편화를 피한다 |

### 8.3 보안
| ID | 요구사항 |
|---|---|
| NFR-20 | 벤더 자격증명(SmartThings OAuth 토큰, ThinQ PAT, Google OAuth 클라이언트/리프레시 토큰, Tuya 로컬 키)은 허브의 암호화 저장소 또는 secrets 파일(Git 제외)에 보관한다. 평문으로 Git에 커밋하는 것을 금지한다 |
| NFR-21 | 토큰 수명 관리: SmartThings **PAT는 2024-12-30 이후 발급분의 유효기간이 24시간**이므로 상시 연동에 쓰지 않는다. OAuth(리프레시 토큰) 경로를 사용한다. 토큰 만료/갱신 실패 시 FR-62 알림 |
| NFR-22 | **네트워크 분리**: IoT 기기는 별도 VLAN/SSID(2.4 GHz 호환)에 두고, 허브는 IoT VLAN과 사용자 VLAN을 라우팅/방화벽 정책으로 중계한다. IoT→인터넷은 필요한 벤더 클라우드만 허용하고, IoT→사용자 LAN은 차단한다. Matter/Cast/HomeKit 등 mDNS 기반 탐지를 위해 **mDNS 리플렉터와 IPv6(링크로컬/ULA) 허용**이 필요하다. 방화벽 장비의 VLAN/mDNS 지원 여부 [확인 필요] |
| NFR-23 | **외부 접속**은 포트포워딩을 금지한다. 후보: WireGuard/Tailscale 같은 VPN, Cloudflare Tunnel+Access, Nabu Casa Remote UI. 모든 외부 접속은 MFA를 쓴다 |
| NFR-24 | 허브 UI와 API는 TLS(내부 CA 또는 VPN 내부 전용)를 쓰고, 태블릿 전용 장기 토큰은 권한을 최소화한다(관리 권한 없음) |
| NFR-25 | 개발용/미인증 Matter 기기 커미셔닝은 기본 차단한다(HA Matter Server 9.0 기본 정책과 같음) |
| NFR-26 | 허브 OS와 통합 컴포넌트는 월 1회 업데이트 창을 둔다. 업데이트 전 스냅샷을 만들고 실패하면 롤백한다 |

### 8.4 프라이버시
| ID | 요구사항 |
|---|---|
| NFR-30 | 재실/위치/카메라 데이터는 로컬에만 저장하고, 외부 클라우드 전송은 벤더 기능상 불가피한 경우로 한정한다 |
| NFR-31 | 가족 구성원별 위치 추적은 본인 동의(opt-in)를 받아서만 한다. 어린이 기기는 보호자가 관리한다 |
| NFR-32 | 태블릿 카메라를 모션 감지에 쓰는 경우 영상 저장과 외부 전송을 금지한다 |
| NFR-33 | 로그 보관 기간 정책을 준수하고(FR-100), 기간이 지나면 자동 삭제한다 |

### 8.5 확장성 / 유지보수성
| ID | 요구사항 |
|---|---|
| NFR-40 | 신규 브랜드는 **어댑터(통합) 추가만으로** 연동한다. 코어와 UI는 공통 기기 모델(FR-03)에만 의존한다 |
| NFR-41 | 구성(기기 메타, 대시보드, 자동화)은 선언적 텍스트로 관리하고 Git에 버전을 남긴다(secrets 제외) |
| NFR-42 | 커스텀 코드(커스텀 카드, 어댑터)는 최소화하고, 쓰는 경우 버전을 고정하고 업데이트 호환성을 테스트한다 |
| NFR-43 | 관찰성: 허브 CPU/메모리/디스크, 통합별 오류율, API 호출량, 자동화 실패율을 대시보드로 볼 수 있어야 한다 |
| NFR-44 | 운영 부담: 월 평균 유지보수 ≤ 2시간을 목표로 한다 |

### 8.6 백업 / 복구
| ID | 요구사항 |
|---|---|
| NFR-50 | 일 1회 자동 전체 백업(설정, DB, Zigbee 코디네이터 네트워크 정보, Matter fabric 정보, Thread 데이터셋)을 만들고 **오프호스트**(NAS 또는 클라우드 암호화)에 보관한다. 7일/4주/6개월 보존 |
| NFR-51 | RTO ≤ 60분, RPO ≤ 24시간 (K9). 반기 1회 복원 리허설 |
| NFR-52 | Zigbee 코디네이터 교체 시 재페어링 없이 이관할 수 있도록 코디네이터 백업을 보관한다(스택 지원 범위 [확인 필요]) |
| NFR-53 | Matter fabric과 Thread 자격증명을 잃으면 전체 재커미셔닝이 필요하므로 백업 대상에 반드시 포함한다 |

---

## 9. 외부 연동 요구 및 제약

### 9.1 브랜드별 API 요약

| 항목 | Samsung SmartThings | LG ThinQ Connect | Google Nest (SDM API) | Google Home APIs | Matter (표준) |
|---|---|---|---|---|---|
| 성격 | 공식 REST API + 이벤트 구독(SmartApp/Webhook) | 공식 개방 API(2024~), REST + MQTT(AWS IoT Core) | 공식 REST API, Device Access 프로그램 | 공식 **모바일 SDK**(Android Kotlin, iOS Swift) | 로컬 IP 기반 표준(Wi-Fi/Thread/Ethernet) |
| 인증 | OAuth 2.0(통합 앱). **PAT는 24시간 만료**(2024-12-30 이후 발급분) | **PAT**(connect-pat.lgthinq.com, 스코프 선택) + 국가 코드 | Google OAuth 2.0 + GCP 프로젝트 + Device Access 등록(1회 $5) | 앱 내 Google 계정 권한 동의 | 커미셔닝(PAKE, 기기 증명서), fabric 단위 |
| 비용 | **2026-10부터 비상업 개인 플랜 월 $4.99 예정**(2026-06-23 공지). 한국 적용, 쿼터, 세부 조건 [확인 필요] | 무료로 알려짐, 향후 정책 [확인 필요] | 1회 $5, Pub/Sub은 GCP 무료 한도 안이면 과금 가능성 낮음 [확인 필요] | – | 무료 |
| 이벤트 | 구독 기반 push(HA 통합: Cloud Push) | MQTT push. 구형 모델은 5분 주기 | Cloud Pub/Sub push | 앱 내 구독 | 로컬 구독(attribute report) |
| 레이트리밋 | 공개: 기기당 12 req/min, 구독 생성 40/15min, Location 조회 100/min 등 | 수치 비공개. 과다 호출 시 일시 차단 보고 [확인 필요] | 공개 문서 수치 [확인 필요] | – | 로컬, 사실상 무제한 |
| 로컬 동작 | ✕ (API는 클라우드. SmartThings 허브의 Edge 로컬 실행과는 별개) | ✕ | ✕ | 앱과 허브 사이에서 일부 로컬 가능 [확인 필요] | **○** |
| 대상 기기 | Samsung 가전/TV + SmartThings 등록 타사 기기 | LG 가전 27~30여 종(에어컨, 세탁기, 냉장고 등) | 온도조절기, 카메라, 도어벨, 디스플레이(카메라). **연기/CO 경보기 미지원** | Matter, WWGH, Nest 기기 | Matter 인증 기기 |
| 주요 제약 | 유료화, 일부 기능은 앱 전용, capability 매핑 한계 | 에너지 데이터는 전일까지만, 국가/리전 일치 필요 | **Workspace 계정 불가**, 고급 보호 프로그램 계정 불가 | **서버/허브 백엔드에서 사용 불가**(모바일 앱 전용) | 멀티어드민 공유 실패 사례(네트워크 불일치, Thread BR 부재, BLE 거리, VPN) |
| HA 통합 | `smartthings`(공식, Cloud Push, OAuth) | `lg_thinq`(공식, Cloud Push, PAT) | `nest`(공식, Cloud Push) | 없음 | `matter`(공식, matter.js 기반 Server 9.0, Matter 1.5.1) + `thread`/OTBR(Thread 1.4) |

### 9.2 LAN/로컬 연동 대상

| 대상 | 방식 | 비고 |
|---|---|---|
| Samsung TV | HA `samsungtv`(로컬 WebSocket) | 최초 페어링 시 TV에서 허용. 전원 ON은 모델별 제약 [확인 필요] |
| LG TV | HA `webostv`(로컬) | 페어링 키 저장 |
| Google Nest 스피커/디스플레이, Chromecast | HA `cast`(로컬) | 미디어 제어, TTS, 대시보드 캐스팅(Nest Hub) |
| Zigbee 기기 | USB 코디네이터 + Zigbee2MQTT/ZHA | 코디네이터 선정은 아키텍처 단계에서 |
| Thread 기기 | OTBR(허브 내장 RCP 동글) 또는 Nest Hub 2세대/SmartThings Station 등 기존 BR 공유 | 자격증명 통합(NFR-15). **SmartThings 스테이션과 Google Nest 기기 보유가 확정됨(오픈 이슈 Q4)** — 각각 Thread BR을 지원하는 세대/모델인지 확인 후 재사용 검토 |
| Tuya Wi-Fi | 공식 `tuya`(클라우드) / `tuya-local`(커스텀, 로컬) | 4.3 C3 |
| 전동커튼 (BLE+Wi-Fi 확정, 브랜드 확인 필요) | BLE 구간: HA BLE 통합 또는 ESPHome BLE 프록시(로컬 가능성). Wi-Fi 구간: 벤더 클라우드 또는 `tuya-local`류 로컬화(모델 확인 후 결정) | 4.3 C3/C4, 9.3 IR-07. 로컬 제어를 완전히 확보할 수 있는지는 브랜드 확인 전까지 미확정 |

### 9.3 연동 요구
| ID | 요구사항 |
|---|---|
| IR-01 | **Matter 우선 원칙**: Matter를 지원하는 기기는 Matter(로컬)를 1차 경로로 삼고, 벤더 클라우드는 Matter가 노출하지 않는 기능(가전 고급 상태, 에너지)만 보조로 쓴다 |
| IR-02 | 멀티어드민: 기존 생태계(SmartThings/Google Home/ThinQ)의 Matter 기기를 허브 fabric에 **추가 공유**하되 기존 음성/앱 제어를 유지한다. fabric 수 상한은 기기별로 다르므로 [확인 필요] |
| IR-03 | SmartThings 유료화 대응: (a) Matter/로컬로 이관 가능한 기기는 이관하고, (b) 남는 SmartThings 전용 기기 수와 가치를 평가해 월 $4.99 지불 여부를 결정한다(오픈 이슈 Q5). (c) 결정 전까지 SmartThings 통합은 선택 모듈로 둔다 |
| IR-04 | 클라우드 어댑터는 토큰 갱신, 레이트리밋 준수, 지수 백오프, 회로 차단기(circuit breaker)를 갖춰야 한다 |
| IR-05 | 벤더 약관 준수: 비공식 역공학 클라이언트(예: 구 ThinQ 비공식 라이브러리)는 쓰지 않는다. LG는 2025년 이후 비공식 프로젝트가 예고 없이 중단될 수 있다고 밝혔다 |
| IR-06 | Google 생태계 연동은 **SDM API(Nest 온도조절기/카메라) + Cast(로컬) + Matter** 조합으로 한다. Google Home APIs는 허브 백엔드용이 아니므로 제외한다(향후 모바일 컴패니언 앱을 만들 경우 재검토) |
| IR-07 | **전동커튼(BLE+Wi-Fi 확정, 브랜드 확인 필요) 연동 전략**: (a) 모터/커튼봉↔허브 간 **BLE 구간**은 로컬 직접 제어 가능성이 높다 — HA BLE 통합 또는 BLE 프록시(ESPHome)로 우선 검증한다. (b) 허브↔클라우드 간 **Wi-Fi 구간**은 벤더 클라우드(Tuya, SwitchBot 등)에 의존할 가능성이 높다 — `tuya-local`/`localtuya` 같은 로컬화 도구의 해당 모델 지원 여부를 확인한다(4.3 C3). (c) 기존 **SmartThings 허브(스테이션) 보유가 확정**되었으므로(9.2), 커튼이 이미 SmartThings에 등록되어 있는지도 함께 확인한다(4.3 C7) |

---

## 10. 구축 옵션 비교

| 기준 | **A. Home Assistant 로컬 허브 + 커스텀/반커스텀 대시보드** | **B. SmartThings를 중앙 허브로 사용** | **C. 완전 자체 개발** |
|---|---|---|---|
| 구성 | 전용 미니PC/SBC에 HA OS(또는 컨테이너) + Zigbee/Thread 동글. 태블릿은 HA 대시보드(키오스크). 필요 시 HA WebSocket API 기반 자체 프론트엔드 | SmartThings Station/TV 허브 + LG ThinQ·Google 연동을 SmartThings에 연결. 태블릿은 SmartThings 앱 또는 SmartThings API 기반 자체 UI | 자체 백엔드(예: 벤더 SDK + MQTT 버스 + DB) + 자체 프론트엔드 |
| 브랜드 커버리지 | SmartThings, ThinQ, Nest, Matter, Zigbee, Cast, TV, Tuya 모두 공식 통합 존재 | Samsung 강함. LG/Google은 제휴 연동 범위에 한정 [확인 필요] | 직접 구현한 만큼만 |
| 로컬/오프라인 | 좋음(Matter/Zigbee/LAN 로컬, 자동화 로컬 실행) | 제한적(Edge 로컬 실행 기기는 일부 가능, UI/API는 클라우드) | 설계에 달림 |
| 태블릿 UI 자유도 | 높음(대시보드 설정 + 커스텀 카드 + 자체 프론트 가능) | 낮음(SmartThings 앱 UI 고정. 자체 UI는 유료 API 필요) | 최고 |
| 비용 | 허브 컴퓨트(미니PC/SBC) + Zigbee 코디네이터 등 하드웨어 약 15~40만 원 [확인 필요: 시세] — **기존 SmartThings 스테이션/Nest 기기 보유로 Thread BR 비용은 절감 가능하나 Zigbee 코디네이터는 별도 필요**(4.3 C2), 선택: Nabu Casa, SmartThings API $4.99/월 | 이미 보유한 SmartThings 스테이션을 그대로 활용 가능하지만 자체 UI를 만들면 API $4.99/월 | 하드웨어 + 대량의 개발 시간 |
| 초기 구축 난이도 | 중 (사용자 역량에 적합) | 하 | 상 |
| 유지보수 | 중(월간 업데이트, 커뮤니티 활발) | 하(단, 벤더 정책 변경 위험) | 상(모든 벤더 API 변경을 직접 추적) |
| 벤더 종속/정책 위험 | 낮음~중(클라우드 통합은 여전히 벤더에 의존) | **높음**(API 유료화, 기능 변경 직접 영향) | 중(벤더 API 의존은 같음) |
| 보안/프라이버시 | 로컬 보관, 네트워크 분리 용이 | 데이터 벤더 클라우드 중심 | 설계에 달림 |
| 커스터마이징/학습 가치 | 높음(YAML/Python, 커스텀 통합 가능) | 낮음 | 최고 |

### 권장안: **A. Home Assistant 기반 로컬 허브 + 태블릿 키오스크 대시보드**
근거:
1. 세 브랜드의 **공식 통합이 모두 있다**(SmartThings, LG ThinQ Connect, Google Nest SDM, Cast, Matter). C안처럼 벤더 연동을 새로 구현할 필요가 없다.
2. **로컬 우선** 요구(NFR-11)를 만족하는 유일한 현실적 선택지다. Matter Server(matter.js, 2026-06)와 OTBR(Thread 1.4)을 내장하고 있다.
3. SmartThings 유료화(2026-10)에 가장 유연하다. B안은 사실상 강제 과금이지만 A안에서는 Matter/로컬 이관으로 SmartThings 의존을 줄이고 유료 여부를 선택할 수 있다.
4. 사용자의 기술 역량(SW 엔지니어)과 잘 맞는다. 구성을 코드로 관리하고(Git), 필요하면 커스텀 통합과 UI를 Python/TypeScript로 확장할 수 있다.
5. 대시보드는 **1단계에서 HA 기본 대시보드(섹션 뷰 + 커스텀 카드)** 로 빠르게 내고, 요구가 굳어지면 **2단계에서 HA WebSocket/REST API 위의 자체 프론트엔드**(C안의 UI 부분만 차용)로 확장하는 **A+C 하이브리드**를 허용한다.

B안의 부분 활용: **기존 SmartThings 허브(스테이션)와 Google Nest 기기의 보유가 확정되었다**(오픈 이슈 Q4). 이들을 폐기하지 않고 **Thread Border Router/Zigbee 허브로 공존**시키거나, Matter 기기를 멀티어드민으로 공유하는 용도로 유지할 수 있다. 단, SmartThings 스테이션의 Zigbee 라디오는 벤더 종속적이라 HA가 직접 쓸 수 없으므로(Zigbee 기기는 4.3 C2처럼 별도 코디네이터로 재페어링 필요), 하드웨어 비용 절감 효과는 제한적이다. Thread(Matter) 쪽은 두 기기가 해당 세대(SmartThings 스테이션, Nest Hub 2세대/Max 등)라면 별도 Thread 동글 없이 기존 Border Router를 재사용할 여지가 있다(모델 확인 필요, Q4).

---

## 11. 릴리즈 계획 / 마일스톤

| 단계 | 기간(가정) | 범위 | 완료 기준 (Exit Criteria) |
|---|---|---|---|
| **M0. 준비/조사** | 1주 | 기기 인벤토리 확정(4.2), 커튼 기종 식별, 네트워크 현황 조사, 태블릿 기종 확정, 오픈 이슈 답변 | 인벤토리 100% 작성, 연동 경로(L/C) 확정 |
| **M1. 인프라** | 1~2주 | 허브 하드웨어, HA 설치, VLAN/SSID 분리, 백업 파이프라인, VPN 외부 접속 | NFR-22/23/50 충족, 복원 리허설 1회 |
| **M2. MVP (P0)** | 2~3주 | 로컬 통합(Matter/Thread, Zigbee, TV, Cast), 커튼 연동, ThinQ 연동, SDM 연동, SmartThings 연동(유료화 전 평가판). 태블릿 키오스크 + 홈/방별/씬 대시보드. 외출/취침/아침 커튼 씬, 가전 완료 알림, 헬스 알림, 역할/어린이 제한 | K1 ≥ 80%, K2/K3 충족, S1/S3/S4/S5/S9/S11 시연 통과, WAN 차단 테스트 통과 |
| **M3. 확장 1 (P1)** | 3~4주 | 에너지 모니터링(스마트플러그 추가), 재실 기반 귀가, 음성 노출(Google), 화면 절전/근접 깨움, 공휴일, 감사 로그, 고대비 테마, UPS | K1 ≥ 95%, K5 1개월 측정 ≥ 99.5%, K8 설문 |
| **M4. SmartThings 유료화 결정점** | 2026-10 전후 | 이관 가능 기기의 Matter 이관 완료 후 잔여 기기 평가 → 유료 플랜 가입 또는 해당 통합 제거 | 결정 기록(ADR) |
| **M5. 확장 2 (P2)** | 이후 | 자체 프론트엔드(선택), 영화 모드, 휴가 시뮬레이션, 누진 요금 추정, 메신저 알림, 외부 TSDB, 로컬 음성 | 필요 시 개별 정의 |

---

## 12. 리스크 & 대응, 오픈 이슈

### 12.1 리스크

| ID | 리스크 | 가능성 | 영향 | 대응 |
|---|---|---|---|---|
| R1 | SmartThings API 유료화(2026-10), 이후 쿼터/약관 변경 | 높음(확정 공지) | 중 | Matter/로컬 이관 우선(IR-01, IR-03). SmartThings 통합을 선택 모듈로 격리 |
| R2 | LG ThinQ Connect 정책 변경(유료화, 레이트리밋 강화) | 중 [확인 필요] | 중 | 공식 API만 사용. 핵심 알림(세탁 완료)은 스마트플러그 전력 감지로 이중화 |
| R3 | 커튼의 정확한 브랜드/모델 미확인으로 로컬 BLE 제어 가능 여부·Wi-Fi 클라우드 의존도가 불확실(통신방식은 BLE+Wi-Fi로 확정되어 IR/RF 전용 우려는 해소됨) | 낮음~중 | 중 | 브랜드 확인 후 BLE 로컬 통합 우선 검토, Wi-Fi 구간은 `tuya-local` 등 로컬화 가능 여부 확인(9.3 IR-07) |
| R4 | Matter 멀티어드민 공유 실패 또는 불안정(네트워크 불일치, Thread 파편화) | 중 | 중 | 단일 Thread 네트워크 설계, IPv6/mDNS 허용 검증, 커미셔닝 체크리스트 |
| R5 | VLAN 분리 후 mDNS/IPv6 차단으로 기기 탐지 불가 | 중 | 높음 | 분리 전후 테스트 매트릭스. mDNS 리플렉터, 허브를 IoT VLAN에 멀티홈 |
| R6 | 허브 저장장치 고장(SD카드 등) | 중 | 높음 | SSD 사용, 일일 오프호스트 백업, 복원 리허설 |
| R7 | 태블릿 상시 충전으로 배터리 팽창 | 중 | 높음(안전) | 충전 상한 제한, 스마트플러그 충전 사이클, 정기 육안 점검 |
| R8 | HA/커스텀 컴포넌트 업데이트로 호환성 깨짐 | 중 | 중 | 스냅샷 후 업데이트, 커스텀 컴포넌트 최소화, 버전 고정 |
| R9 | 자동화 중복 실행(벤더 루틴과 허브 자동화 동시 실행) | 중 | 중 | FR-42: 벤더 자동화 목록화 및 이관 |
| R10 | Gemini for Home 전환에 따른 음성 제어 동작 변화, 한국어 지원 시점 불확실 | 중 | 낮음~중 | 음성은 공존 수준(P1)으로 한정. 태블릿/모바일이 1차 제어 수단 |
| R11 | 원격 제어 보안 사고(외부 노출) | 낮음 | 매우 높음 | 포트포워딩 금지, VPN+MFA, 고위험 기기 원격 제어 제한 |
| R12 | 가족 수용성 저하(복잡한 UI) | 중 | 중 | MVP 뒤 가족 사용성 테스트, 2탭 원칙(UX-07) |

### 12.2 오픈 이슈 (사용자 확인 질문)

> **2026-09-24 갱신:** 사용자 답변으로 Q1·Q2·Q4가 부분적으로 해소되었다(취소선 = 확정된 부분, 굵게 = 남은 확인 사항). 나머지 질문은 변경 없음.

| # | 질문 | 영향 범위 |
|---|---|---|
| Q1 | ~~통신 방식~~ **[확정: BLE+Wi-Fi]**. 남은 확인 사항: **전동커튼의 정확한 제조사/모델명, 사용 중인 앱**은? 몇 개가 어느 방에 있는가? | 4.3, 9.3 IR-07 |
| Q2 | ~~OS~~ **[확정: Android]**. 남은 확인 사항: **“탭북”의 정확한 기종(제조사/모델)과 화면 크기**, 벽걸이 설치 위치와 전원 공급 가능 여부 | UX-01, 키오스크 솔루션 선택 |
| Q3 | 삼성/LG/구글 기기의 **실제 모델 목록**(4.2 체크리스트). 특히 Matter 지원 여부 | K1, IR-01 |
| Q4 | ~~기존 허브 보유 여부~~ **[확정: SmartThings 허브(스테이션) 보유, Google Nest 기기 보유]**. 남은 확인 사항: **SmartThings 스테이션의 정확한 모델**(Thread/Matter BR 지원 세대인지), **Nest 기기의 정확한 종류/세대**(Nest Hub 2세대 여부가 Thread Border Router 보유를 가름), LG ThinQ ON 등 LG 허브 보유 여부, 이미 구성된 Thread 네트워크가 있는가? | Thread 설계, 멀티어드민, 9.2, §10 |
| Q5 | **SmartThings API 유료(월 $4.99) 지불 의향**. 아니면 Samsung 가전의 허브 연동 범위를 줄여도 되는가? | IR-03, M4 |
| Q6 | 네트워크 환경: 공유기/방화벽 기종, VLAN·다중 SSID·mDNS 리플렉터 지원 여부, IPv6 사용 여부, NAS 유무 | NFR-22, NFR-50 |
| Q7 | 아파트 단지 월패드(조명/난방/가스/환기) 연동이 필요한가? (현재 비목표) | NG5 |
| Q8 | 가족 구성(어린이 연령대, 고령자 동거 여부)과 원하는 권한 정책 | FR-80~83 |
| Q9 | 외부 접속 방식 선호: VPN(Tailscale/WireGuard) vs 유료 원격(Nabu Casa) | NFR-23, FR-91 |
| Q10 | 허브 하드웨어 예산과 선호(HA Green/Yellow 같은 전용 기기 vs 미니PC vs 기존 서버/NAS 가상화) | M1 |
| Q11 | 음성 제어의 중요도: Google/Gemini 외에 Bixby, ThinQ 음성도 계속 쓰는가? | FR-90~92 |
| Q12 | 에너지 모니터링 수준: 기기별 실측이 필요한가(스마트플러그 추가 구매), 가전 자체 데이터로 충분한가? | FR-70~73 |

---

## 13. 부록

### 13.1 용어집

| 용어 | 설명 |
|---|---|
| HA (Home Assistant) | 오픈소스 로컬 스마트홈 허브 플랫폼 |
| 통합(Integration)/어댑터 | 특정 브랜드/프로토콜을 허브의 공통 모델로 연결하는 모듈 |
| 엔티티(Entity) | 허브에서 제어/관찰하는 최소 단위(예: 커튼 위치, 에어컨 온도) |
| Matter | CSA가 주관하는 IP 기반 스마트홈 표준. 로컬 제어와 멀티어드민 지원 |
| Thread | 저전력 IPv6 메시 네트워크. Matter의 전송 계층 중 하나 |
| OTBR / Thread Border Router | Thread 메시와 IP 네트워크를 잇는 라우터(Nest Hub 2세대, SmartThings Station, HA OTBR 등) |
| Fabric | Matter에서 하나의 컨트롤러 생태계가 기기를 관리하는 보안 도메인 |
| 멀티어드민(Multi-admin) | 한 Matter 기기를 여러 fabric(생태계)에 동시에 등록하는 기능 |
| 커미셔닝(Commissioning) | Matter 기기를 fabric에 추가하는 절차 |
| Zigbee / Zigbee2MQTT / ZHA | 저전력 메시 프로토콜 / Zigbee↔MQTT 브리지 / HA 내장 Zigbee 통합 |
| PAT | Personal Access Token, 개인 발급 API 토큰 |
| SDM API | Google Smart Device Management API(Nest Device Access) |
| Cloud Push / Local Push | 상태를 클라우드 또는 로컬에서 이벤트로 밀어주는 방식(폴링의 반대) |
| Edge 드라이버 | SmartThings 허브에서 로컬로 실행되는 기기 드라이버 |
| VLAN / mDNS 리플렉터 | 네트워크 논리 분리 / 분리된 서브넷 사이에 mDNS 탐지 패킷을 중계하는 기능 |
| 키오스크 모드 | 단일 앱만 전체 화면으로 고정 실행하는 태블릿 운영 방식 |
| RTO / RPO | 복구 목표 시간 / 복구 시점 목표(허용 데이터 손실) |

### 13.2 참고자료 (2026-09-24 조회)

**Samsung SmartThings**
- Authorization and Permissions (PAT 24시간): https://developer.smartthings.com/docs/getting-started/authorization-and-permissions
- Rate Limits and Guardrails: https://developer.smartthings.com/docs/getting-started/rate-limits
- SmartThings Blog, A New Enhanced SmartThings API Experience (유료화 공지): https://blog.smartthings.com/smartthings-updates/a-new-enhanced-smartthings-api-experience/
- Hackaday, Samsung's SmartThings API Terminates Free Access: https://hackaday.com/2026/07/28/samsungs-smartthings-api-terminates-free-access/
- Matter Alpha, Samsung puts a $5 paywall on Home Assistant integration: https://www.matteralpha.com/industry-news/samsung-puts-a-5-paywall-on-home-assistant-integration-monthly
- Android Authority, SmartThings API paid tiers: https://www.androidauthority.com/smarthings-api-paid-tiers-3681929/
- SmartThings x Matter Integration: https://support.smartthings.com/hc/en-us/articles/11219700390804-SmartThings-x-Matter-Integration
- Hub Connected Devices (Edge): https://developer.smartthings.com/docs/devices/hub-connected/get-started
- HA SmartThings 통합: https://www.home-assistant.io/integrations/smartthings/
- HA Samsung Smart TV 통합: https://www.home-assistant.io/integrations/samsungtv/

**LG ThinQ**
- ThinQ Connect PAT: https://thinq.developer.lge.com/en/cloud/docs/thinq-connect/PAT-en/
- pythinqconnect (공식 SDK): https://github.com/thinq-connect/pythinqconnect
- LG 보도자료, ThinQ API 개방: https://www.lg.com/my/about-lg/press-and-media/lg-opens-thinq-api-to-foster-smart-home-innovation/
- HA LG ThinQ 통합: https://www.home-assistant.io/integrations/lg_thinq/
- LG ThinQ Matter 기기 연결 도움말: https://www.lg.com/us/support/help-library/lg-thinq-how-to-connect-matter-devices--20153454569708LST

**Google**
- Google Home APIs: https://developers.home.google.com/apis
- Google Home Matter: https://developers.home.google.com/matter
- Device Access 시작하기: https://developers.google.com/nest/device-access/get-started
- SDM API: https://developers.google.com/nest/device-access/api
- HA Google Nest 통합: https://www.home-assistant.io/integrations/nest/
- HA Google Cast 통합: https://www.home-assistant.io/integrations/cast/
- Gemini for Home 도움말: https://support.google.com/googlehome/answer/16618650?hl=en
- The Gadgeteer, Gemini for Home replaces Google Assistant: https://the-gadgeteer.com/2026/06/23/gemini-for-home-replaces-google-assistant/

**Matter / Thread / Home Assistant**
- HA 블로그, The Matter upgrade you've been waiting for (2026-06-23): https://www.home-assistant.io/blog/2026/06/23/the-matter-upgrade-youve-been-waiting-for/
- HA Matter 통합: https://www.home-assistant.io/integrations/matter/
- HA Thread 통합: https://www.home-assistant.io/integrations/thread/
- Matter Alpha, Matter multi-admin 공유 방법: https://www.matteralpha.com/how-to/matter-multi-admin-share-devices-across-ecosystems
- Matter Alpha, 4 ways Matter multi-admin quietly fails: https://www.matteralpha.com/explainer/4-ways-matter-multi-admin-quietly-fails
- Silicon Labs, Multi-Admin 문서: https://docs.silabs.com/matter/2.7.0/matter-ecosystems/multicontroller-ecosystem

**전동커튼 / Tuya / Zigbee**
- Zigbee2MQTT, Aqara ZNCLDJ11LM: https://www.zigbee2mqtt.io/devices/ZNCLDJ11LM.html
- HA 커뮤니티, Zemismart MT03 (Matter over Thread 커튼): https://community.home-assistant.io/t/zemismart-mt03-curtain-motor-matter-over-thread-compatible-with-home-assistant/1002597
- HA 커뮤니티, Aqara E1 vs SwitchBot Curtain: https://community.home-assistant.io/t/aqara-smart-curtain-motor-e1-vs-switchbot-curtain-smart-electric-motor/600398
- tuya-local: https://github.com/make-all/tuya-local
- localtuya: https://github.com/rospogrigio/localtuya
- LocalTuya vs Tuya-Local 비교: https://privatehomelab.com/localtuya-vs-tuya-local-home-assistant-comparison/
