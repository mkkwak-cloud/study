import { useSyncExternalStore } from 'react'
import { homeStore } from '../data/homeStore'

export function useHomeState() {
  return useSyncExternalStore(homeStore.subscribe, homeStore.getSnapshot)
}

export const homeActions = {
  setHouseMode: homeStore.setHouseMode.bind(homeStore),
  toggleLight: homeStore.toggleLight.bind(homeStore),
  setBrightness: homeStore.setBrightness.bind(homeStore),
  setCoverPosition: homeStore.setCoverPosition.bind(homeStore),
  toggleClimate: homeStore.toggleClimate.bind(homeStore),
  adjustClimateTemp: homeStore.adjustClimateTemp.bind(homeStore),
  toggleMediaPlayer: homeStore.toggleMediaPlayer.bind(homeStore),
  toggleHighRiskAppliance: homeStore.toggleHighRiskAppliance.bind(homeStore),
  setConnectionLost: homeStore.setConnectionLost.bind(homeStore),
}
