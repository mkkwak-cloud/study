import type { Device } from '../types/home'
import { homeActions } from '../hooks/useHomeStore'

const CONNECTION_LABEL = { local: '로컬', cloud: '클라우드', offline: '오프라인' } as const

const DOMAIN_ICON: Record<Device['domain'], string> = {
  light: '💡',
  cover: '🪟',
  climate: '❄️',
  media_player: '📺',
  appliance: '🔌',
}

const APPLIANCE_ICON: Record<
  Extract<Device, { domain: 'appliance' }>['kind'],
  string
> = {
  washer: '🌀',
  dryer: '🧺',
  dishwasher: '🍽️',
  induction: '🔥',
  fridge: '🧊',
  kimchi_fridge: '🥬',
}

const CLIMATE_MODE_LABEL = {
  cool: '냉방',
  heat: '난방',
  fan_only: '송풍',
  dry: '제습',
} as const

const APPLIANCE_STATUS_LABEL = { idle: '대기', running: '작동 중', done: '완료' } as const

function iconFor(device: Device) {
  return device.domain === 'appliance' ? APPLIANCE_ICON[device.kind] : DOMAIN_ICON[device.domain]
}

// FR-11/FR-13 확장: 방 그리드의 요약 타일에서 기기를 선택하면 이 전체화면
// 상세 조절 화면으로 이동한다. 슬라이더/모드 선택 등 세부 컨트롤은 여기에만 둔다.
export function DeviceDetailView({ device, onBack }: { device: Device; onBack: () => void }) {
  return (
    <div className="flex flex-col gap-6 px-4 pt-4 pb-6 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="touch-target flex items-center gap-1 rounded-full bg-[var(--color-surface-raised)] px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
        >
          ← 뒤로
        </button>
        <div className="flex flex-1 items-center gap-2">
          <span className="text-2xl" aria-hidden>
            {iconFor(device)}
          </span>
          <h1 className="text-xl font-semibold text-gray-100">{device.name}</h1>
        </div>
        <span className="rounded-full bg-[var(--color-surface-raised)] px-3 py-1 text-xs text-gray-400">
          {CONNECTION_LABEL[device.connection]}
        </span>
      </div>

      {device.pending && (
        <div className="flex items-center gap-2 rounded-2xl bg-[var(--color-status-pending)]/10 px-5 py-3 text-sm text-[var(--color-status-pending)]">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          적용 중…
        </div>
      )}
      {!device.pending && device.lastError && (
        <div className="rounded-2xl bg-[var(--color-status-urgent)]/10 px-5 py-3 text-sm text-[var(--color-status-urgent)]">
          ⚠ {device.lastError}
        </div>
      )}

      <div className="mx-auto w-full max-w-md rounded-3xl bg-[var(--color-surface-raised)] p-6">
        {device.domain === 'light' && (
          <div className="flex flex-col gap-6">
            <button
              type="button"
              onClick={() => homeActions.toggleLight(device.id)}
              className={`touch-target w-full rounded-2xl py-4 text-lg font-semibold transition-colors ${
                device.on
                  ? 'bg-[var(--color-status-on)] text-black'
                  : 'bg-[var(--color-surface-sunken)] text-gray-300'
              }`}
            >
              {device.on ? '켜짐' : '꺼짐'}
            </button>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>밝기</span>
                <span className="tabular-nums">{device.brightness}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={device.brightness}
                onChange={(e) => homeActions.setBrightness(device.id, Number(e.target.value))}
                className="touch-target w-full accent-[var(--color-status-pending)]"
                aria-label="밝기"
              />
            </div>
          </div>
        )}

        {device.domain === 'cover' && (
          <div className="flex flex-col gap-6">
            <div className="text-center text-2xl font-semibold tabular-nums text-gray-100">
              {device.moving === 'opening' && '여는 중…'}
              {device.moving === 'closing' && '닫는 중…'}
              {!device.moving && device.position !== null && `${device.position}% 열림`}
              {!device.moving && device.position === null && '위치 추정 불가'}
            </div>
            {device.position !== null && (
              <input
                type="range"
                min={0}
                max={100}
                value={device.position}
                onChange={(e) => homeActions.setCoverPosition(device.id, Number(e.target.value))}
                className="touch-target w-full accent-[var(--color-status-pending)]"
                aria-label="커튼 위치"
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => homeActions.setCoverPosition(device.id, 100)}
                className="touch-target rounded-2xl bg-[var(--color-surface-sunken)] py-4 text-base font-medium text-gray-100"
              >
                열기
              </button>
              <button
                type="button"
                onClick={() => homeActions.setCoverPosition(device.id, 0)}
                className="touch-target rounded-2xl bg-[var(--color-surface-sunken)] py-4 text-base font-medium text-gray-100"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {device.domain === 'climate' && (
          <div className="flex flex-col gap-6">
            <div className="text-center text-sm text-gray-400">현재 {device.currentTemp}°C</div>
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => homeActions.adjustClimateTemp(device.id, -1)}
                className="touch-target h-14 w-14 rounded-2xl bg-[var(--color-surface-sunken)] text-2xl text-gray-200"
                aria-label="온도 내리기"
              >
                −
              </button>
              <span className="text-4xl font-semibold tabular-nums text-gray-100">
                {device.targetTemp}°C
              </span>
              <button
                type="button"
                onClick={() => homeActions.adjustClimateTemp(device.id, 1)}
                className="touch-target h-14 w-14 rounded-2xl bg-[var(--color-surface-sunken)] text-2xl text-gray-200"
                aria-label="온도 올리기"
              >
                +
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(CLIMATE_MODE_LABEL) as (keyof typeof CLIMATE_MODE_LABEL)[]).map(
                (mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => homeActions.setClimateMode(device.id, mode)}
                    className={`touch-target rounded-xl py-3 text-sm font-medium ${
                      device.mode === mode
                        ? 'bg-[var(--color-status-pending)] text-white'
                        : 'bg-[var(--color-surface-sunken)] text-gray-300'
                    }`}
                  >
                    {CLIMATE_MODE_LABEL[mode]}
                  </button>
                ),
              )}
            </div>
            <button
              type="button"
              onClick={() => homeActions.toggleClimate(device.id)}
              className={`touch-target w-full rounded-2xl py-4 text-lg font-semibold ${
                device.on
                  ? 'bg-[var(--color-status-on)] text-black'
                  : 'bg-[var(--color-surface-sunken)] text-gray-300'
              }`}
            >
              {device.on ? '가동 중 · 끄기' : '켜기'}
            </button>
          </div>
        )}

        {device.domain === 'media_player' && (
          <div className="flex flex-col gap-6">
            <button
              type="button"
              onClick={() => homeActions.toggleMediaPlayer(device.id)}
              className={`touch-target w-full rounded-2xl py-4 text-lg font-semibold ${
                device.on
                  ? 'bg-[var(--color-status-on)] text-black'
                  : 'bg-[var(--color-surface-sunken)] text-gray-300'
              }`}
            >
              {device.on ? '재생 중' : '꺼짐'}
            </button>
            {device.on && device.source && (
              <div className="text-center text-sm text-gray-400">{device.source}</div>
            )}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>볼륨</span>
                <span className="tabular-nums">{device.volume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={device.volume}
                onChange={(e) => homeActions.setVolume(device.id, Number(e.target.value))}
                className="touch-target w-full accent-[var(--color-status-pending)]"
                aria-label="볼륨"
              />
            </div>
          </div>
        )}

        {device.domain === 'appliance' && device.safetyTier === 'high' && (
          <div className="flex flex-col gap-4">
            <div
              className={`text-center text-2xl font-semibold ${
                device.on ? 'text-[var(--color-status-urgent)]' : 'text-gray-100'
              }`}
            >
              {device.on ? '켜짐' : '꺼짐'}
            </div>
            <button
              type="button"
              onClick={() => {
                const ok = window.confirm(`${device.name} 상태를 변경하시겠습니까?`)
                if (ok) homeActions.toggleHighRiskAppliance(device.id)
              }}
              className="touch-target w-full rounded-2xl bg-[var(--color-status-urgent)]/15 py-4 text-base font-semibold text-[var(--color-status-urgent)]"
            >
              {device.on ? '끄기' : '켜기'} (확인 필요)
            </button>
            <p className="text-center text-xs text-gray-500">
              고위험 기기는 원격 제어 전 확인 절차를 거칩니다(FR-22)
            </p>
          </div>
        )}

        {device.domain === 'appliance' && device.safetyTier !== 'high' && (
          <div className="flex flex-col gap-3 text-center">
            <div className="text-2xl font-semibold text-gray-100">
              {APPLIANCE_STATUS_LABEL[device.status]}
            </div>
            {'doorOpen' in device && device.doorOpen && (
              <div className="text-sm text-[var(--color-status-warning)]">문 열림</div>
            )}
            <p className="text-xs text-gray-500">
              벤더가 원격 시작을 허용하지 않는 가전은 상태만 표시합니다(FR-22)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
