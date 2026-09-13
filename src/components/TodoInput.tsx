import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Category } from '../types'
import { CATEGORIES } from '../constants/categories'
import { MAX_TITLE_LENGTH } from '../constants/todo'

interface TodoInputProps {
  onAdd: (title: string, category: Category) => void
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('업무')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed, category)
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="할일을 입력하세요"
        aria-label="할일 내용"
        maxLength={MAX_TITLE_LENGTH}
        className="w-full flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
      />
      <div className="flex gap-2">
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as Category)}
          aria-label="카테고리"
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
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
          className="shrink-0 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          추가
        </button>
      </div>
    </form>
  )
}
