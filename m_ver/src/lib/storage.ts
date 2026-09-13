import type { Todo } from '../types'

const STORAGE_KEY = 'todos'

/**
 * localStorage에서 할일 목록을 불러온다.
 * 저장된 값이 없거나, 파싱에 실패하거나, 배열이 아니면 빈 배열을 반환한다.
 */
export function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Todo[]) : []
  } catch (error) {
    console.error('할일 데이터를 불러오는 데 실패했습니다.', error)
    return []
  }
}

/** 할일 목록을 localStorage에 저장한다. */
export function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch (error) {
    console.error('할일 데이터를 저장하는 데 실패했습니다.', error)
  }
}
