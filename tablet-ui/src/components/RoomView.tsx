import type { HomeState } from '../data/homeStore'
import type { RoomId } from '../types/home'
import { DeviceCard } from './device-cards/DeviceCard'

// FR-11: 방별 뷰 — 방 탭 → 기기 카드 그리드. UX-03: 3~4열 그리드.
// 카드를 선택하면 DeviceDetailView(전체화면 상세 조절)로 이동한다.
export function RoomView({
  state,
  room,
  onSelectDevice,
}: {
  state: HomeState
  room: RoomId
  onSelectDevice: (deviceId: string) => void
}) {
  const devices = Object.values(state.devices).filter((d) => d.room === room)

  return (
    <div className="grid grid-cols-3 gap-4 px-6 pb-6">
      {devices.map((device) => (
        <DeviceCard key={device.id} device={device} onSelect={() => onSelectDevice(device.id)} />
      ))}
    </div>
  )
}
