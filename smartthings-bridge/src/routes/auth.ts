import { Router } from 'express'
import { randomBytes } from 'node:crypto'
import { buildAuthorizeUrl, exchangeCodeForTokens, isConnected } from '../smartthingsAuth.js'

export const authRouter = Router()

// 단일 사용자 로컬 서버이므로 진행 중인 state 하나만 메모리에 둔다.
let pendingState: string | null = null

authRouter.get('/login', (_req, res) => {
  pendingState = randomBytes(16).toString('hex')
  res.redirect(buildAuthorizeUrl(pendingState))
})

authRouter.get('/callback', async (req, res) => {
  const { code, state, error } = req.query

  if (error) {
    res.status(400).send(`SmartThings 인증 거부됨: ${error}`)
    return
  }
  if (typeof state !== 'string' || state !== pendingState) {
    res.status(400).send('state 값이 일치하지 않습니다. /auth/login 부터 다시 시도하세요.')
    return
  }
  if (typeof code !== 'string') {
    res.status(400).send('authorization code 가 없습니다.')
    return
  }

  pendingState = null

  try {
    await exchangeCodeForTokens(code)
    res.send('SmartThings 계정 연결 완료. 이 창은 닫아도 됩니다.')
  } catch (err) {
    res.status(500).send(`토큰 교환 실패: ${(err as Error).message}`)
  }
})

authRouter.get('/status', (_req, res) => {
  res.json({ connected: isConnected() })
})
