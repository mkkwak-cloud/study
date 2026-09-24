import { useState } from 'react'
import { useHomeState } from './hooks/useHomeStore'
import { useIdleTimer } from './hooks/useIdleTimer'
import { StatusBar } from './components/StatusBar'
import { BottomNav, type PrimaryTab } from './components/BottomNav'
import { HomeView } from './components/HomeView'
import { DevicesView } from './components/DevicesView'
import { SettingsView } from './components/SettingsView'
import { DeviceDetailView } from './components/DeviceDetailView'
import { IdleOverlay } from './components/IdleOverlay'

// UX-06: 데모용 60초 유휴 기준. 실거치 환경에서는 값을 조정하거나
// HA input_number 로 노출해 태블릿 UI에서 바꿀 수 있게 한다(FR-52와 동일 패턴).
const IDLE_AFTER_MS = 60_000

function App() {
  const state = useHomeState()
  const [tab, setTab] = useState<PrimaryTab>('home')
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const isIdle = useIdleTimer(IDLE_AFTER_MS)

  // 하단 탭을 바꾸면 열려 있던 기기 상세 화면은 닫는다.
  const changeTab = (next: PrimaryTab) => {
    setSelectedDeviceId(null)
    setTab(next)
  }

  const selectedDevice = selectedDeviceId ? state.devices[selectedDeviceId] : null

  return (
    // UX-03 확장: 가로(벽걸이)·세로(휴대) 화면 모두에서 동작한다. 하단
    // 네비게이션(BottomNav)과 auto-fill 기기 그리드(.device-grid)로 폭에
    // 따라 자연스럽게 레이아웃이 흐른다.
    <div className="kiosk-shell flex h-full flex-col overflow-hidden">
      <StatusBar state={state} />
      <div className="flex-1 overflow-y-auto">
        {selectedDevice ? (
          <DeviceDetailView device={selectedDevice} onBack={() => setSelectedDeviceId(null)} />
        ) : tab === 'home' ? (
          <HomeView state={state} />
        ) : tab === 'devices' ? (
          <DevicesView state={state} onSelectDevice={setSelectedDeviceId} />
        ) : (
          <SettingsView state={state} />
        )}
      </div>
      <BottomNav active={tab} onChange={changeTab} />

      {isIdle && <IdleOverlay />}
    </div>
  )
}

export default App
