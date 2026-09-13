import { memo, useMemo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Todo } from '../types'
import type { UpdateTodoInput } from '../lib/todoOperations'
import { TodoItem } from './TodoItem'

interface SortableTodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onUpdate: (id: string, changes: UpdateTodoInput) => void
  onDelete: (id: string) => void
}

/**
 * '사용자 지정' 정렬일 때 TodoItem을 dnd-kit의 useSortable로 감싸 드래그 가능하게 만든다.
 *
 * 드래그 중에는 목록에 있는 모든 항목의 useSortable이 매 포인터 이동마다 다시 계산되어
 * 이 컴포넌트 자체는 항상 리렌더링된다(useSortable이 내부 컨텍스트를 구독하기 때문에
 * React.memo로도 막을 수 없음). 대신 style/드래그 핸들 props 객체를 useMemo로 캐싱해,
 * 실제로 값이 바뀌지 않은 항목은 새 객체 참조가 생기지 않게 해서 memo(TodoItem)가
 * 리렌더링을 건너뛰도록 한다 — 항목이 100개 이상일 때 드래그 체감 성능에 큰 영향을 준다.
 */
export const SortableTodoItem = memo(function SortableTodoItem({
  todo,
  onToggle,
  onUpdate,
  onDelete,
}: SortableTodoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
  })

  const dragHandleProps = useMemo(() => ({ attributes, listeners }), [attributes, listeners])

  const dragStyle = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition: transition ?? undefined,
      opacity: isDragging ? 0.5 : 1,
      position: 'relative' as const,
      zIndex: isDragging ? 1 : undefined,
      background: isDragging ? 'white' : undefined,
    }),
    [transform, transition, isDragging],
  )

  return (
    <TodoItem
      todo={todo}
      onToggle={onToggle}
      onUpdate={onUpdate}
      onDelete={onDelete}
      dragRef={setNodeRef}
      dragHandleProps={dragHandleProps}
      dragStyle={dragStyle}
    />
  )
})
