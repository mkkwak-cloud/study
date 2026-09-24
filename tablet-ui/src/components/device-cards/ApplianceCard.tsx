import type { ApplianceDevice } from '../../types/home'
import { homeActions } from '../../hooks/useHomeStore'
import { useLongPress } from '../../hooks/useLongPress'
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

// FR-22: 고위험 기기(인덕션 등)는 원격 시작을 우회하지 않고, 길게 누르기 +
// 확인 절차를 거쳐야만 On/Off 를 바꿀 수 있다(UX-10).
export function ApplianceCard({ device }: { device: ApplianceDevice }) {
  const isHighRisk = device.safetyTier === 'high'

  const longPress = useLongPress({
    onLongPress: () => {
      const ok = window.confirm(`${device.name} 상태를 변경하시겠습니까?`)
      if (ok) homeActions.toggleHighRiskAppliance(device.id)
    },
  })

  if (isHighRisk) {
    return (
      <DeviceCardShell
        icon={ICON[device.kind]}
        name={device.name}
        connection={device.connection}
        pending={device.pending}
        lastError={device.lastError}
        {...longPress}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-sm font-semibold ${
              device.on ? 'text-[var(--color-status-urgent)]' : 'text-[var(--color-status-off)]'
            }`}
          >
            {device.on ? '켜짐' : '꺼짐'}
          </span>
          <span className="text-xs text-gray-500">길게 눌러 변경</span>
        </div>
      </DeviceCardShell>
    )
  }

  return (
    <DeviceCardShell
      icon={ICON[device.kind]}
      name={device.name}
      connection={device.connection}
      pending={device.pending}
      lastError={device.lastError}
    >
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${STATUS_COLOR[device.status]}`}>
          {STATUS_LABEL[device.status]}
        </span>
        {(device.kind === 'fridge' || device.kind === 'kimchi_fridge') && device.doorOpen && (
          <span className="text-xs text-[var(--color-status-warning)]">문 열림</span>
        )}
      </div>
    </DeviceCardShell>
  )
}
