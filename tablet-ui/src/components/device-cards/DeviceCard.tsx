import type { Device } from '../../types/home'
import { LightCard } from './LightCard'
import { CoverCard } from './CoverCard'
import { ClimateCard } from './ClimateCard'
import { MediaCard } from './MediaCard'
import { ApplianceCard } from './ApplianceCard'

export function DeviceCard({
  device,
  room,
  onSelect,
}: {
  device: Device
  room?: string
  onSelect: () => void
}) {
  switch (device.domain) {
    case 'light':
      return <LightCard device={device} room={room} onSelect={onSelect} />
    case 'cover':
      return <CoverCard device={device} room={room} onSelect={onSelect} />
    case 'climate':
      return <ClimateCard device={device} room={room} onSelect={onSelect} />
    case 'media_player':
      return <MediaCard device={device} room={room} onSelect={onSelect} />
    case 'appliance':
      return <ApplianceCard device={device} room={room} onSelect={onSelect} />
  }
}
