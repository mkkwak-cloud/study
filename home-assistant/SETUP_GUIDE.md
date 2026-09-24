# 허브 하드웨어 준비 & 설치 가이드

이 문서는 `docker-compose.yml`을 실제로 돌릴 물리 서버를 처음부터 준비하는
절차다. **완료하면**: 허브가 켜져 있고, `http://<허브IP>:8123`으로 HA 최초
설정 마법사에 접속할 수 있는 상태가 된다. 그 다음(브랜드별 기기 연동)은
`README.md`의 "시작하는 법" 5~7번을 따른다.

> 이 저장소의 `docker-compose.yml`은 **Home Assistant Container**(공식 설치
> 방식 중 Docker 기반) 방법을 쓴다. HA OS(SD카드 이미지 굽는 방식)나
> Add-on 스토어가 있는 Supervised 방식이 아니다 — Zigbee2MQTT, Matter
> Server를 HA Add-on 대신 별도 컨테이너로 직접 구성했기 때문에, 일반 리눅스
> 서버에 Docker만 있으면 된다.

---

## 1. 하드웨어 선택

`docs/ASSUMPTIONS.md`(Q10)의 샘플 결정은 **미니PC(Intel N100, RAM 16GB,
SSD 256GB)** 다. 실제 구매 전 아래 기준으로 확인한다.

| 항목 | 최소 기준 | 이유 |
|---|---|---|
| CPU | x86_64, 4코어 이상 (Intel N100/N150 등) | NFR-04: 기기 300~1,500 엔티티, 자동화 50개, 이벤트 피크 50/s를 컨테이너 3~4개(HA/Mosquitto/Zigbee2MQTT/Matter Server)가 나눠 처리 |
| RAM | 8GB 이상, 16GB 권장 | HA 코어 + 부속 컨테이너 + 로그/DB 캐시 |
| 저장장치 | **SSD/NVMe 필수**, 128GB 이상 | SD카드/USB는 잦은 쓰기(상태 이력, DB)로 조기 고장 — R6 리스크 대응(NFR-50) |
| 네트워크 | 유선 기가비트 이더넷 포트 | 로컬 기기 제어 지연(K2, NFR-01) 안정성. Wi-Fi 전용 미니PC는 피한다 |
| USB | 여유 포트 2개 이상 | Zigbee 코디네이터 동글 + (필요시) Thread RCP 동글 |
| 블루투스 | 내장 또는 USB BLE 동글 | SwitchBot Curtain 등 BLE 기기(오픈 이슈 Q1) 로컬 제어에 필요 |
| 가상화 | 불필요 (베어메탈 권장) | 기존 서버/NAS에 가상머신으로 올려도 되지만, USB 패스스루 설정이 번거로워짐 |

**대안**: 이미 24시간 켜두는 NAS(Synology 등)가 있다면 그 위에 Docker로
올려도 되지만, USB Zigbee 동글 패스스루가 NAS OS마다 제약이 있어 초기
구성 난이도가 올라간다. 처음이라면 전용 미니PC를 권장한다.

### 구매 체크리스트

- [ ] 미니PC 본체 (위 표 기준)
- [ ] USB Zigbee 코디네이터 (샘플: Sonoff Zigbee 3.0 USB Dongle Plus — `docker-compose.yml` 주석 참고)
- [ ] 유선 랜 케이블
- [ ] (권장) 소형 UPS — NFR-13, 정전 시 갑작스런 종료로 인한 SSD/DB 손상 방지
- [ ] (권장) HDMI 케이블 + 모니터/키보드 — 최초 OS 설치 시 1회용

---

## 2. OS 설치

**Debian 12** 또는 **Ubuntu Server 24.04 LTS** (헤드리스, GUI 없는 서버판)
를 권장한다. 설치 마법사에서:

1. **OpenSSH server** 옵션을 체크해 설치 — 이후 원격 터미널 접속용.
2. 사용자 계정을 만들고 **고정 IP 또는 DHCP 예약**을 준비한다(공유기에서
   이 기기의 MAC 주소로 IP 예약 — README의 `static_ip_or_reservation` 항목과
   연결됨).
3. 설치 완료 후 모니터/키보드는 분리하고, 이후는 SSH로만 접속한다.

```bash
ssh <사용자>@<허브IP>
sudo apt update && sudo apt upgrade -y
```

---

## 3. Docker 설치

```bash
# Docker 공식 설치 스크립트 (Debian/Ubuntu 공용)
curl -fsSL https://get.docker.com | sudo sh

# 현재 사용자를 docker 그룹에 추가 (재로그인 필요)
sudo usermod -aG docker $USER
newgrp docker

# Docker Compose plugin 포함 여부 확인
docker compose version
```

`docker compose version`이 출력되면 준비 완료. (구버전 `docker-compose`
독립 바이너리가 아니라 `docker compose`—공백 하나—plugin 방식임에 주의.)

---

## 4. 저장소 가져오기 + 설정 파일 준비

```bash
git clone <이 저장소 URL>
cd study/home-assistant

cp .env.example .env
cp config/secrets.yaml.example config/secrets.yaml
cp config/inventory/inventory.yaml.example config/inventory/inventory.yaml
```

- `config/secrets.yaml`: 위도/경도(`home_latitude`/`home_longitude`, 지도에서
  집 좌표 확인), MQTT 계정 정보를 채운다. **이 파일은 `.gitignore` 대상이라
  절대 커밋되지 않는다.**
- `config/inventory/inventory.yaml`: 실제 보유 기기가 샘플과 다르면 이 시점에
  고쳐도 되고, 나중에 기기를 하나씩 등록하면서 채워도 된다.

---

## 5. USB Zigbee 코디네이터 경로 확인

동글을 미니PC에 꽂은 뒤:

```bash
ls /dev/serial/by-id/
```

출력된 경로(예: `usb-ITead_Sonoff_Zigbee_3.0_USB_Dongle_Plus_xxxxx-if00-port0`)를
복사해서 `docker-compose.yml`의 `zigbee2mqtt` 서비스 `devices:` 항목의
샘플 경로와 교체한다.

```yaml
    devices:
      - /dev/serial/by-id/usb-ITead_Sonoff_Zigbee_3.0_USB_Dongle_Plus_실제경로:/dev/ttyACM0
```

---

## 6. 기동

```bash
docker compose up -d
docker compose ps        # 4개 서비스(homeassistant/mosquitto/zigbee2mqtt/matter-server) 모두 Up 인지 확인
docker compose logs -f homeassistant   # 최초 부팅 로그 확인 (Ctrl+C로 빠져나오기)
```

브라우저에서 `http://<허브IP>:8123` 접속 → HA 최초 설정 마법사(계정 생성,
위치 확인 등)를 완료한다.

---

## 7. 완료 확인 체크리스트

다음 단계(브랜드별 기기 연동, README "시작하는 법" 5~7번)로 넘어가기 전에
아래를 모두 확인한다.

- [ ] `http://<허브IP>:8123` 접속 및 계정 생성 완료
- [ ] `docker compose ps`에서 4개 컨테이너 모두 `Up` 상태
- [ ] HA 설정 > 시스템 > 하드웨어에서 CPU/메모리/디스크 사용률이 정상 범위
- [ ] Zigbee2MQTT 로그(`docker compose logs zigbee2mqtt`)에서 코디네이터를
      정상 인식했는지 확인 (`Coordinator firmware version` 등의 로그)
- [ ] 허브를 재부팅해도(`sudo reboot`) 컨테이너가 자동으로 다시 뜨는지 확인
      (compose의 `restart: unless-stopped` 정책 검증)
- [ ] 공유기에서 이 허브에 고정 IP/DHCP 예약이 걸려 있는지 확인

모두 통과하면 `README.md`의 5번(브랜드별 통합 OAuth 등록)부터 이어간다.

---

## 문제 해결

| 증상 | 원인/해결 |
|---|---|
| `docker compose up -d` 실행 시 `permission denied` | `usermod -aG docker $USER` 후 재로그인(`newgrp docker` 또는 SSH 재접속) 안 했을 가능성 |
| Zigbee2MQTT 컨테이너가 계속 재시작됨 | `/dev/serial/by-id/` 경로가 실제 동글과 다름 — 동글을 뽑았다 다시 꽂고 `ls` 재확인 |
| `:8123` 접속 안 됨 | 방화벽(ufw 등)에서 8123 포트 차단 여부 확인, `docker compose ps`로 homeassistant 컨테이너가 떠 있는지 확인 |
| 재부팅 후 서비스가 안 뜸 | `docker compose ps -a`로 상태 확인, `docker compose logs <서비스명>`으로 에러 원인 파악 |

---

## 다음 단계

이 가이드는 **허브를 켜는 것까지**다. 이후 순서는 PRD의 Matter 우선
원칙(IR-01)을 따른다:

1. 실제 보유 기기 중 **Matter 지원 여부**를 먼저 확인한다(제품 상자/설명서의
   Matter 로고, 또는 제조사 앱에서 확인).
2. Matter 지원 기기는 HA 설정 > 기기 및 서비스 > Matter 로 직접 커미셔닝.
3. Matter 미지원 기기만 SmartThings/ThinQ/Nest SDM 등 브랜드 API로 연동한다
   (README "시작하는 법" 5번, 9.1절 표 참고). SmartThings는 2026-10부터
   유료(월 $4.99)이므로, Matter로 이관 가능한 기기를 먼저 걸러낸 뒤 결제
   여부를 결정한다(IR-03, 오픈 이슈 Q5).
