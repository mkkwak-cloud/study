import type { ClimateDevice } from '../../types/home'
import { homeActions } from '../../hooks/useHomeStore'
import { DeviceCardShell } from './DeviceCardShell'

export function ClimateCard({ device }: { device: ClimateDevice }) {
  return (
    <DeviceCardShell
      icon="❄️"
      name={device.name}
      connection={device.connection}
      pending={device.pending}
      lastError={device.lastError}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-semibold ${
            device.on ? 'text-[var(--color-status-on)]' : 'text-[var(--color-status-off)]'
          }`}
        >
          {device.on ? '가동 중' : '꺼짐'}
        </span>
        <span className="text-xs text-gray-400">현재 {device.currentTemp}°C</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="touch-target rounded-xl bg-[var(--color-surface-sunken)] text-xl text-gray-200"
          onClick={(e) => {
            e.stopPropagation()
            homeActions.adjustClimateTemp(device.id, -1)
          }}
          aria-label="온도 내리기"
        >
          −
        </button>
        <span className="text-2xl font-semibold tabular-nums">{device.targetTemp}°C</span>
        <button
          type="button"
          className="touch-target rounded-xl bg-[var(--color-surface-sunken)] text-xl text-gray-200"
          onClick={(e) => {
            e.stopPropagation()
            homeActions.adjustClimateTemp(device.id, 1)
          }}
          aria-label="온도 올리기"
        >
          +
        </button>
      </div>

      <button
        type="button"
        className="touch-target w-full rounded-xl bg-[var(--color-surface-sunken)] py-2 text-sm text-gray-200"
        onClick={(e) => {
          e.stopPropagation()
          homeActions.toggleClimate(device.id)
        }}
      >
        {device.on ? '끄기' : '켜기'}
      </button>
    </DeviceCardShell>
  )
}
