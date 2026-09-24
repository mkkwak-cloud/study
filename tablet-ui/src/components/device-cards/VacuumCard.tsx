import type { VacuumDevice } from '../../types/home'
import { DeviceCardShell } from './DeviceCardShell'

const STATUS_LABEL: Record<VacuumDevice['status'], string> = {
  docked: '충전독',
  cleaning: '청소 중',
  paused: '일시정지',
  returning: '복귀 중',
}

const STATUS_COLOR: Record<VacuumDevice['status'], string> = {
  docked: 'text-[var(--color-status-off)]',
  cleaning: 'text-[var(--color-status-on)]',
  paused: 'text-[var(--color-status-warning)]',
  returning: 'text-[var(--color-status-pending)]',
}

export function VacuumCard({
  device,
  room,
  onSelect,
}: {
  device: VacuumDevice
  room?: string
  onSelect: () => void
}) {
  return (
    <DeviceCardShell
      icon="🤖"
      name={device.name}
      room={room}
      connection={device.connection}
      pending={device.pending}
      lastError={device.lastError}
      onSelect={onSelect}
    >
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${STATUS_COLOR[device.status]}`}>
          {STATUS_LABEL[device.status]}
        </span>
        <span className="text-xs text-gray-400">배터리 {device.batteryLevel}%</span>
      </div>
    </DeviceCardShell>
  )
}
