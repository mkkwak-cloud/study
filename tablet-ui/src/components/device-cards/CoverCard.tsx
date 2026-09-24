import type { CoverDevice } from '../../types/home'
import { DeviceCardShell } from './DeviceCardShell'

// 4.3절 C5(IR/RF 리모컨식)처럼 위치 피드백이 없는 커튼은 position 이 null이며,
// "추정 상태"로 표시해야 한다는 PRD 요구를 그대로 반영한다.
export function CoverCard({ device, onSelect }: { device: CoverDevice; onSelect: () => void }) {
  const hasFeedback = device.position !== null

  return (
    <DeviceCardShell
      icon="🪟"
      name={device.name}
      connection={device.connection}
      pending={device.pending}
      lastError={device.lastError}
      onSelect={onSelect}
    >
      <div className="text-sm font-semibold text-gray-100">
        {device.moving === 'opening' && '여는 중…'}
        {device.moving === 'closing' && '닫는 중…'}
        {!device.moving && hasFeedback && `${device.position}% 열림`}
        {!device.moving && !hasFeedback && '위치 추정 불가'}
      </div>
    </DeviceCardShell>
  )
}
