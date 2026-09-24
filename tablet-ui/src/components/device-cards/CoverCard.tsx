import type { CoverDevice } from '../../types/home'
import { homeActions } from '../../hooks/useHomeStore'
import { DeviceCardShell } from './DeviceCardShell'

// 4.3절 C5(IR/RF 리모컨식)처럼 위치 피드백이 없는 커튼은 position 이 null이며,
// "추정 상태"로 표시해야 한다는 PRD 요구를 그대로 반영한다.
export function CoverCard({ device }: { device: CoverDevice }) {
  const hasFeedback = device.position !== null

  return (
    <DeviceCardShell
      icon="🪟"
      name={device.name}
      connection={device.connection}
      pending={device.pending}
      lastError={device.lastError}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-100">
          {device.moving === 'opening' && '여는 중…'}
          {device.moving === 'closing' && '닫는 중…'}
          {!device.moving && hasFeedback && `${device.position}% 열림`}
          {!device.moving && !hasFeedback && '위치 추정 불가'}
        </span>
      </div>

      {hasFeedback && (
        <input
          type="range"
          min={0}
          max={100}
          value={device.position ?? 0}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => homeActions.setCoverPosition(device.id, Number(e.target.value))}
          className="touch-target w-full accent-[var(--color-status-pending)]"
          aria-label={`${device.name} 위치`}
        />
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="touch-target rounded-xl bg-[var(--color-surface-sunken)] py-2 text-sm text-gray-200"
          onClick={(e) => {
            e.stopPropagation()
            homeActions.setCoverPosition(device.id, 100)
          }}
        >
          열기
        </button>
        <button
          type="button"
          className="touch-target rounded-xl bg-[var(--color-surface-sunken)] py-2 text-sm text-gray-200"
          onClick={(e) => {
            e.stopPropagation()
            homeActions.setCoverPosition(device.id, 0)
          }}
        >
          닫기
        </button>
      </div>
    </DeviceCardShell>
  )
}
