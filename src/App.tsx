import { useState } from 'react'
import { TodoInput } from './components/TodoInput'
import { ProgressSection } from './components/ProgressSection'
import { CategoryFilter } from './components/CategoryFilter'
import type { FilterValue } from './components/CategoryFilter'
import { Toolbar } from './components/Toolbar'
import { TodoList } from './components/TodoList'
import { useTodos } from './hooks/useTodos'
import { getTodoStats } from './lib/todoOperations'
import { exportTodosToExcel, parseTodosFromExcelFile } from './lib/excel'
import { backupTodos, readBackup } from './lib/backup'

function App() {
  const {
    todos,
    sortedTodos,
    sortMode,
    setSortMode,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    reorderTodos,
    replaceAllTodos,
    categoryCounts,
  } = useTodos()

  const [showCompleted, setShowCompleted] = useState(true)
  const [filter, setFilter] = useState<FilterValue>('전체')
  const [notice, setNotice] = useState<string | null>(null)
  const [hasBackup, setHasBackup] = useState(() => readBackup() !== null)

  const filteredTodos = filter === '전체' ? sortedTodos : sortedTodos.filter((todo) => todo.category === filter)
  const filteredStats = getTodoStats(filteredTodos)

  // '완료순' 정렬일 때만 기존처럼 미완료/완료 섹션을 분리하고 완료 섹션을 접고 펼 수 있게 한다.
  // 그 외 정렬(생성일순/카테고리순/사용자 지정)에서는 하나의 목록에 정렬 기준대로 표시한다.
  const isCompletedSort = sortMode === 'completed'
  const activeTodos = filteredTodos.filter((todo) => !todo.isCompleted)
  const completedTodos = filteredTodos.filter((todo) => todo.isCompleted)

  const emptyMessage =
    todos.length === 0
      ? '할일이 없습니다. 새로운 할일을 추가해보세요.'
      : `"${filter}" 카테고리에 할일이 없습니다.`

  const handleExport = async () => {
    try {
      await exportTodosToExcel(todos)
    } catch (error) {
      console.error('엑셀 내보내기 실패', error)
      window.alert('엑셀 파일을 만드는 중 문제가 발생했습니다.')
    }
  }

  const handleImportFile = async (file: File) => {
    const proceed = window.confirm(
      '가져오기를 진행하면 현재 목록이 파일 내용으로 교체됩니다.\n(진행 전 현재 데이터는 자동 백업되며, 이후 되돌릴 수 있습니다)\n계속할까요?',
    )
    if (!proceed) return

    try {
      const { todos: imported, skipped, fixedCategory } = await parseTodosFromExcelFile(file)

      backupTodos(todos)
      setHasBackup(true)
      replaceAllTodos(imported)

      const parts = [`${imported.length}개 항목을 가져왔습니다.`]
      if (fixedCategory > 0) parts.push(`카테고리 자동 보정 ${fixedCategory}건`)
      if (skipped > 0) parts.push(`빈 항목 ${skipped}건 제외`)
      setNotice(parts.join(' '))
    } catch (error) {
      console.error('엑셀 가져오기 실패', error)
      window.alert('엑셀 파일을 읽는 중 문제가 발생했습니다. 파일 형식을 확인해주세요.')
    }
  }

  const handleRestoreBackup = () => {
    const backup = readBackup()
    if (!backup) return
    replaceAllTodos(backup.todos)
    setNotice('가져오기 이전 상태로 되돌렸습니다.')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-8 sm:px-6">
        <h1 className="text-xl font-semibold text-neutral-900">할일 관리</h1>

        <TodoInput onAdd={(title, category) => addTodo({ title, category })} />

        <ProgressSection total={filteredStats.total} completed={filteredStats.completed} />

        <CategoryFilter
          total={todos.length}
          categoryCounts={categoryCounts}
          selected={filter}
          onSelect={setFilter}
        />

        <Toolbar
          sortMode={sortMode}
          onSortModeChange={setSortMode}
          onExport={handleExport}
          onImportFile={handleImportFile}
        />

        {notice && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600">
            <span>{notice}</span>
            <div className="flex shrink-0 items-center gap-3">
              {hasBackup && (
                <button
                  type="button"
                  onClick={handleRestoreBackup}
                  className="font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-700"
                >
                  되돌리기
                </button>
              )}
              <button
                type="button"
                onClick={() => setNotice(null)}
                aria-label="닫기"
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {filteredStats.total === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-200 py-10 text-center text-sm text-neutral-400">
            {emptyMessage}
          </p>
        ) : isCompletedSort ? (
          <div className="flex flex-col gap-3">
            {activeTodos.length > 0 ? (
              <TodoList
                todos={activeTodos}
                onToggle={toggleTodo}
                onUpdate={updateTodo}
                onDelete={deleteTodo}
              />
            ) : (
              <p className="rounded-xl border border-dashed border-neutral-200 py-6 text-center text-sm text-neutral-400">
                진행 중인 할일이 없습니다 🎉
              </p>
            )}

            {completedTodos.length > 0 && (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompleted((prev) => !prev)}
                  aria-expanded={showCompleted}
                  className="flex items-center gap-1.5 self-start rounded-md text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
                >
                  <ChevronIcon
                    className={`h-3.5 w-3.5 transition-transform ${showCompleted ? 'rotate-90' : ''}`}
                  />
                  완료 항목 ({completedTodos.length}) {showCompleted ? '접기' : '펼치기'}
                </button>

                {showCompleted && (
                  <TodoList
                    todos={completedTodos}
                    onToggle={toggleTodo}
                    onUpdate={updateTodo}
                    onDelete={deleteTodo}
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          <TodoList
            todos={filteredTodos}
            onToggle={toggleTodo}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
            sortable={sortMode === 'manual'}
            onReorder={reorderTodos}
          />
        )}
      </div>
    </div>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="m9 5 7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default App
