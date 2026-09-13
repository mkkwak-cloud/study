import type { Category, Todo } from '../types'
import { CATEGORIES } from '../constants/categories'
import { MAX_TITLE_LENGTH } from '../constants/todo'
import { generateId } from './id'

const HEADERS = ['제목', '카테고리', '완료여부', '생성일시', '수정일시'] as const

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * 현재 할일 목록을 엑셀(.xlsx) 파일로 다운로드한다. 가져오기와 같은 헤더 형식을 사용해 재가져오기가 가능하다.
 * xlsx는 번들 크기가 커서(~700KB) 실제로 내보내기를 실행할 때만 동적으로 로드한다.
 */
export async function exportTodosToExcel(todos: Todo[]): Promise<void> {
  const XLSX = await import('xlsx')

  const rows = todos.map((todo) => ({
    제목: todo.title,
    카테고리: todo.category,
    완료여부: todo.isCompleted ? '완료' : '미완료',
    생성일시: todo.createdAt,
    수정일시: todo.updatedAt,
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: [...HEADERS] })
  worksheet['!cols'] = [{ wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 22 }, { wch: 22 }]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '할일목록')

  const now = new Date()
  const filename = `할일목록_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}.xlsx`
  XLSX.writeFile(workbook, filename)
}

export interface ImportResult {
  todos: Todo[]
  /** 제목이 비어 있어 제외된 행 수 */
  skipped: number
  /** 카테고리 값이 유효하지 않아 '개인'으로 자동 보정된 행 수 */
  fixedCategory: number
}

function normalizeCategory(value: unknown): { category: Category; fixed: boolean } {
  const text = String(value ?? '').trim()
  if ((CATEGORIES as readonly string[]).includes(text)) {
    return { category: text as Category, fixed: false }
  }
  return { category: '개인', fixed: true }
}

function normalizeCompleted(value: unknown): boolean {
  const text = String(value ?? '').trim().toLowerCase()
  return ['완료', 'true', 'y', 'yes', 'o', '1'].includes(text)
}

function normalizeDate(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null
  const date = value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

/** 엑셀 파일(.xlsx/.xls)을 읽어 Todo 배열로 변환한다. id는 항상 새로 발급한다. */
export async function parseTodosFromExcelFile(file: File): Promise<ImportResult> {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) {
    return { todos: [], skipped: 0, fixedCategory: 0 }
  }

  const sheet = workbook.Sheets[firstSheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  let skipped = 0
  let fixedCategory = 0
  const todos: Todo[] = []

  for (const row of rows) {
    const rawTitle = String(row['제목'] ?? row['title'] ?? '').trim()
    if (!rawTitle) {
      skipped += 1
      continue
    }

    const { category, fixed } = normalizeCategory(row['카테고리'] ?? row['category'])
    if (fixed) fixedCategory += 1

    const isCompleted = normalizeCompleted(row['완료여부'] ?? row['isCompleted'])
    const createdAt = normalizeDate(row['생성일시'] ?? row['createdAt']) ?? new Date().toISOString()
    const updatedAt = normalizeDate(row['수정일시'] ?? row['updatedAt']) ?? createdAt

    todos.push({
      id: generateId(),
      title: rawTitle.slice(0, MAX_TITLE_LENGTH),
      category,
      isCompleted,
      createdAt,
      updatedAt,
    })
  }

  return { todos, skipped, fixedCategory }
}
