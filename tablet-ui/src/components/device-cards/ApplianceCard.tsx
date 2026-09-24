import type { ApplianceDevice } from '../../types/home'
import { DeviceCardShell } from './DeviceCardShell'

const STATUS_LABEL: Record<ApplianceDevice['status'], string> = {
  idle: '대기',
  running: '작동 중',
  done: '완료',
}

const STATUS_COLOR: Record<ApplianceDevice['status'], string> = {
  idle: 'text-[var(--color-status-off)]',
  running: 'text-[var(--color-status-pending)]',
  done: 'text-[var(--color-status-on)]',
}

const ICON: Record<ApplianceDevice['kind'], string> = {
  washer: '🌀',
  dryer: '🧺',
  dishwasher: '🍽️',
  induction: '🔥',
  fridge: '🧊',
  kimchi_fridge: '🥬',
}

// 고위험 기기(인덕션 등)의 On/Off 전환은 이 카드가 아니라 DeviceDetailView의
// 확인 절차를 거쳐야만 가능하다(FR-22, UX-10). 카드는 상태 요약과 상세 화면
// 진입만 담당한다.
export function ApplianceCard({
  device,
  room,
  onSelect,
}: {
  device: ApplianceDevice
  room?: string
  onSelect: () => void
}) {
  const isHighRisk = device.safetyTier === 'high'

  return (
    <DeviceCardShell
      icon={ICON[device.kind]}
      name={device.name}
      room={room}
      connection={device.connection}
      pending={device.pending}
      lastError={device.lastError}
      onSelect={onSelect}
    >
      {isHighRisk ? (
        <span
          className={`text-sm font-semibold ${
            device.on ? 'text-[var(--color-status-urgent)]' : 'text-[var(--color-status-off)]'
          }`}
        >
          {device.on ? '켜짐' : '꺼짐'}
        </span>
      ) : (
        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold ${STATUS_COLOR[device.status]}`}>
            {STATUS_LABEL[device.status]}
          </span>
          {device.doorOpen && (
            <span className="text-xs text-[var(--color-status-warning)]">문 열림</span>
          )}
        </div>
      )}
    </DeviceCardShell>
  )
}
