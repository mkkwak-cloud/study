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

// UX-12: 허브 연결 끊김 배너 + 자동 재연결. 끊김 상태를 미리보는 데모
// 컨트롤은 설정 탭(SettingsView)으로 옮겼다.
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
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold tabular-nums sm:text-3xl">{timeLabel}</span>
        <span className="rounded-full bg-[var(--color-surface-raised)] px-3 py-1 text-sm text-gray-300">
          {MODE_LABEL[state.houseMode]} 모드
        </span>
      </div>

      {state.connectionLost && (
        <div className="flex items-center gap-2 rounded-full bg-[var(--color-status-urgent)]/15 px-4 py-2 text-sm text-[var(--color-status-urgent)]">
          <span aria-hidden>⚠</span>
          허브 연결 끊김 — 재연결 시도 중
        </div>
      )}
    </header>
  )
}
