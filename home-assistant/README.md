# 가정용 IoT 통합 허브 — Home Assistant 구성

[`../docs/iot-integration-system-prd.md`](../docs/iot-integration-system-prd.md) 10장에서 채택한
**A안(Home Assistant 로컬 허브 + 태블릿 키오스크 대시보드)** 의 실행 가능한 최소 골격이다.
설정을 코드로 관리한다는 NFR-41 원칙에 따라 기기 연동은 대부분 HA UI(Config Entry)로 하되,
씬/자동화/대시보드/모드 상태 머신은 이 저장소의 YAML로 버전 관리한다.

## 현재 상태: 샘플 값 기반 골격

PRD 12.2절 오픈 이슈(Q1~Q12)는 아직 사용자 확인 전이지만, 개발을 막지 않기 위해
[`../docs/ASSUMPTIONS.md`](../docs/ASSUMPTIONS.md) 에 정리한 **임시 샘플 값**(커튼=SwitchBot
Curtain 3, 탭북=Galaxy Tab A9+, 허브=SmartThings Station 2023 + Nest Hub 2세대 등)을
채택해 아래 설정을 작성했다. 즉 이 디렉터리는 "무엇이든 채워질 placeholder" 모음이
아니라, **특정 가정 하에 그대로 실행 가능한 하나의 구체적인 구성**이다. 실제 기기가
다르면 `docs/ASSUMPTIONS.md` 와 `config/inventory/inventory.yaml.example` 을 먼저 갱신하고
그 값을 따라가는 항목들(엔티티 ID, IP, 장치 경로)을 같이 바꾼다.

여전히 실제로 동작하려면 다음이 필요하다:

- 실제 하드웨어(허브 PC, Zigbee 코디네이터, 태블릿)를 준비하고 `docker-compose.yml`
  의 장치 경로/IP를 진짜 값으로 교체.
- `notify.mobile_app_admin_phone` 등은 Companion 앱을 실제로 등록해야 생성된다.
- 브랜드별 통합(SmartThings/ThinQ/Nest/SwitchBot/Matter)은 HA UI에서 OAuth/PAT로
  직접 추가해야 한다(YAML로 대신할 수 없는 부분).

## 디렉터리 구조

```
home-assistant/
  docker-compose.yml          # HA core + Mosquitto + Zigbee2MQTT + Matter Server
  .env.example
  config/
    configuration.yaml        # 코어 배선. 기기별 통합은 대부분 HA UI에서 추가
    secrets.yaml.example      # 값 채운 뒤 secrets.yaml 로 복사 (Git 제외)
    inventory/
      inventory.yaml.example  # PRD §4.2 체크리스트의 YAML화. 명명 규칙의 기준 문서
    packages/
      modes.yaml               # FR-43 Home/Away/Sleep/Vacation 상태 머신
      scenes_core.yaml         # S1 외출, S3 취침, S4 아침 커튼 (P0)
      notifications.yaml       # FR-62 헬스 알림, S5 가전 완료, S7 이상 상태
    dashboards/
      ui-lovelace.yaml         # 벽걸이 태블릿 키오스크 대시보드 (7장 UX)
```

## 시작하는 법

1. **인벤토리 확인** — `config/inventory/inventory.yaml.example` 은 이미 샘플 기기로
   채워져 있다. 실제 보유 기기가 다르면 이 파일을 고치고 `docs/ASSUMPTIONS.md` 도
   같이 갱신한 뒤 `inventory.yaml` 로 복사한다.
2. **비밀정보** — `config/secrets.yaml.example` → `config/secrets.yaml`,
   `.env.example` → `.env` 로 복사 후 값을 채운다. 두 파일 모두 `.gitignore` 대상이다.
3. **하드웨어** — 실제 허브 PC, USB Zigbee 코디네이터가 준비되면
   `docker-compose.yml` 의 `devices:` 샘플 경로를 `ls /dev/serial/by-id/` 결과로 교체한다.
4. `docker compose up -d` 로 기동한다.
5. HA 최초 설정 마법사(`http://<host>:8123`)를 완료한 뒤, **설정 > 기기 및 서비스**에서
   브랜드별 통합(SmartThings, LG ThinQ, Google Nest SDM, Matter, SwitchBot, Cast,
   WebOS TV, Samsung TV)을 OAuth/PAT 플로우로 하나씩 추가한다(9.1절 표 참고).
6. 기기가 인식되면 HA에서 실제로 생성된 `entity_id` 가 샘플과 다를 수 있다 — 다르면
   `packages/*.yaml` 과 `dashboards/ui-lovelace.yaml` 의 값을 실제 ID로 맞춘다.
7. 각 기기를 HA의 **영역(Area)** 기능으로 실제 방에 배정한다 — `scenes_core.yaml` 의
   `entity_id: all` 대상 서비스 호출은 area 기준이 아니라 전역이므로, 방별 세분화가
   필요해지면 `area_id:` target 으로 좁힌다(FR-11).

## PRD 대비 커버리지

| PRD 항목 | 구현 위치 | 상태 |
|---|---|---|
| FR-43 (모드 상태 머신) | `packages/modes.yaml` | 완료 |
| S1 외출 / S3 취침 / S4 아침 커튼 | `packages/scenes_core.yaml` | 완료 (샘플 entity_id, docs/ASSUMPTIONS.md) |
| FR-22 (고위험 기기 보호) | `scenes_core.yaml` (`notify_if_high_risk_devices_on`), 대시보드 `hold_action` confirmation | 완료 |
| FR-62 (헬스 알림) | `packages/notifications.yaml` | 완료 (알림 서비스명은 Companion 앱 등록 후 실값으로 교체 필요) |
| S5 (가전 완료 알림) | `packages/notifications.yaml` | 완료 (브랜드별 실제 상태값은 기기 등록 후 확인 필요) |
| S7 (이상 상태 알림 일부: 문열림/누수) | `packages/notifications.yaml` | 완료 (누수 센서는 추가 구매 전제) |
| UX-01~UX-10 (키오스크 대시보드) | `dashboards/ui-lovelace.yaml` | 완료 |
| FR-82 (관리 화면 PIN 보호) | `dashboards/ui-lovelace.yaml` (admin view) | **미해결** — HA 네이티브에 대시보드 PIN 잠금 없음. 커스텀 add-on 검토 필요 |
| NFR-41 (선언적 설정 Git 관리) | 저장소 구조 전체 | 적용됨 |
| M3(P1) 이후 범위 (에너지 모니터링, 공휴일 세부, 음성 노출 등) | 미착수 | PRD 11장 M3 이후 |

## 아직 손대지 않은 것 (의도적으로 범위 밖)

- 실제 브랜드 통합 자격증명/OAuth 앱 등록 — 코드가 아니라 각 벤더 개발자 포털에서
  수행하는 운영 작업이다(9.1절).
- VLAN/mDNS 리플렉터 등 네트워크 분리(NFR-22) — `docs/ASSUMPTIONS.md` 의 샘플 네트워크
  (VLAN 지원 공유기 가정)를 실제 장비 사양에 맞게 조정해야 한다.
- 백업 파이프라인(NFR-50) 의 오프호스트 저장소 연결 — 샘플로 Synology NAS를 가정했으나
  실제 백업 대상/자격증명 설정은 미구현.
- Fully Kiosk Browser 등 Android 키오스크 앱 자체 설정 — Galaxy Tab A9+ 샘플 기준으로
  구성하되, 실제 기종이 다르면 화면 크기/설치 방식만 조정하면 된다.

## 실제 값으로 교체하려면

`docs/ASSUMPTIONS.md` 표에서 해당 오픈 이슈(Q1/Q2/Q4/Q5/Q6/Q9/Q10)의 실제 답을
채운 뒤, 이 저장소에서 그 샘플 값을 참조하는 파일들(`config/inventory/inventory.yaml.example`,
`config/configuration.yaml`, `docker-compose.yml`)을 함께 갱신한다. 코드 구조 자체는
바뀌지 않고 값만 교체하면 되도록 설계했다.
