import { rooms } from '../data/initialDevices'
import type { RoomId } from '../types/home'

export type ViewId = 'home' | RoomId

const TABS: { id: ViewId; label: string; icon: string }[] = [
  { id: 'home', label: '홈', icon: '🏠' },
  ...rooms.map((r) => ({ id: r.id as ViewId, label: r.name, icon: r.icon })),
]

// FR-11/FR-13: 홈/방별/씬 뷰를 오가는 탭. UX-04: 탭 높이도 터치 타깃 기준을 따른다.
export function RoomTabs({
  active,
  onChange,
}: {
  active: ViewId
  onChange: (view: ViewId) => void
}) {
  return (
    <nav className="flex gap-2 overflow-x-auto px-6 pb-4">
      {TABS.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`touch-target flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-[var(--color-status-pending)] text-white'
                : 'bg-[var(--color-surface-raised)] text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span aria-hidden>{tab.icon}</span>
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
