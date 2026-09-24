import { useEffect, useState } from 'react'
import { homeActions } from '../hooks/useHomeStore'
import type { HomeState } from '../data/homeStore'

const MODE_LABEL: Record<HomeState['houseMode'], string> = {
  Home: '재실',
  Away: '외출',
  Sleep: '취침',
  Vacation: '휴가',
}

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000 * 15)
    return () => window.clearInterval(id)
  }, [])
  return now
}

// UX-12: 허브 연결 끊김 배너 + 자동 재연결. 데모에서는 버튼으로 연결 끊김을
// 흉내 내고, 몇 초 뒤 자동으로 복구되도록 시뮬레이션한다.
export function StatusBar({ state }: { state: HomeState }) {
  const now = useClock()
  const timeLabel = now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  useEffect(() => {
    if (!state.connectionLost) return
    const id = window.setTimeout(() => homeActions.setConnectionLost(false), 4000)
    return () => window.clearTimeout(id)
  }, [state.connectionLost])

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-4">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold tabular-nums">{timeLabel}</span>
        <span className="rounded-full bg-[var(--color-surface-raised)] px-3 py-1 text-sm text-gray-300">
          {MODE_LABEL[state.houseMode]} 모드
        </span>
      </div>

      {state.connectionLost ? (
        <div className="flex items-center gap-2 rounded-full bg-[var(--color-status-urgent)]/15 px-4 py-2 text-sm text-[var(--color-status-urgent)]">
          <span aria-hidden>⚠</span>
          허브 연결 끊김 — 재연결 시도 중
        </div>
      ) : (
        <button
          type="button"
          className="touch-target rounded-full px-3 text-xs text-gray-500 hover:text-gray-300"
          onClick={() => homeActions.setConnectionLost(true)}
          title="데모: 연결 끊김 상태 미리보기"
        >
          ● 온라인
        </button>
      )}
    </header>
  )
}
