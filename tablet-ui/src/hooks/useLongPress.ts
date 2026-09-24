import { useRef } from 'react'

interface LongPressOptions {
  onLongPress: () => void
  onTap?: () => void
  thresholdMs?: number
}

// UX-10: 고위험 기기 카드는 길게 누르기(+확인)를 요구한다.
export function useLongPress({ onLongPress, onTap, thresholdMs = 600 }: LongPressOptions) {
  const timerRef = useRef<number | null>(null)
  const firedRef = useRef(false)

  const start = () => {
    firedRef.current = false
    timerRef.current = window.setTimeout(() => {
      firedRef.current = true
      onLongPress()
    }, thresholdMs)
  }

  const clear = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const end = () => {
    clear()
    if (!firedRef.current) onTap?.()
  }

  return {
    onPointerDown: start,
    onPointerUp: end,
    onPointerLeave: clear,
  }
}
