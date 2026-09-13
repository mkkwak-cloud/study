import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import type { SortMode } from '../constants/sort'
import { SORT_OPTIONS } from '../constants/sort'

interface ToolbarProps {
  sortMode: SortMode
  onSortModeChange: (mode: SortMode) => void
  onExport: () => void
  onImportFile: (file: File) => void
}

export function Toolbar({ sortMode, onSortModeChange, onExport, onImportFile }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onImportFile(file)
    event.target.value = '' // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 초기화
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={sortMode}
        onChange={(event) => onSortModeChange(event.target.value as SortMode)}
        aria-label="정렬 기준"
        className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={onExport}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
        >
          내보내기
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
        >
          가져오기
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
          aria-label="엑셀 파일 가져오기"
        />
      </div>
    </div>
  )
}
