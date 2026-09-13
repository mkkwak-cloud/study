import { memo, useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'
import type { Todo } from '../types'
import type { UpdateTodoInput } from '../lib/todoOperations'
import { CATEGORY_STYLES } from '../constants/categories'
import { MAX_TITLE_LENGTH } from '../constants/todo'
import { formatDateTime } from '../lib/formatDate'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onUpdate: (id: string, changes: UpdateTodoInput) => void
  onDelete: (id: string) => void
  /** '사용자 지정' 정렬일 때만 SortableTodoItem을 통해 전달되는 드래그 관련 props */
  dragHandleProps?: {
    attributes: DraggableAttributes
    listeners: DraggableSyntheticListeners
  }
  dragRef?: (node: HTMLLIElement | null) => void
  dragStyle?: CSSProperties
}

const DELETE_CONFIRM_TIMEOUT = 3000

/**
 * onToggle/onUpdate/onDelete가 useCallback으로 안정된 참조를 유지하는 한,
 * 다른 항목이 변경돼도 이 항목의 todo가 그대로면 리렌더링을 건너뛴다.
 */
export const TodoItem = memo(function TodoItem({
  todo,
  onToggle,
  onUpdate,
  onDelete,
  dragHandleProps,
  dragRef,
  dragStyle,
}: TodoItemProps) {
  const style = CATEGORY_STYLES[todo.category]
  const isEdited = todo.updatedAt !== todo.createdAt
  const metaLabel = isEdited
    ? `수정됨 · ${formatDateTime(todo.updatedAt)}`
    : `생성 · ${formatDateTime(todo.createdAt)}`
  const metaTooltip = isEdited
    ? `생성 ${formatDateTime(todo.createdAt)}\n수정 ${formatDateTime(todo.updatedAt)}`
    : `생성 ${formatDateTime(todo.createdAt)}`

  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(todo.title)
  const editInputRef = useRef<HTMLInputElement>(null)

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const confirmTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus()
      editInputRef.current?.select()
    }
  }, [isEditing])

  useEffect(() => {
    return () => {
      if (confirmTimeoutRef.current !== null) {
        window.clearTimeout(confirmTimeoutRef.current)
      }
    }
  }, [])

  const startEditing = () => {
    setDraftTitle(todo.title)
    setIsEditing(true)
  }

  const commitEdit = () => {
    setIsEditing(false)
    const trimmed = draftTitle.trim()
    if (trimmed && trimmed !== todo.title) {
      onUpdate(todo.id, { title: trimmed })
    }
  }

  const cancelEdit = () => {
    setDraftTitle(todo.title)
    setIsEditing(false)
  }

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitEdit()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      cancelEdit()
    }
  }

  const handleDeleteClick = () => {
    if (confirmingDelete) {
      if (confirmTimeoutRef.current !== null) window.clearTimeout(confirmTimeoutRef.current)
      onDelete(todo.id)
      return
    }
    setConfirmingDelete(true)
    confirmTimeoutRef.current = window.setTimeout(() => {
      setConfirmingDelete(false)
    }, DELETE_CONFIRM_TIMEOUT)
  }

  return (
    <li ref={dragRef} style={dragStyle} className="flex items-center gap-3 px-4 py-3">
      {dragHandleProps && (
        <button
          type="button"
          aria-label="드래그하여 순서 변경"
          className="shrink-0 cursor-grab touch-none rounded-md p-1 text-neutral-300 transition-colors hover:text-neutral-500 active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
        >
          <GripIcon className="h-4 w-4" />
        </button>
      )}
      <input
        type="checkbox"
        checked={todo.isCompleted}
        onChange={() => onToggle(todo.id)}
        aria-label={todo.isCompleted ? '완료 취소' : '완료 처리'}
        className="h-4.5 w-4.5 shrink-0 cursor-pointer rounded border-neutral-300 text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
      />

      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={commitEdit}
            maxLength={MAX_TITLE_LENGTH}
            aria-label="할일 수정"
            className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          />
        ) : (
          <span
            onClick={startEditing}
            title={todo.title}
            className={`block cursor-pointer truncate text-sm ${
              todo.isCompleted ? 'text-neutral-400 line-through' : 'text-neutral-800'
            }`}
          >
            {todo.title}
          </span>
        )}
        <span
          title={metaTooltip}
          className={`mt-0.5 block truncate text-xs ${todo.isCompleted ? 'text-neutral-300' : 'text-neutral-400'}`}
        >
          {metaLabel}
        </span>
      </div>

      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}
      >
        {todo.category}
      </span>

      <button
        type="button"
        onClick={startEditing}
        aria-label="수정"
        className="shrink-0 rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
      >
        <PencilIcon className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={handleDeleteClick}
        aria-label={confirmingDelete ? '삭제하려면 한 번 더 클릭하세요' : '삭제'}
        title={confirmingDelete ? '한 번 더 누르면 삭제됩니다' : '삭제'}
        className={
          confirmingDelete
            ? 'flex shrink-0 items-center gap-1 rounded-md bg-red-500 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2'
            : 'shrink-0 rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2'
        }
      >
        <TrashIcon className="h-4 w-4" />
        {confirmingDelete && <span>확인</span>}
      </button>
    </li>
  )
})

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M16.862 3.487a1.875 1.875 0 1 1 2.652 2.652L7.5 18.153l-3.75.938.938-3.75L16.862 3.487Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GripIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="9" cy="6" r="1.4" />
      <circle cx="15" cy="6" r="1.4" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <circle cx="9" cy="18" r="1.4" />
      <circle cx="15" cy="18" r="1.4" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 7.5h12M9.75 7.5V5.25a1.5 1.5 0 0 1 1.5-1.5h1.5a1.5 1.5 0 0 1 1.5 1.5V7.5m-7.5 0v11.25a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V7.5m-8 0h9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
