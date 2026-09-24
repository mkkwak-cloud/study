// NFR-05: SmartThings 공개 가이드라인 — 기기당 GET/명령/이벤트 12 req/min.
// 기기별로 최근 60초 이내 요청 타임스탬프를 추적해, 한도에 걸리면 다음 슬롯이
// 열릴 때까지 대기시킨다(초과 호출로 인한 일시 차단을 예방).

const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 12

const requestLog = new Map<string, number[]>()

function pruneOld(timestamps: number[], now: number): number[] {
  return timestamps.filter((t) => now - t < WINDOW_MS)
}

/** deviceId 에 대한 호출 슬롯이 열릴 때까지 대기한 뒤 반환한다. */
export async function acquireSlot(deviceId: string): Promise<void> {
  for (;;) {
    const now = Date.now()
    const recent = pruneOld(requestLog.get(deviceId) ?? [], now)

    if (recent.length < MAX_PER_WINDOW) {
      recent.push(now)
      requestLog.set(deviceId, recent)
      return
    }

    const oldest = recent[0]
    const waitMs = WINDOW_MS - (now - oldest) + 10
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }
}
