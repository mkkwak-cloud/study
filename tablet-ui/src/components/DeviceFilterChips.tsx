import { rooms } from '../data/initialDevices'
import type { RoomId } from '../types/home'

export type RoomFilter = 'all' | RoomId

const CHIPS: { id: RoomFilter; label: string }[] = [
  { id: 'all', label: '모든 기기' },
  ...rooms.map((r) => ({ id: r.id as RoomFilter, label: r.name })),
]

// 삼성 SmartThings 앱의 "모든 기기 / 개인 기기" 필터 탭을 참고한 방 필터 칩.
// 가로 스크롤로 좁은(세로) 화면에서도 모든 방에 접근할 수 있다.
export function DeviceFilterChips({
  active,
  onChange,
}: {
  active: RoomFilter
  onChange: (filter: RoomFilter) => void
}) {
  return (
    <nav className="flex gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
      {CHIPS.map((chip) => {
        const isActive = chip.id === active
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onChange(chip.id)}
            className={`touch-target shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-[var(--color-status-pending)] text-white'
                : 'bg-[var(--color-surface-raised)] text-gray-300 hover:bg-gray-700'
            }`}
          >
            {chip.label}
          </button>
        )
      })}
    </nav>
  )
}
