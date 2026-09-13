/** 고유 id를 생성한다. 표준 crypto.randomUUID를 우선 사용하고, 지원하지 않는 환경에서는 폴백을 사용한다. */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
