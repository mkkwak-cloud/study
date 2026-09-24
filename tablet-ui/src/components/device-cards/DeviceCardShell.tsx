import type { ReactNode } from 'react'
import type { ConnectionState } from '../../types/home'

const CONNECTION_LABEL: Record<ConnectionState, string> = {
  local: '로컬',
  cloud: '클라우드',
  offline: '오프라인',
}

const CONNECTION_DOT: Record<ConnectionState, string> = {
  local: 'bg-[var(--color-status-on)]',
  cloud: 'bg-[var(--color-status-pending)]',
  offline: 'bg-[var(--color-status-urgent)]',
}

interface DeviceCardShellProps {
  icon: string
  name: string
  connection: ConnectionState
  pending: boolean
  lastError?: string
  children: ReactNode
  onClick?: () => void
  onPointerDown?: () => void
  onPointerUp?: () => void
  onPointerLeave?: () => void
}

// 모든 기기 카드가 공유하는 뼈대. FR-14(연결성 표시), UX-08(색+아이콘),
// UX-09(진행 스피너/실패 사유)를 여기서 일괄 처리한다.
export function DeviceCardShell({
  icon,
  name,
  connection,
  pending,
  lastError,
  children,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
}: DeviceCardShellProps) {
  return (
    <div
      className="touch-target flex flex-col gap-3 rounded-2xl bg-[var(--color-surface-raised)] p-4"
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-100">
          <span className="text-xl" aria-hidden>
            {icon}
          </span>
          {name}
        </div>
        <span
          className={`inline-flex h-2 w-2 rounded-full ${CONNECTION_DOT[connection]}`}
          title={CONNECTION_LABEL[connection]}
          aria-hidden
        />
      </div>

      {children}

      {pending && (
        <div className="flex items-center gap-2 text-xs text-[var(--color-status-pending)]">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          적용 중…
        </div>
      )}
      {!pending && lastError && (
        <div className="text-xs text-[var(--color-status-urgent)]">⚠ {lastError}</div>
      )}
    </div>
  )
}
