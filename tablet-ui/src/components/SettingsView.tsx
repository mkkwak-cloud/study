import { homeActions } from '../hooks/useHomeStore'
import type { HomeState } from '../data/homeStore'
import type { HouseMode } from '../types/home'

const MODE_LABEL: Record<HouseMode, string> = {
  Home: '재실',
  Away: '외출',
  Sleep: '취침',
  Vacation: '휴가',
}

const MODES: HouseMode[] = ['Home', 'Away', 'Sleep', 'Vacation']

// FR-43 모드 전환과 UX-12 연결 끊김 데모처럼 자주 쓰지 않는 조작을 모아 둔
// 설정 탭. 삼성 SmartThings 앱의 "메뉴" 탭 자리에 대응한다.
export function SettingsView({ state }: { state: HomeState }) {
  return (
    <div className="flex flex-col gap-6 px-4 pb-6 sm:px-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-400">집 모드</h2>
        <div className="grid grid-cols-2 gap-3 min-[420px]:grid-cols-4">
          {MODES.map((mode) => {
            const active = state.houseMode === mode
            return (
              <button
                key={mode}
                type="button"
                onClick={() => homeActions.setHouseMode(mode)}
                className={`touch-target rounded-2xl py-3 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[var(--color-status-pending)] text-white'
                    : 'bg-[var(--color-surface-raised)] text-gray-200 hover:bg-gray-700'
                }`}
              >
                {MODE_LABEL[mode]}
              </button>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-400">연결 상태</h2>
        <div className="flex flex-col gap-3 rounded-2xl bg-[var(--color-surface-raised)] px-5 py-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
          <div>
            <div className="text-sm font-medium text-gray-100">
              {state.connectionLost ? '연결 끊김 (재연결 시도 중)' : '허브에 연결됨'}
            </div>
            <div className="text-xs text-gray-500">데모: 끊김 상태를 미리보기할 수 있습니다</div>
          </div>
          <button
            type="button"
            disabled={state.connectionLost}
            onClick={() => homeActions.setConnectionLost(true)}
            className="touch-target shrink-0 rounded-full bg-[var(--color-surface-sunken)] px-4 py-2 text-sm whitespace-nowrap text-gray-300 disabled:opacity-40"
          >
            끊김 시뮬레이션
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-2 rounded-2xl bg-[var(--color-surface-raised)] px-5 py-4 text-xs text-gray-500">
        <p>
          이 화면은 <code className="text-gray-400">docs/ASSUMPTIONS.md</code> 의 샘플
          인벤토리를 사용하는 UI 전용 목업입니다. 실제 기기/HA 백엔드와 연결되어 있지
          않습니다.
        </p>
      </section>
    </div>
  )
}
