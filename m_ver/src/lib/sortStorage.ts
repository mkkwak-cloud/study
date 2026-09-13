import type { SortMode } from '../constants/sort'
import { DEFAULT_SORT_MODE, SORT_OPTIONS } from '../constants/sort'

const SORT_MODE_KEY = 'todo-sort-mode'
const VALID_MODES = new Set(SORT_OPTIONS.map((option) => option.value))

export function loadSortMode(): SortMode {
  try {
    const raw = localStorage.getItem(SORT_MODE_KEY)
    if (raw && VALID_MODES.has(raw as SortMode)) return raw as SortMode
    return DEFAULT_SORT_MODE
  } catch (error) {
    console.error('정렬 설정을 불러오는 데 실패했습니다.', error)
    return DEFAULT_SORT_MODE
  }
}

export function saveSortMode(mode: SortMode): void {
  try {
    localStorage.setItem(SORT_MODE_KEY, mode)
  } catch (error) {
    console.error('정렬 설정을 저장하는 데 실패했습니다.', error)
  }
}
