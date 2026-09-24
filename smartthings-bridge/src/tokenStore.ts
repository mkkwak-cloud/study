import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// 개인 1인용 로컬 서버라는 전제 하에 파일 기반으로 토큰을 보관한다.
// NFR-20: 평문 자격증명을 Git에 커밋하지 않는다 — 이 파일 경로는 .gitignore 대상.

const __dirname = dirname(fileURLToPath(import.meta.url))
const TOKENS_PATH = join(__dirname, '..', 'tokens.json')

export interface TokenSet {
  accessToken: string
  refreshToken: string
  /** epoch ms. 이 시각 전에 refresh 를 시도한다. */
  expiresAt: number
}

export function readTokens(): TokenSet | null {
  if (!existsSync(TOKENS_PATH)) return null
  try {
    return JSON.parse(readFileSync(TOKENS_PATH, 'utf-8')) as TokenSet
  } catch {
    return null
  }
}

export function writeTokens(tokens: TokenSet): void {
  writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2), 'utf-8')
}
