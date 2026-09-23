import { Router } from 'express'
import { state } from '../state.mjs'
import { saveHistory } from '../history.mjs'
import { log } from '../logger.mjs'

const router = Router()

router.get('/', (_req, res) => res.json(state.history))

router.delete('/:id', (req, res) => {
  const removed = state.history.find(item => item.id === req.params.id)
  if (!removed) return res.status(404).json({ error: 'Not found' })
  state.history = state.history.filter(item => item.id !== req.params.id)
  saveHistory(state.history)
  log(`[history] ${req.user} removed "${removed.title}" by ${removed.artist || 'unknown'}`)
  res.json({ ok: true })
})

export default router
