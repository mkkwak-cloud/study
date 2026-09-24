import { useEffect, useState } from 'react'

// UX-06: 무입력 N분 뒤 화면 절전(디밍 → 스크린세이버 → 소등)으로 이어지는
// 트리거. 실제 밝기 제어는 키오스크 앱/태블릿 OS 쪽 몫이라 프론트엔드에서는
// "유휴 상태" 신호만 만들고, 그 신호로 스크린세이버 오버레이를 띄운다.
export function useIdleTimer(idleAfterMs: number) {
  const [isIdle, setIsIdle] = useState(false)

  useEffect(() => {
    let timer: number

    const reset = () => {
      setIsIdle(false)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setIsIdle(true), idleAfterMs)
    }

    const events: (keyof DocumentEventMap)[] = ['pointerdown', 'pointermove', 'keydown']
    events.forEach((event) => document.addEventListener(event, reset))
    reset()

    return () => {
      window.clearTimeout(timer)
      events.forEach((event) => document.removeEventListener(event, reset))
    }
  }, [idleAfterMs])

  return isIdle
}
