export type Category = '업무' | '개인' | '공부' | '여행'

export interface Todo {
  id: string
  title: string
  category: Category
  isCompleted: boolean
  /** ISO 8601 날짜시간 문자열 */
  createdAt: string
  /** ISO 8601 날짜시간 문자열 */
  updatedAt: string
}
