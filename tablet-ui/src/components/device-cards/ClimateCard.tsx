import type { ClimateDevice } from '../../types/home'
import { DeviceCardShell } from './DeviceCardShell'

export function ClimateCard({
  device,
  onSelect,
}: {
  device: ClimateDevice
  onSelect: () => void
}) {
  return (
    <DeviceCardShell
      icon="❄️"
      name={device.name}
      connection={device.connection}
      pending={device.pending}
      lastError={device.lastError}
      onSelect={onSelect}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-semibold ${
            device.on ? 'text-[var(--color-status-on)]' : 'text-[var(--color-status-off)]'
          }`}
        >
          {device.on ? `가동 중 · ${device.targetTemp}°C` : '꺼짐'}
        </span>
        <span className="text-xs text-gray-400">현재 {device.currentTemp}°C</span>
      </div>
    </DeviceCardShell>
  )
}
