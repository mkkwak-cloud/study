// PRD FR-03(공통 기기 모델), FR-04(메타데이터), inventory.yaml.example 스키마를
// 프론트엔드 타입으로 옮긴 것. 실제 백엔드(HA WebSocket API) 연동 시 이 타입들을
// HA 의 entity_id/domain/attributes 구조에 맞는 매퍼 뒤로 숨기고, 컴포넌트는
// 그대로 재사용한다.

export type HouseMode = 'Home' | 'Away' | 'Sleep' | 'Vacation'

export type RoomId =
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'utility'
  | 'small_room_1'
  | 'small_room_2'
  | 'small_room_3'
  | 'study'

export interface Room {
  id: RoomId
  name: string
  icon: string
}

export type SafetyTier = 'low' | 'high'

// FR-14: 연결성(온라인/오프라인/클라우드 지연) 표시
export type ConnectionState = 'local' | 'cloud' | 'offline'

export type DeviceDomain =
  | 'light'
  | 'cover'
  | 'climate'
  | 'media_player'
  | 'appliance'
  | 'vacuum'

interface DeviceBase {
  id: string
  name: string
  room: RoomId
  safetyTier: SafetyTier
  connection: ConnectionState
  /** FR-21: 명령 전송 직후 낙관적 상태를 표시하기 위한 플래그 */
  pending: boolean
  /** FR-33: 마지막 상태 갱신 시각 — 신선도(stale) 판정에 사용 */
  lastUpdated: number
  /** FR-21/UX-09: 직전 명령이 실패한 경우 표시할 사유 */
  lastError?: string
}

export interface LightDevice extends DeviceBase {
  domain: 'light'
  on: boolean
  brightness: number // 0-100
}

export interface CoverDevice extends DeviceBase {
  domain: 'cover'
  /**
   * 4.3 C5(IR/RF 리모컨식)처럼 위치 피드백이 없는 기종은 position 이 null이다.
   * UI는 이 경우 "추정 상태"로 표시해야 한다(4.3절 요구).
   */
  position: number | null
  moving: 'opening' | 'closing' | null
}

export interface ClimateDevice extends DeviceBase {
  domain: 'climate'
  on: boolean
  mode: 'cool' | 'heat' | 'fan_only' | 'dry'
  targetTemp: number
  currentTemp: number
}

export interface MediaPlayerDevice extends DeviceBase {
  domain: 'media_player'
  on: boolean
  source?: string
  volume: number // 0-100
}

export type ApplianceStatus = 'idle' | 'running' | 'done'

export interface ApplianceDevice extends DeviceBase {
  domain: 'appliance'
  kind: 'washer' | 'dryer' | 'dishwasher' | 'induction' | 'fridge' | 'kimchi_fridge'
  status: ApplianceStatus
  /** 인덕션처럼 On/Off 제어가 있는 고위험 기기용 */
  on?: boolean
  /** 냉장고 문열림 등 이진 상태를 겸하는 경우 */
  doorOpen?: boolean
}

// 로봇청소기는 세탁기/건조기 등과 달리 벤더가 원격 시작을 막지 않는 가전이라
// (FR-22 예외) appliance 로 뭉치지 않고 HA의 실제 vacuum 도메인처럼 별도
// 모델링해 시작/정지/충전독 복귀 컨트롤을 제공한다.
export type VacuumStatus = 'docked' | 'cleaning' | 'paused' | 'returning'

export interface VacuumDevice extends DeviceBase {
  domain: 'vacuum'
  status: VacuumStatus
  batteryLevel: number // 0-100
}

export type Device =
  | LightDevice
  | CoverDevice
  | ClimateDevice
  | MediaPlayerDevice
  | ApplianceDevice
  | VacuumDevice

export interface AttentionItem {
  id: string
  severity: 'info' | 'warning' | 'urgent' // FR-61 알림 등급
  message: string
}

// FR-01/FR-02 확장: UI에서 새 기기를 등록하는 입력값. 실제 HA 연동 단계에서는
// 이 입력이 "설정 > 기기 및 서비스"의 config flow로 대체된다(README 참고).
export interface NewDeviceInput {
  name: string
  room: RoomId
  domain: DeviceDomain
  connection: ConnectionState
  /** domain === 'appliance' 일 때만 사용 */
  applianceKind?: ApplianceDevice['kind']
  /** domain === 'appliance' 일 때만 사용. FR-22 고위험 여부 */
  highRisk?: boolean
}
