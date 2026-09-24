import type { Device } from '../types/home'
import { rooms } from '../data/initialDevices'
import { DeviceCard } from './device-cards/DeviceCard'

const ROOM_NAME: Record<string, string> = Object.fromEntries(rooms.map((r) => [r.id, r.name]))

// 반응형 기기 그리드. 세로 화면에서는 2열, 넓은 화면에서는 자동으로 더
// 늘어난다(.device-grid, auto-fill). 방 필터가 "모든 기기"일 때는 카드에
// 방 이름을 함께 표시해 구분한다.
export function DeviceGrid({
  devices,
  showRoom,
  onSelectDevice,
}: {
  devices: Device[]
  showRoom?: boolean
  onSelectDevice: (deviceId: string) => void
}) {
  if (devices.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-sm text-gray-500 sm:px-6">
        표시할 기기가 없습니다.
      </div>
    )
  }

  return (
    <div className="device-grid px-4 pb-6 sm:px-6">
      {devices.map((device) => (
        <DeviceCard
          key={device.id}
          device={device}
          room={showRoom ? ROOM_NAME[device.room] : undefined}
          onSelect={() => onSelectDevice(device.id)}
        />
      ))}
    </div>
  )
}
