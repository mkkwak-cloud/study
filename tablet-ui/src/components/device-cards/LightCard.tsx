import type { LightDevice } from '../../types/home'
import { homeActions } from '../../hooks/useHomeStore'
import { DeviceCardShell } from './DeviceCardShell'

export function LightCard({ device }: { device: LightDevice }) {
  return (
    <DeviceCardShell
      icon="💡"
      name={device.name}
      connection={device.connection}
      pending={device.pending}
      lastError={device.lastError}
      onClick={() => homeActions.toggleLight(device.id)}
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

      {device.on && (
        <input
          type="range"
          min={1}
          max={100}
          value={device.brightness}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => homeActions.setBrightness(device.id, Number(e.target.value))}
          className="touch-target w-full accent-[var(--color-status-pending)]"
          aria-label={`${device.name} 밝기`}
        />
      )}
    </DeviceCardShell>
  )
}
