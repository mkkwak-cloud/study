# 개발용 샘플 결정 사항 (오픈 이슈 임시 확정)

PRD [`iot-integration-system-prd.md`](./iot-integration-system-prd.md) 12.2절 오픈 이슈
(Q1~Q12)는 사용자 확인 전까지 개발이 막히지 않도록, 이 문서에서 **임시 샘플 값**으로
확정하고 코드에 반영한다. 실제 값이 확인되면 이 문서와 관련 설정 파일만 교체하면 된다
(`home-assistant/config/inventory/inventory.yaml.example`, `home-assistant/config/`,
`tablet-ui/src/data/initialDevices.ts` 순으로 영향을 받는다).

> 아래 값은 **사실 확인이 아니라 개발을 진행하기 위한 가정**이다. 실제 보유 기기/환경과
> 다를 수 있으며, PRD 표기 규칙상 여전히 **[확인 필요]** 상태다.

| 오픈 이슈 | 샘플 결정 | 근거 |
|---|---|---|
| Q1 (커튼 브랜드/모델) | **SwitchBot Curtain 3** (모터, BLE) + **SwitchBot Hub Mini** (Wi-Fi 브리지) | PRD 4.3 C4가 "블루투스+와이파이" 확정 통신방식과 부합도가 가장 높다고 분석한 조합. 모터↔BLE 로컬 제어, Hub Mini↔Wi-Fi 클라우드 폴백 |
| Q2 (탭북 기종) | **삼성 Galaxy Tab A9+ (11인치, Android 14)** | UX-03 요구(10~12인치, 가로 고정)에 맞고 벽걸이용으로 흔히 쓰이는 보급형 Android 태블릿 |
| Q4 (기존 허브 세대) | SmartThings **Station (2023, GP-U999BBUALWJ)**, Google **Nest Hub (2세대, 2021)** | 둘 다 Thread Border Router 내장 세대. HA `thread` 통합이 두 기기가 광고하는 기존 Thread 네트워크를 그대로 재사용한다고 가정(별도 OTBR 동글 불필요) |
| Q5 (SmartThings 유료 결제) | **지불함 (월 $4.99)** | 삼성 가전(냉장고/세탁기/에어컨 등)이 Matter 미지원일 가능성이 높아, SmartThings API를 유지하는 쪽이 커버리지(K1)에 유리하다고 가정 |
| Q6 (네트워크 장비) | 공유기: **VLAN/다중 SSID 지원(예: ASUS RT-AX86U 계열)**, mDNS 리플렉터 활성화, IPv6 사용, NAS: **Synology (2-bay)** 보유 | NFR-22 네트워크 분리와 NFR-50 오프호스트 백업 대상 확보를 전제로 진행 |
| Q8 (가족 구성) | 성인 2인 + 어린이 1인(8세) | FR-80~83 역할 설계(Admin/User/Restricted)의 기준값 |
| Q9 (외부 접속) | **Tailscale** (VPN) | 포트포워딩 없이 개인 사용 규모에 설정이 간단함 |
| Q10 (허브 하드웨어) | **미니PC (Intel N100, RAM 16GB, SSD 256GB)** | NFR-04 규모 가정(기기 300~1,500 엔티티)을 감당하면서 SBC보다 여유 있는 사양 |
| Q11 (음성 비서) | Google(Gemini for Home) 위주, Bixby/ThinQ 음성 병행 유지 | FR-90 공존 원칙 그대로 |
| Q12 (에너지 모니터링) | 스마트플러그 추가 구매로 실측(세탁기/건조기/TV 등 주요 기기) | FR-70 요구 충족을 위해 가전 자체 데이터만으로는 부족하다고 가정 |

Q3(삼성/LG/구글 실제 모델 목록), Q7(아파트 월패드 연동 필요 여부)은 코드에 직접 영향이
적어 이번 샘플 확정에서 보류한다(Q7은 PRD상 이미 비목표로 다뤄짐).

## 영향받는 엔티티 명명 규칙

`home-assistant/config/`(packages/dashboards)는 HA의 실제 도메인 규칙을 따르는
entity_id를 샘플로 쓴다. `tablet-ui/src/data/initialDevices.ts` 는 아직 HA와
연동하지 않는 독립 목업이라 자체 id 체계(예: `appliance.washer`, domain은
프론트엔드 전용 타입)를 쓴다 — 실제 연동 시 `homeStore.ts` 를 교체하면서 아래
HA entity_id로 맞춰야 한다. 기기/방 대응은 동일하다:

| home-assistant entity_id | tablet-ui id (현재, 목업 전용) | 기기 | 방 |
|---|---|---|---|
| `light.living_room_main` | `light.living_room_main` | 거실 메인 조명 | living_room |
| `cover.living_room_curtain` | `cover.living_room_curtain` | 거실 커튼 (SwitchBot Curtain 3) | living_room |
| `climate.living_room_ac` | `climate.living_room_ac` | 거실 에어컨 | living_room |
| `media_player.living_room_tv` | `media_player.living_room_tv` | 거실 삼성 TV | living_room |
| `media_player.nest_hub` | `media_player.nest_hub` | Nest Hub 2세대 | living_room |
| `light.bedroom_main` | `light.bedroom_main` | 안방 조명 | bedroom |
| `cover.bedroom_curtain` | `cover.bedroom_curtain` | 안방 커튼 (SwitchBot Curtain 3) | bedroom |
| `climate.bedroom_ac` | `climate.bedroom_ac` | 안방 에어컨 | bedroom |
| `binary_sensor.fridge_door` | `appliance.fridge` | 냉장고 문열림 | kitchen |
| `switch.kitchen_induction` | `appliance.induction` | 인덕션 (고위험) | kitchen |
| `sensor.dishwasher_operation_status` | `appliance.dishwasher` | 식기세척기 | kitchen |
| `sensor.washer_operation_status` | `appliance.washer` | 세탁기 | utility |
| `sensor.dryer_operation_status` | `appliance.dryer` | 건조기 | utility |
