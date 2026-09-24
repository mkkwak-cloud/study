export type PrimaryTab = 'home' | 'devices' | 'settings'

const TABS: { id: PrimaryTab; label: string; icon: string }[] = [
  { id: 'home', label: '홈', icon: '🏠' },
  { id: 'devices', label: '기기', icon: '🧩' },
  { id: 'settings', label: '설정', icon: '⚙️' },
]

// 삼성 SmartThings 앱의 하단 탭(홈/기기/라이프/자동화/메뉴)을 참고한 하단
// 네비게이션. 화면 하단에 고정되어 가로(벽걸이)·세로(휴대) 모두에서 엄지로
// 닿기 쉬운 위치에 둔다.
export function BottomNav({
  active,
  onChange,
}: {
  active: PrimaryTab
  onChange: (tab: PrimaryTab) => void
}) {
  return (
    <nav className="flex shrink-0 border-t border-white/5 bg-[var(--color-surface-raised)]">
      {TABS.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`touch-target flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
              isActive ? 'text-[var(--color-status-pending)]' : 'text-gray-500'
            }`}
          >
            <span className="text-xl" aria-hidden>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
