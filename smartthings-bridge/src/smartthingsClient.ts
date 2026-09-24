import { config } from './config.js'
import { getValidAccessToken } from './smartthingsAuth.js'
import { acquireSlot } from './rateLimiter.js'

const { apiBaseUrl } = config.smartthings

export interface SmartThingsDevice {
  deviceId: string
  label: string
  name: string
  roomId?: string
  components: unknown[]
  [key: string]: unknown
}

export interface DeviceCommand {
  component?: string
  capability: string
  command: string
  arguments?: unknown[]
}

async function authedFetch(path: string, init?: RequestInit): Promise<Response> {
  const accessToken = await getValidAccessToken()
  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SmartThings API 오류 ${res.status} (${path}): ${text}`)
  }
  return res
}

/** FR-01: 기기 목록 조회. 방/기기 카드 그리드를 채우는 데 쓰인다. */
export async function listDevices(): Promise<SmartThingsDevice[]> {
  const res = await authedFetch('/devices')
  const data = (await res.json()) as { items: SmartThingsDevice[] }
  return data.items
}

/** FR-14: 기기 상태(연결성/속성) 조회. */
export async function getDeviceStatus(deviceId: string): Promise<unknown> {
  await acquireSlot(deviceId)
  const res = await authedFetch(`/devices/${deviceId}/status`)
  return res.json()
}

/**
 * FR-20/FR-21: 기기 명령 전송. 레이트리밋 큐를 거쳐 NFR-05(기기당 12 req/min)
 * 한도를 넘지 않도록 한다.
 */
export async function sendCommand(deviceId: string, commands: DeviceCommand[]): Promise<void> {
  await acquireSlot(deviceId)
  await authedFetch(`/devices/${deviceId}/commands`, {
    method: 'POST',
    body: JSON.stringify({ commands }),
  })
}
