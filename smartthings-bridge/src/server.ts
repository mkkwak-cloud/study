import express from 'express'
import { config } from './config.js'
import { authRouter } from './routes/auth.js'
import { devicesRouter } from './routes/devices.js'

const app = express()

app.use(express.json())

// tablet-ui(브라우저)에서만 호출하도록 단순 CORS 허용.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', config.allowedOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }
  next()
})

app.use('/auth', authRouter)
app.use('/api/devices', devicesRouter)

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.listen(config.port, () => {
  console.log(`smartthings-bridge listening on http://localhost:${config.port}`)
  console.log(`연동 시작: http://localhost:${config.port}/auth/login`)
})
