import { homeActions } from '../hooks/useHomeStore'
import type { HouseMode } from '../types/home'

const SCENES: { mode: HouseMode; label: string; icon: string }[] = [
  { mode: 'Away', label: '외출', icon: '🚪' },
  { mode: 'Sleep', label: '취침', icon: '🌙' },
  { mode: 'Home', label: '귀가', icon: '🏠' },
  { mode: 'Vacation', label: '휴가', icon: '🧳' },
]

// UX-04: 주요 씬 버튼은 ≥96dp 터치 타깃. UX-07: 1탭으로 씬을 실행한다(S1/S3).
// 세로(좁은) 화면에서는 2x2, 가로(넓은) 화면에서는 1x4로 배치된다.
export function SceneButtons({ activeMode }: { activeMode: HouseMode }) {
  return (
    <div className="grid grid-cols-2 gap-4 min-[420px]:grid-cols-4">
      {SCENES.map((scene) => {
        const active = activeMode === scene.mode
        return (
          <button
            key={scene.mode}
            type="button"
            onClick={() => homeActions.setHouseMode(scene.mode)}
            className={`flex h-24 flex-col items-center justify-center gap-1 rounded-2xl text-base font-semibold transition-colors ${
              active
                ? 'bg-[var(--color-status-pending)] text-white'
                : 'bg-[var(--color-surface-raised)] text-gray-100 hover:bg-gray-700'
            }`}
          >
            <span className="text-3xl" aria-hidden>
              {scene.icon}
            </span>
            {scene.label}
          </button>
        )
      })}
    </div>
  )
}
