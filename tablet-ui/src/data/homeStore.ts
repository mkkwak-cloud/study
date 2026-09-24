import type { AttentionItem, ClimateDevice, Device, HouseMode } from '../types/home'
import { initialDevices } from './initialDevices'

// 프론트엔드 전용 목(mock) 스토어.
//
// 실제 연동 단계에서는 이 파일 하나를 HA WebSocket API 클라이언트로 교체하면
// 된다: subscribe()는 `subscribe_events`/`subscribe_entities` 구독으로,
// setHouseMode/toggleLight 등의 액션은 `call_service` 호출로 바뀌고,
// 컴포넌트 쪽 코드는 변경할 필요가 없도록 의도적으로 얇게 설계했다(FR-30~32).
//
// 지연 시뮬레이션은 PRD KPI를 그대로 반영한다:
//   - local 경로: K2 목표 p95 300ms 근방
//   - cloud 경로: K4 목표 p95 3s 근방
// 로 랜덤 지연을 주어, 화면에서 "로컬은 즉각, 클라우드는 느림"을 체감하게 한다.

export interface HomeState {
  houseMode: HouseMode
  devices: Record<string, Device>
  connectionLost: boolean // UX-12 데모/테스트용 토글
}

type Listener = () => void

const LOCAL_DELAY = () => 120 + Math.random() * 180 // ~120-300ms
const CLOUD_DELAY = () => 700 + Math.random() * 2000 // ~0.7-2.7s
// 데모에서 실패 케이스(UX-09)를 재현하기 위한 낮은 확률의 인위적 실패.
const FAILURE_RATE = 0.06

function delayFor(device: Device) {
  return device.connection === 'local' ? LOCAL_DELAY() : CLOUD_DELAY()
}

class HomeStore {
  private state: HomeState
  private listeners = new Set<Listener>()

  constructor() {
    const devices: Record<string, Device> = {}
    for (const d of initialDevices) devices[d.id] = d
    this.state = { houseMode: 'Home', devices, connectionLost: false }
  }

  subscribe = (listener: Listener) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot = (): HomeState => this.state

  private emit() {
    for (const l of this.listeners) l()
  }

  private setDevice(id: string, patch: Partial<Device>) {
    const current = this.state.devices[id]
    if (!current) return
    this.state = {
      ...this.state,
      devices: {
        ...this.state.devices,
        [id]: { ...current, ...patch } as Device,
      },
    }
    this.emit()
  }

  /**
   * FR-21: 명령 직후 낙관적 상태를 즉시 반영하고, 지연 후 확정하거나
   * 실패 시 원래 상태로 롤백하며 오류 사유를 표시한다.
   */
  private commit(id: string, optimisticPatch: Partial<Device>, confirmedPatch: Partial<Device>) {
    const before = this.state.devices[id]
    if (!before) return
    this.setDevice(id, { ...optimisticPatch, pending: true, lastError: undefined })

    const delay = delayFor(before)
    window.setTimeout(() => {
      const willFail = Math.random() < FAILURE_RATE
      if (willFail) {
        this.setDevice(id, {
          ...before,
          pending: false,
          lastError:
            before.connection === 'cloud'
              ? '클라우드 응답 없음 — 잠시 후 다시 시도하세요'
              : '기기가 응답하지 않습니다',
        })
        return
      }
      this.setDevice(id, {
        ...confirmedPatch,
        pending: false,
        lastUpdated: Date.now(),
        lastError: undefined,
      })
    }, delay)
  }

  // --- 개별 기기 제어 ---

  toggleLight(id: string) {
    const d = this.state.devices[id]
    if (!d || d.domain !== 'light') return
    const next = !d.on
    this.commit(id, { on: next }, { on: next })
  }

  setBrightness(id: string, brightness: number) {
    const d = this.state.devices[id]
    if (!d || d.domain !== 'light') return
    this.commit(id, { brightness }, { brightness, on: brightness > 0 })
  }

  setCoverPosition(id: string, position: number) {
    const d = this.state.devices[id]
    if (!d || d.domain !== 'cover') return
    const moving = position > (d.position ?? 0) ? 'opening' : 'closing'
    this.commit(id, { moving }, { position, moving: null })
  }

  toggleClimate(id: string) {
    const d = this.state.devices[id]
    if (!d || d.domain !== 'climate') return
    const next = !d.on
    this.commit(id, { on: next }, { on: next })
  }

  adjustClimateTemp(id: string, delta: number) {
    const d = this.state.devices[id]
    if (!d || d.domain !== 'climate') return
    const targetTemp = Math.min(30, Math.max(16, d.targetTemp + delta))
    this.commit(id, { targetTemp }, { targetTemp })
  }

  setClimateMode(id: string, mode: ClimateDevice['mode']) {
    const d = this.state.devices[id]
    if (!d || d.domain !== 'climate') return
    this.commit(id, { mode }, { mode })
  }

  toggleMediaPlayer(id: string) {
    const d = this.state.devices[id]
    if (!d || d.domain !== 'media_player') return
    const next = !d.on
    this.commit(id, { on: next }, { on: next })
  }

  setVolume(id: string, volume: number) {
    const d = this.state.devices[id]
    if (!d || d.domain !== 'media_player') return
    this.commit(id, { volume }, { volume })
  }

  /** FR-22: 고위험 기기 토글. 확인 절차는 호출 측(UI)에서 이미 통과한 상태로 가정한다. */
  toggleHighRiskAppliance(id: string) {
    const d = this.state.devices[id]
    if (!d || d.domain !== 'appliance') return
    const next = !d.on
    this.commit(id, { on: next }, { on: next })
  }

  // --- 씬 / 모드 (packages/scenes_core.yaml 의 로직을 그대로 옮김) ---

  setHouseMode(mode: HouseMode) {
    this.state = { ...this.state, houseMode: mode }
    this.emit()

    if (mode === 'Away' || mode === 'Sleep') {
      for (const d of Object.values(this.state.devices)) {
        if (d.domain === 'light' && d.on) this.toggleLight(d.id)
        if (d.domain === 'media_player' && d.on) this.toggleMediaPlayer(d.id)
        if (d.domain === 'climate' && d.on) this.toggleClimate(d.id)
        if (d.domain === 'cover' && (d.position ?? 0) > 0) this.setCoverPosition(d.id, 0)
      }
    }
  }

  // --- 데모/테스트 ---

  setConnectionLost(lost: boolean) {
    this.state = { ...this.state, connectionLost: lost }
    this.emit()
  }
}

export const homeStore = new HomeStore()

// FR-10: 주의 상태 — 열린 커튼, 켜진 고위험 가전, 통신 오류를 파생 계산한다.
export function computeAttentionItems(state: HomeState): AttentionItem[] {
  const items: AttentionItem[] = []
  const devices = Object.values(state.devices)

  const openCovers = devices.filter(
    (d) => d.domain === 'cover' && (d.position ?? 0) > 0,
  )
  if (openCovers.length > 0) {
    items.push({
      id: 'open-covers',
      severity: 'info',
      message: `열린 커튼 ${openCovers.length}개`,
    })
  }

  const highRiskOn = devices.filter(
    (d) => d.domain === 'appliance' && d.safetyTier === 'high' && d.on,
  )
  if (highRiskOn.length > 0) {
    items.push({
      id: 'high-risk-on',
      severity: 'warning',
      message: `켜진 고위험 가전: ${highRiskOn.map((d) => d.name).join(', ')}`,
    })
  }

  const errors = devices.filter((d) => d.lastError)
  if (errors.length > 0) {
    items.push({
      id: 'device-errors',
      severity: 'warning',
      message: `${errors.length}개 기기에서 명령 실패`,
    })
  }

  if (state.connectionLost) {
    items.push({
      id: 'connection-lost',
      severity: 'urgent',
      message: '허브 연결 끊김',
    })
  }

  return items
}
