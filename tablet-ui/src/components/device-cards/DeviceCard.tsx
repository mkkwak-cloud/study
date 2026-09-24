import type { Device } from '../../types/home'
import { LightCard } from './LightCard'
import { CoverCard } from './CoverCard'
import { ClimateCard } from './ClimateCard'
import { MediaCard } from './MediaCard'
import { ApplianceCard } from './ApplianceCard'

export function DeviceCard({ device }: { device: Device }) {
  switch (device.domain) {
    case 'light':
      return <LightCard device={device} />
    case 'cover':
      return <CoverCard device={device} />
    case 'climate':
      return <ClimateCard device={device} />
    case 'media_player':
      return <MediaCard device={device} />
    case 'appliance':
      return <ApplianceCard device={device} />
  }
}
