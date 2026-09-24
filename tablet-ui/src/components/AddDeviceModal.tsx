import { useState } from 'react'
import { rooms } from '../data/initialDevices'
import { homeActions } from '../hooks/useHomeStore'
import type { ApplianceDevice, ConnectionState, DeviceDomain, RoomId } from '../types/home'

const DOMAIN_LABEL: Record<DeviceDomain, string> = {
  light: '조명',
  cover: '커튼',
  climate: '냉난방',
  media_player: '미디어',
  appliance: '가전',
  vacuum: '로봇청소기',
}

const APPLIANCE_KIND_LABEL: Record<ApplianceDevice['kind'], string> = {
  washer: '세탁기',
  dryer: '건조기',
  dishwasher: '식기세척기',
  induction: '인덕션',
  fridge: '냉장고',
  kimchi_fridge: '김치냉장고',
}

const CONNECTION_LABEL: Record<Exclude<ConnectionState, 'offline'>, string> = {
  local: '로컬',
  cloud: '클라우드',
}

const FIELD_CLASS =
  'touch-target w-full rounded-xl bg-[var(--color-surface-sunken)] px-4 py-3 text-sm text-gray-100'

// FR-01/FR-02 확장: 신규 기기 등록 플로우. 실제 HA 연동 단계에서는 벤더
// 통합이 기기를 자동 발견하지만, 이 목업에서는 폼으로 직접 추가해본다
// (삼성 SmartThings 앱 상단의 "+" 버튼 참고).
export function AddDeviceModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [room, setRoom] = useState<RoomId>(rooms[0].id)
  const [domain, setDomain] = useState<DeviceDomain>('light')
  const [applianceKind, setApplianceKind] = useState<ApplianceDevice['kind']>('fridge')
  const [highRisk, setHighRisk] = useState(false)
  const [connection, setConnection] = useState<Exclude<ConnectionState, 'offline'>>('local')

  const canSubmit = name.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    homeActions.addDevice({
      name: name.trim(),
      room,
      domain,
      connection,
      ...(domain === 'appliance' ? { applianceKind, highRisk } : {}),
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-[var(--color-surface-raised)] p-6"
      >
        <h2 className="text-lg font-semibold text-gray-100">새 기기 추가</h2>

        <label className="flex flex-col gap-1 text-xs text-gray-400">
          이름
          <input
            className={FIELD_CLASS}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 서재 스탠드 조명"
            autoFocus
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-gray-400">
          방
          <select
            className={FIELD_CLASS}
            value={room}
            onChange={(e) => setRoom(e.target.value as RoomId)}
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-gray-400">
          종류
          <select
            className={FIELD_CLASS}
            value={domain}
            onChange={(e) => setDomain(e.target.value as DeviceDomain)}
          >
            {(Object.keys(DOMAIN_LABEL) as DeviceDomain[]).map((d) => (
              <option key={d} value={d}>
                {DOMAIN_LABEL[d]}
              </option>
            ))}
          </select>
        </label>

        {domain === 'appliance' && (
          <>
            <label className="flex flex-col gap-1 text-xs text-gray-400">
              가전 종류
              <select
                className={FIELD_CLASS}
                value={applianceKind}
                onChange={(e) => setApplianceKind(e.target.value as ApplianceDevice['kind'])}
              >
                {(Object.keys(APPLIANCE_KIND_LABEL) as ApplianceDevice['kind'][]).map((k) => (
                  <option key={k} value={k}>
                    {APPLIANCE_KIND_LABEL[k]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={highRisk}
                onChange={(e) => setHighRisk(e.target.checked)}
              />
              고위험 기기 (원격 제어 시 확인 절차 필요, FR-22)
            </label>
          </>
        )}

        <label className="flex flex-col gap-1 text-xs text-gray-400">
          연결 경로
          <select
            className={FIELD_CLASS}
            value={connection}
            onChange={(e) => setConnection(e.target.value as typeof connection)}
          >
            {(Object.keys(CONNECTION_LABEL) as (keyof typeof CONNECTION_LABEL)[]).map((c) => (
              <option key={c} value={c}>
                {CONNECTION_LABEL[c]}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="touch-target rounded-2xl bg-[var(--color-surface-sunken)] py-3 text-sm font-medium text-gray-300"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="touch-target rounded-2xl bg-[var(--color-status-pending)] py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            추가
          </button>
        </div>
      </form>
    </div>
  )
}
