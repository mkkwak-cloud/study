interface ProgressSectionProps {
  total: number
  completed: number
}

export function ProgressSection({ total, completed }: ProgressSectionProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-neutral-900 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="shrink-0 text-sm font-medium text-neutral-600">
        {completed}/{total} 완료 ({percent}%)
      </span>
    </div>
  )
}
