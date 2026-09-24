// PRD FR-03(공통 기기 모델), FR-04(메타데이터), inventory.yaml.example 스키마를
// 프론트엔드 타입으로 옮긴 것. 실제 백엔드(HA WebSocket API) 연동 시 이 타입들을
// HA 의 entity_id/domain/attributes 구조에 맞는 매퍼 뒤로 숨기고, 컴포넌트는
// 그대로 재사용한다.

export type HouseMode = 'Home' | 'Away' | 'Sleep' | 'Vacation'

export type RoomId = 'living_room' | 'bedroom' | 'kitchen' | 'utility'

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
  kind: 'washer' | 'dryer' | 'dishwasher' | 'induction' | 'fridge'
  status: ApplianceStatus
  /** 인덕션처럼 On/Off 제어가 있는 고위험 기기용 */
  on?: boolean
  /** 냉장고 문열림 등 이진 상태를 겸하는 경우 */
  doorOpen?: boolean
}

export type Device =
  | LightDevice
  | CoverDevice
  | ClimateDevice
  | MediaPlayerDevice
  | ApplianceDevice

export interface AttentionItem {
  id: string
  severity: 'info' | 'warning' | 'urgent' // FR-61 알림 등급
  message: string
}
