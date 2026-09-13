export type SortMode = 'createdAt' | 'category' | 'completed' | 'manual'

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'createdAt', label: '생성일순' },
  { value: 'category', label: '카테고리순' },
  { value: 'completed', label: '완료순' },
  { value: 'manual', label: '사용자 지정(드래그)' },
]

export const DEFAULT_SORT_MODE: SortMode = 'manual'
