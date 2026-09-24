# 가정용 IoT 통합 허브 — Home Assistant 구성

[`../docs/iot-integration-system-prd.md`](../docs/iot-integration-system-prd.md) 10장에서 채택한
**A안(Home Assistant 로컬 허브 + 태블릿 키오스크 대시보드)** 의 실행 가능한 최소 골격이다.
설정을 코드로 관리한다는 NFR-41 원칙에 따라 기기 연동은 대부분 HA UI(Config Entry)로 하되,
씬/자동화/대시보드/모드 상태 머신은 이 저장소의 YAML로 버전 관리한다.

## 현재 상태: 골격(scaffold) 단계

이 디렉터리는 **실행 가능한 구조**이지 **바로 동작하는 완성품이 아니다**. PRD 12.2절의
오픈 이슈(Q1~Q12) 상당수가 아직 미확정이라, 다음이 모두 placeholder다:

- 모든 `entity_id` (예: `cover.bedroom_curtain`, `light.living_room_main`) — 실제 기기를
  HA에 등록하기 전까지는 존재하지 않는 엔티티다.
- `notify.mobile_app_admin_phone` 등 알림 서비스명 — Companion 앱 등록 후 생성된다.
- 커튼 연동 경로(BLE 로컬 vs Tuya 로컬화, PRD 4.3 C3/C4) — 브랜드 확인 전까지 미정.
- Zigbee 코디네이터 장치 경로, Thread/OTBR 구성 — 하드웨어 확정(Q4/Q10) 전까지 미정.

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

1. **인벤토리 확정** — `config/inventory/inventory.yaml.example` 을 복사해
   `inventory.yaml` 로 만들고, 실제 보유 기기로 채운다(오픈 이슈 Q1~Q4 우선).
2. **비밀정보** — `config/secrets.yaml.example` → `config/secrets.yaml`,
   `.env.example` → `.env` 로 복사 후 값을 채운다. 두 파일 모두 `.gitignore` 대상이다.
3. **하드웨어** — 실제 허브(미니PC/SBC), USB Zigbee 코디네이터가 준비되면
   `docker-compose.yml` 의 `devices:` 경로를 `ls /dev/serial/by-id/` 결과로 교체한다.
4. `docker compose up -d` 로 기동한다.
5. HA 최초 설정 마법사(`http://<host>:8123`)를 완료한 뒤, **설정 > 기기 및 서비스**에서
   브랜드별 통합(SmartThings, LG ThinQ, Google Nest SDM, Matter, Cast, WebOS TV,
   Samsung TV)을 OAuth/PAT 플로우로 하나씩 추가한다(9.1절 표 참고).
6. 기기가 인식되면 HA에서 실제로 생성된 `entity_id` 를 확인하고, 이 저장소의
   `packages/*.yaml` 과 `dashboards/ui-lovelace.yaml` 의 placeholder 를 교체한다.
7. 각 기기를 HA의 **영역(Area)** 기능으로 실제 방에 배정한다 — `scenes_core.yaml` 의
   `entity_id: all` 대상 서비스 호출은 area 기준이 아니라 전역이므로, 방별 세분화가
   필요해지면 `area_id:` target 으로 좁힌다(FR-11).

## PRD 대비 커버리지

| PRD 항목 | 구현 위치 | 상태 |
|---|---|---|
| FR-43 (모드 상태 머신) | `packages/modes.yaml` | 골격 완료 |
| S1 외출 / S3 취침 / S4 아침 커튼 | `packages/scenes_core.yaml` | 골격 완료, entity_id 미확정 |
| FR-22 (고위험 기기 보호) | `scenes_core.yaml` (`notify_if_high_risk_devices_on`), 대시보드 `hold_action` confirmation | 골격 완료 |
| FR-62 (헬스 알림) | `packages/notifications.yaml` | 골격 완료, 알림 서비스명 미확정 |
| S5 (가전 완료 알림) | `packages/notifications.yaml` | 골격 완료, 브랜드별 상태값 확인 필요 |
| S7 (이상 상태 알림 일부: 문열림/누수) | `packages/notifications.yaml` | 골격 완료, 센서 미보유 |
| UX-01~UX-10 (키오스크 대시보드) | `dashboards/ui-lovelace.yaml` | 골격 완료 |
| FR-82 (관리 화면 PIN 보호) | `dashboards/ui-lovelace.yaml` (admin view) | **미해결** — HA 네이티브에 대시보드 PIN 잠금 없음. 커스텀 add-on 검토 필요 |
| NFR-41 (선언적 설정 Git 관리) | 저장소 구조 전체 | 적용됨 |
| M3(P1) 이후 범위 (에너지 모니터링, 공휴일 세부, 음성 노출 등) | 미착수 | PRD 11장 M3 이후 |

## 아직 손대지 않은 것 (의도적으로 범위 밖)

- 실제 브랜드 통합 자격증명/OAuth 앱 등록 — 코드가 아니라 각 벤더 개발자 포털에서
  수행하는 운영 작업이다(9.1절).
- VLAN/mDNS 리플렉터 등 네트워크 분리(NFR-22) — 공유기/방화벽 장비 확인(Q6) 후
  네트워크 계층에서 별도로 구성한다.
- 백업 파이프라인(NFR-50) 의 오프호스트 저장소 연결 — NAS/클라우드 대상 확인(Q6) 필요.
- Fully Kiosk Browser 등 Android 키오스크 앱 자체 설정 — 태블릿 기종 확인(Q2) 후 진행.

이 골격을 채우려면 PRD 12.2절 오픈 이슈 중 최소 Q1(커튼 브랜드), Q2(탭북 기종),
Q4(기존 허브 정확한 세대), Q6(네트워크 장비) 에 대한 답이 필요하다.
