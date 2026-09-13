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
    // 모바일에서는 정렬 선택과 내보내기/가져오기 버튼을 각각 한 줄 전체 너비로 쌓아
    // 터치 영역을 넉넉히 확보하고, 넓은 화면에서는 한 줄로 배치한다.
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <select
        value={sortMode}
        onChange={(event) => onSortModeChange(event.target.value as SortMode)}
        aria-label="정렬 기준"
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 sm:w-auto"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="flex gap-2 sm:ml-auto">
        <button
          type="button"
          onClick={onExport}
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 sm:flex-initial"
        >
          내보내기
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 sm:flex-initial"
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
