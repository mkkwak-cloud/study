import type { Todo } from '../types'

const BACKUP_KEY = 'todos_backup'

interface Backup {
  savedAt: string
  todos: Todo[]
}

/** 가져오기 등 파괴적인 작업 직전에 현재 목록을 스냅샷으로 저장한다. */
export function backupTodos(todos: Todo[]): void {
  try {
    const backup: Backup = { savedAt: new Date().toISOString(), todos }
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup))
  } catch (error) {
    console.error('백업 저장에 실패했습니다.', error)
  }
}

/** 저장된 백업을 읽는다. 없거나 손상된 경우 null. */
export function readBackup(): Backup | null {
  try {
    const raw = localStorage.getItem(BACKUP_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.todos) || typeof parsed.savedAt !== 'string') return null
    return parsed as Backup
  } catch (error) {
    console.error('백업을 불러오는 데 실패했습니다.', error)
    return null
  }
}

export function clearBackup(): void {
  try {
    localStorage.removeItem(BACKUP_KEY)
  } catch (error) {
    console.error('백업 삭제에 실패했습니다.', error)
  }
}
