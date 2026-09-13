import type { Category, Todo } from '../types'
import type { SortMode } from '../constants/sort'
import { CATEGORIES } from '../constants/categories'
import { generateId } from './id'

export interface CreateTodoInput {
  title: string
  category: Category
}

export interface UpdateTodoInput {
  title?: string
  category?: Category
}

export interface TodoStats {
  total: number
  completed: number
  /** 0~100 사이의 정수. total이 0이면 0. */
  percent: number
}

/** 순수 함수 모음: 상태(useState)나 저장소에 의존하지 않고 배열을 입력받아 새 배열을 반환한다. */

export function createTodo({ title, category }: CreateTodoInput): Todo {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    title: title.trim(),
    category,
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  }
}

export function addTodo(todos: Todo[], input: CreateTodoInput): Todo[] {
  return [...todos, createTodo(input)]
}

export function updateTodo(todos: Todo[], id: string, changes: UpdateTodoInput): Todo[] {
  return todos.map((todo) => {
    if (todo.id !== id) return todo
    return {
      ...todo,
      title: changes.title !== undefined ? changes.title.trim() : todo.title,
      category: changes.category ?? todo.category,
      updatedAt: new Date().toISOString(),
    }
  })
}

export function deleteTodo(todos: Todo[], id: string): Todo[] {
  return todos.filter((todo) => todo.id !== id)
}

export function toggleTodo(todos: Todo[], id: string): Todo[] {
  return todos.map((todo) =>
    todo.id === id
      ? { ...todo, isCompleted: !todo.isCompleted, updatedAt: new Date().toISOString() }
      : todo,
  )
}

/** 전체/완료 개수와 완료율(%)을 계산한다. 목록이 비어 있어도 0으로 나누지 않는다. */
export function getTodoStats(todos: Todo[]): TodoStats {
  const total = todos.length
  const completed = todos.filter((todo) => todo.isCompleted).length
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { total, completed, percent }
}

/** 카테고리별 항목 개수를 계산한다. 필터 탭의 "카테고리 (n)" 표시에 사용한다. */
export function getCategoryCounts(todos: Todo[]): Record<Category, number> {
  const counts: Record<Category, number> = { 업무: 0, 개인: 0, 공부: 0, 여행: 0 }
  for (const todo of todos) {
    counts[todo.category] += 1
  }
  return counts
}

const CATEGORY_ORDER: Record<Category, number> = Object.fromEntries(
  CATEGORIES.map((category, index) => [category, index]),
) as Record<Category, number>

/**
 * 정렬 기준에 따라 새 배열을 반환한다. 'manual'은 사용자가 드래그로 정한 순서이므로
 * 원본 배열(저장된 순서)을 그대로 반환한다.
 */
export function sortTodos(todos: Todo[], mode: SortMode): Todo[] {
  switch (mode) {
    case 'createdAt':
      // 최신순: 나중에 만든 항목이 위로
      return [...todos].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    case 'category':
      return [...todos].sort((a, b) => CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category])
    case 'completed':
      // 미완료가 먼저, 완료가 나중 (배열은 안정 정렬이므로 그룹 내 기존 순서는 유지됨)
      return [...todos].sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted))
    case 'manual':
    default:
      return todos
  }
}

/**
 * todos(전체 배열) 중 orderedIds에 포함된 항목들만 그 순서대로 재배치한다.
 * 해당 항목들이 원래 차지하던 절대 위치(인덱스)는 그대로 두고 내용만 바꿔치기하므로,
 * 카테고리 필터가 걸린 상태에서 드래그해도 필터에 안 걸리는 다른 항목들의 위치는 유지된다.
 */
export function reorderTodos(todos: Todo[], orderedIds: string[]): Todo[] {
  const idSet = new Set(orderedIds)
  const targetIndices: number[] = []
  todos.forEach((todo, index) => {
    if (idSet.has(todo.id)) targetIndices.push(index)
  })
  if (targetIndices.length !== orderedIds.length) return todos // 불일치 시 안전하게 원본 유지

  const byId = new Map(todos.map((todo) => [todo.id, todo]))
  const result = [...todos]
  targetIndices.forEach((absoluteIndex, i) => {
    const todo = byId.get(orderedIds[i])
    if (todo) result[absoluteIndex] = todo
  })
  return result
}
