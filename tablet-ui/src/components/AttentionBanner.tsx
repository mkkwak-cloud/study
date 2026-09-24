import type { AttentionItem } from '../types/home'

const SEVERITY_STYLE: Record<AttentionItem['severity'], string> = {
  info: 'bg-[var(--color-surface-raised)] text-gray-200',
  warning: 'bg-[var(--color-status-warning)]/15 text-[var(--color-status-warning)]',
  urgent: 'bg-[var(--color-status-urgent)]/15 text-[var(--color-status-urgent)]',
}

const SEVERITY_ICON: Record<AttentionItem['severity'], string> = {
  info: 'ℹ',
  warning: '⚠',
  urgent: '🚨',
}

// FR-10: 주의 상태(열린 커튼, 켜진 가전, 알림)를 홈 화면 상단에 모아 보여준다.
export function AttentionBanner({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-[var(--color-surface-raised)] px-5 py-4 text-sm text-gray-400">
        확인할 주의 사항이 없습니다.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium ${SEVERITY_STYLE[item.severity]}`}
        >
          <span aria-hidden>{SEVERITY_ICON[item.severity]}</span>
          {item.message}
        </div>
      ))}
    </div>
  )
}
