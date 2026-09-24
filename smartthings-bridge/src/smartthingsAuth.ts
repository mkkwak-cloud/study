import { config } from './config.js'
import { readTokens, writeTokens, type TokenSet } from './tokenStore.js'

const { clientId, clientSecret, redirectUri, scopes, authorizeUrl, tokenUrl } =
  config.smartthings

export function buildAuthorizeUrl(state: string): string {
  const url = new URL(authorizeUrl)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', scopes.join(' '))
  url.searchParams.set('state', state)
  return url.toString()
}

interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number // seconds
}

function basicAuthHeader(): string {
  return 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
}

async function requestToken(body: URLSearchParams): Promise<TokenSet> {
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(),
    },
    body,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SmartThings 토큰 요청 실패 (${res.status}): ${text}`)
  }

  const data = (await res.json()) as TokenResponse
  const tokens: TokenSet = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    // 만료 60초 전에 미리 갱신하도록 여유를 둔다.
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }
  writeTokens(tokens)
  return tokens
}

/** OAuth 콜백에서 받은 authorization code를 access/refresh token으로 교환한다. */
export function exchangeCodeForTokens(code: string): Promise<TokenSet> {
  return requestToken(
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
    }),
  )
}

function refreshTokens(refreshToken: string): Promise<TokenSet> {
  return requestToken(
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  )
}

/**
 * 유효한 access token을 반환한다. 만료가 임박했으면 자동으로 refresh한다.
 * FR-01/NFR-21: PAT(24시간 만료) 대신 OAuth refresh token으로 상시 연동을 유지한다.
 */
export async function getValidAccessToken(): Promise<string> {
  const tokens = readTokens()
  if (!tokens) {
    throw new Error('연동되지 않았습니다. GET /auth/login 으로 먼저 SmartThings 계정을 연결하세요.')
  }
  if (Date.now() < tokens.expiresAt) {
    return tokens.accessToken
  }
  const refreshed = await refreshTokens(tokens.refreshToken)
  return refreshed.accessToken
}

export function isConnected(): boolean {
  return readTokens() !== null
}
