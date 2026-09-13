import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Category } from '../types'
import { CATEGORIES } from '../constants/categories'
import { MAX_TITLE_LENGTH } from '../constants/todo'
import { guessCategory } from '../lib/categoryClassifier'

interface TodoInputProps {
  onAdd: (title: string, category: Category) => void
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('업무')
  // 사용자가 드롭다운을 직접 건드리면 그 뒤로는 자동 분류가 값을 덮어쓰지 않는다.
  const [manualOverride, setManualOverride] = useState(false)
  const [isAutoDetected, setIsAutoDetected] = useState(false)

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (manualOverride) return

    const guessed = guessCategory(value)
    if (guessed) {
      setCategory(guessed)
      setIsAutoDetected(true)
    } else {
      setIsAutoDetected(false)
    }
  }

  const handleCategoryChange = (value: Category) => {
    setCategory(value)
    setManualOverride(true)
    setIsAutoDetected(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed, category)
    setTitle('')
    setManualOverride(false)
    setIsAutoDetected(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
          placeholder="할일을 입력하세요 (예: 팀 회의 자료 준비)"
          aria-label="할일 내용"
          maxLength={MAX_TITLE_LENGTH}
          // py-3(약 44px 높이)로 모바일에서 터치하기 편한 크기를 확보한다.
          className="w-full flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 sm:text-sm"
        />
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(event) => handleCategoryChange(event.target.value as Category)}
            aria-label="카테고리"
            className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-3 text-base text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 sm:flex-initial sm:text-sm"
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!title.trim()}
            className="shrink-0 rounded-lg bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            추가
          </button>
        </div>
      </div>

      {isAutoDetected && (
        <p className="pl-1 text-xs text-neutral-400" aria-live="polite">
          ✨ 키워드를 분석해 <span className="font-medium text-neutral-600">{category}</span>(으)로 자동
          분류했어요 · 다른 카테고리를 원하면 직접 선택하세요
        </p>
      )}
    </form>
  )
}
