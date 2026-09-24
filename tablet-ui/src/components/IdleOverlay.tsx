import { useEffect, useState } from 'react'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

// UX-06 스크린세이버 화면. 탭/움직임이 있으면 useIdleTimer가 자동으로 해제한다.
export function IdleOverlay() {
  const now = useClock()

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-black text-gray-200">
      <span className="text-7xl font-light tabular-nums">
        {now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
      </span>
      <span className="text-sm text-gray-500">
        {now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
      </span>
      <span className="mt-8 text-xs text-gray-600">화면을 터치하세요</span>
    </div>
  )
}
