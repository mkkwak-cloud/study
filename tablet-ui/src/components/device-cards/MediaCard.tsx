import type { MediaPlayerDevice } from '../../types/home'
import { homeActions } from '../../hooks/useHomeStore'
import { DeviceCardShell } from './DeviceCardShell'

export function MediaCard({ device }: { device: MediaPlayerDevice }) {
  return (
    <DeviceCardShell
      icon="📺"
      name={device.name}
      connection={device.connection}
      pending={device.pending}
      lastError={device.lastError}
      onClick={() => homeActions.toggleMediaPlayer(device.id)}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-semibold ${
            device.on ? 'text-[var(--color-status-on)]' : 'text-[var(--color-status-off)]'
          }`}
        >
          {device.on ? '재생 중' : '꺼짐'}
        </span>
        {device.on && device.source && (
          <span className="text-xs text-gray-400">{device.source}</span>
        )}
      </div>
    </DeviceCardShell>
  )
}
