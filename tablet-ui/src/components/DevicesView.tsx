import { useState } from 'react'
import type { HomeState } from '../data/homeStore'
import { DeviceFilterChips, type RoomFilter } from './DeviceFilterChips'
import { DeviceGrid } from './DeviceGrid'
import { AddDeviceModal } from './AddDeviceModal'

// FR-11/FR-12: 기기 탭 — 방 필터 칩(삼성 SmartThings "모든 기기" 참고) +
// 반응형 기기 그리드. 세로 화면에서는 칩을 가로 스크롤, 그리드는 2열로
// 자동 축소된다(index.css .device-grid). 상단 '+' 버튼으로 신규 기기를
// 등록할 수 있다(FR-01/FR-02 확장, AddDeviceModal).
export function DevicesView({
  state,
  onSelectDevice,
}: {
  state: HomeState
  onSelectDevice: (deviceId: string) => void
}) {
  const [filter, setFilter] = useState<RoomFilter>('all')
  const [isAddOpen, setAddOpen] = useState(false)

  const devices = Object.values(state.devices).filter(
    (d) => filter === 'all' || d.room === filter,
  )

  return (
    <div className="flex flex-col gap-3 pt-4">
      <div className="flex items-center justify-between px-4 sm:px-6">
        <h1 className="text-lg font-semibold text-gray-100">기기</h1>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="touch-target flex items-center justify-center rounded-full bg-[var(--color-surface-raised)] px-4 text-xl text-gray-200 hover:bg-gray-700"
          aria-label="새 기기 추가"
        >
          +
        </button>
      </div>
      <DeviceFilterChips active={filter} onChange={setFilter} />
      <DeviceGrid devices={devices} showRoom={filter === 'all'} onSelectDevice={onSelectDevice} />

      {isAddOpen && <AddDeviceModal onClose={() => setAddOpen(false)} />}
    </div>
  )
}
