import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type MeasuringConfiguration,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Todo } from '../types'
import type { UpdateTodoInput } from '../lib/todoOperations'
import { TodoItem } from './TodoItem'
import { SortableTodoItem } from './SortableTodoItem'

// 드래그 시작 시 한 번만 각 항목의 위치를 측정하고, 드래그 도중에는 다시 측정하지 않는다.
// 기본값(항상 재측정)은 항목이 많을 때(100개 이상) 포인터를 움직일 때마다 레이아웃을 다시
// 계산해 드래그가 눈에 띄게 버벅이므로, 대량 목록에서 dnd-kit이 권장하는 최적화다.
const MEASURING: MeasuringConfiguration = {
  droppable: { strategy: MeasuringStrategy.BeforeDragging },
}

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string) => void
  onUpdate: (id: string, changes: UpdateTodoInput) => void
  onDelete: (id: string) => void
  /** true면 드래그로 순서를 바꿀 수 있다('사용자 지정' 정렬일 때만 사용) */
  sortable?: boolean
  onReorder?: (orderedIds: string[]) => void
}

export function TodoList({ todos, onToggle, onUpdate, onDelete, sortable = false, onReorder }: TodoListProps) {
  // 훅은 항상 최상단에서 동일한 순서로 호출되어야 하므로 early return보다 앞에 둔다.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  if (todos.length === 0) return null

  const items = todos.map((todo) =>
    sortable ? (
      <SortableTodoItem key={todo.id} todo={todo} onToggle={onToggle} onUpdate={onUpdate} onDelete={onDelete} />
    ) : (
      <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onUpdate={onUpdate} onDelete={onDelete} />
    ),
  )

  if (!sortable) {
    return (
      <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {items}
      </ul>
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = todos.map((todo) => todo.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    onReorder?.(arrayMove(ids, oldIndex, newIndex))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={MEASURING}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={todos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
        <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {items}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
