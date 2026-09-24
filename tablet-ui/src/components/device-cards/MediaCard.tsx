import type { MediaPlayerDevice } from '../../types/home'
import { DeviceCardShell } from './DeviceCardShell'

export function MediaCard({
  device,
  room,
  onSelect,
}: {
  device: MediaPlayerDevice
  room?: string
  onSelect: () => void
}) {
  return (
    <DeviceCardShell
      icon="📺"
      name={device.name}
      room={room}
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
          {device.on ? '재생 중' : '꺼짐'}
        </span>
        {device.on && device.source && (
          <span className="text-xs text-gray-400">{device.source}</span>
        )}
      </div>
    </DeviceCardShell>
  )
}
