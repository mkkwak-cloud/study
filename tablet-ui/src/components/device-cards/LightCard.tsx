import type { LightDevice } from '../../types/home'
import { DeviceCardShell } from './DeviceCardShell'

export function LightCard({ device, onSelect }: { device: LightDevice; onSelect: () => void }) {
  return (
    <DeviceCardShell
      icon="💡"
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
          {device.on ? '켜짐' : '꺼짐'}
        </span>
        {device.on && <span className="text-xs text-gray-400">{device.brightness}%</span>}
      </div>
    </DeviceCardShell>
  )
}
