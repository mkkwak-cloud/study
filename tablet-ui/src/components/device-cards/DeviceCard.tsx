import type { Device } from '../../types/home'
import { LightCard } from './LightCard'
import { CoverCard } from './CoverCard'
import { ClimateCard } from './ClimateCard'
import { MediaCard } from './MediaCard'
import { ApplianceCard } from './ApplianceCard'

export function DeviceCard({ device, onSelect }: { device: Device; onSelect: () => void }) {
  switch (device.domain) {
    case 'light':
      return <LightCard device={device} onSelect={onSelect} />
    case 'cover':
      return <CoverCard device={device} onSelect={onSelect} />
    case 'climate':
      return <ClimateCard device={device} onSelect={onSelect} />
    case 'media_player':
      return <MediaCard device={device} onSelect={onSelect} />
    case 'appliance':
      return <ApplianceCard device={device} onSelect={onSelect} />
  }
}
