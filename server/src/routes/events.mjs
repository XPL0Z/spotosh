import { Router } from 'express'
import { state, emitter, getState, broadcast } from '../state.mjs'
import { log } from '../logger.mjs'

const router = Router()

// SSE — état temps réel vers tous les clients connectés
router.get('/', (req, res) => {
  res.setHeader('Content-Type',      'text/event-stream')
  res.setHeader('Cache-Control',     'no-cache, no-transform')
  res.setHeader('Connection',        'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  state.userCount++
  log(`[events] ${req.user} connected (${state.userCount} total)`)
  broadcast()

  const send = stateSnapshot => res.write(`data: ${JSON.stringify(stateSnapshot)}\n\n`)
  send(getState())
  emitter.on('state', send)

  req.on('close', () => {
    emitter.removeListener('state', send)
    state.userCount--
    log(`[events] ${req.user} disconnected (${state.userCount} total)`)
    broadcast()
  })
})

export default router
