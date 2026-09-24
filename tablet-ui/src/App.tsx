import { useState } from 'react'
import { useHomeState } from './hooks/useHomeStore'
import { useIdleTimer } from './hooks/useIdleTimer'
import { StatusBar } from './components/StatusBar'
import { RoomTabs, type ViewId } from './components/RoomTabs'
import { HomeView } from './components/HomeView'
import { RoomView } from './components/RoomView'
import { IdleOverlay } from './components/IdleOverlay'

// UX-06: 데모용 60초 유휴 기준. 실거치 환경에서는 값을 조정하거나
// HA input_number 로 노출해 태블릿 UI에서 바꿀 수 있게 한다(FR-52와 동일 패턴).
const IDLE_AFTER_MS = 60_000

function App() {
  const state = useHomeState()
  const [view, setView] = useState<ViewId>('home')
  const isIdle = useIdleTimer(IDLE_AFTER_MS)

  return (
    <>
      {/* UX-03: 좁은 세로 화면에서는 안내만 표시하고 대시보드는 숨긴다. */}
      <div className="portrait-hint h-full flex-col items-center justify-center gap-3 bg-[var(--color-surface-sunken)] px-8 text-center text-gray-300">
        <span className="text-4xl" aria-hidden>
          📱↔️📱
        </span>
        <p className="text-lg font-medium">태블릿을 가로로 돌려주세요</p>
        <p className="text-sm text-gray-500">이 대시보드는 가로 모드 전용입니다 (UX-03).</p>
      </div>

      <div className="kiosk-shell flex h-full flex-col overflow-hidden">
        <StatusBar state={state} />
        <RoomTabs active={view} onChange={setView} />
        <div className="flex-1 overflow-y-auto">
          {view === 'home' ? (
            <HomeView state={state} />
          ) : (
            <RoomView state={state} room={view} />
          )}
        </div>
      </div>

      {isIdle && <IdleOverlay />}
    </>
  )
}

export default App
