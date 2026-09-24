import { Router } from 'express'
import { getDeviceStatus, listDevices, sendCommand, type DeviceCommand } from '../smartthingsClient.js'

export const devicesRouter = Router()

devicesRouter.get('/', async (_req, res) => {
  try {
    const devices = await listDevices()
    res.json(devices)
  } catch (err) {
    res.status(502).json({ error: (err as Error).message })
  }
})

devicesRouter.get('/:id/status', async (req, res) => {
  try {
    const status = await getDeviceStatus(req.params.id)
    res.json(status)
  } catch (err) {
    res.status(502).json({ error: (err as Error).message })
  }
})

devicesRouter.post('/:id/commands', async (req, res) => {
  const commands = req.body?.commands as DeviceCommand[] | undefined
  if (!Array.isArray(commands) || commands.length === 0) {
    res.status(400).json({ error: 'body.commands 배열이 필요합니다.' })
    return
  }
  try {
    await sendCommand(req.params.id, commands)
    res.status(204).end()
  } catch (err) {
    res.status(502).json({ error: (err as Error).message })
  }
})
