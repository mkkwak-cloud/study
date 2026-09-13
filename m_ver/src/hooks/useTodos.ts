import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Todo } from '../types'
import type { SortMode } from '../constants/sort'
import { loadTodos, saveTodos } from '../lib/storage'
import { loadSortMode, saveSortMode } from '../lib/sortStorage'
import {
  addTodo as addTodoOperation,
  deleteTodo as deleteTodoOperation,
  getCategoryCounts,
  getTodoStats,
  reorderTodos as reorderTodosOperation,
  sortTodos,
  toggleTodo as toggleTodoOperation,
  updateTodo as updateTodoOperation,
  type CreateTodoInput,
  type UpdateTodoInput,
} from '../lib/todoOperations'

/**
 * 할일 목록 상태와 CRUD 함수를 제공하는 커스텀 훅.
 * 최초 마운트 시 localStorage에서 데이터를 불러오고, todos가 바뀔 때마다 다시 저장한다.
 * 정렬 기준(sortMode)도 함께 관리하며 localStorage에 별도로 저장한다.
 */
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos())
  const [sortMode, setSortModeState] = useState<SortMode>(() => loadSortMode())

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  useEffect(() => {
    saveSortMode(sortMode)
  }, [sortMode])

  // 함수형 업데이트(prev => ...)만 사용하므로 todos에 의존하지 않고 항상 동일한 함수 참조를 유지한다.
  // TodoItem을 memo로 감쌌을 때 이 안정된 참조 덕분에 변경되지 않은 항목은 리렌더링을 건너뛴다.
  const addTodo = useCallback((input: CreateTodoInput) => {
    setTodos((prev) => addTodoOperation(prev, input))
  }, [])

  const updateTodo = useCallback((id: string, changes: UpdateTodoInput) => {
    setTodos((prev) => updateTodoOperation(prev, id, changes))
  }, [])

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => deleteTodoOperation(prev, id))
  }, [])

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) => toggleTodoOperation(prev, id))
  }, [])

  /** 지정한 id들을 그 순서대로 재배치한다(드래그앤드롭 결과 반영). 나머지 항목의 절대 위치는 유지된다. */
  const reorderTodos = useCallback((orderedIds: string[]) => {
    setTodos((prev) => reorderTodosOperation(prev, orderedIds))
  }, [])

  /** 가져오기 등으로 목록 전체를 교체한다. */
  const replaceAllTodos = useCallback((next: Todo[]) => {
    setTodos(next)
  }, [])

  const setSortMode = useCallback((mode: SortMode) => {
    setSortModeState(mode)
  }, [])

  const stats = useMemo(() => getTodoStats(todos), [todos])
  const categoryCounts = useMemo(() => getCategoryCounts(todos), [todos])
  const sortedTodos = useMemo(() => sortTodos(todos, sortMode), [todos, sortMode])

  return {
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
    stats,
    categoryCounts,
  }
}
