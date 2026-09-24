import { useState } from 'react'
import type { HomeState } from '../data/homeStore'
import { DeviceFilterChips, type RoomFilter } from './DeviceFilterChips'
import { DeviceGrid } from './DeviceGrid'

// FR-11/FR-12: 기기 탭 — 방 필터 칩(삼성 SmartThings "모든 기기" 참고) +
// 반응형 기기 그리드. 세로 화면에서는 칩을 가로 스크롤, 그리드는 2열로
// 자동 축소된다(index.css .device-grid).
export function DevicesView({
  state,
  onSelectDevice,
}: {
  state: HomeState
  onSelectDevice: (deviceId: string) => void
}) {
  const [filter, setFilter] = useState<RoomFilter>('all')

  const devices = Object.values(state.devices).filter(
    (d) => filter === 'all' || d.room === filter,
  )

  return (
    <div className="flex flex-col gap-3 pt-4">
      <DeviceFilterChips active={filter} onChange={setFilter} />
      <DeviceGrid devices={devices} showRoom={filter === 'all'} onSelectDevice={onSelectDevice} />
    </div>
  )
}
