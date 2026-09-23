import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { state, getState, broadcast } from '../state.mjs'
import { playItem } from '../playback.mjs'
import { log } from '../logger.mjs'

const router = Router()

const MAX_QUEUE = 1000

router.get('/', (_req, res) => res.json(getState()))

router.post('/', (req, res) => {
  const { trackId, title, artist, album, artwork, durationMs } = req.body

  if (!trackId || !title) {
    return res.status(400).json({ error: 'trackId and title are required' })
  }
  if (state.queue.length >= MAX_QUEUE) {
    return res.status(429).json({ error: `Queue is full (max ${MAX_QUEUE})` })
  }

  const item = {
    id:         randomUUID(),
    trackId,
    title,
    artist:     artist     ?? '',
    album:      album      ?? '',
    artwork:    artwork     ?? '',
    durationMs: durationMs ?? 0,
    addedAt:    Date.now(),
  }

  state.queue.push(item)
  log(`[queue] ${req.user} added "${title}" by ${item.artist || 'unknown'} (${state.queue.length} in queue)`)

  if (!state.isPlaying) {
    playItem(item)
    return res.status(201).json(item)
  }

  broadcast()
  res.status(201).json(item)
})

router.patch('/reorder', (req, res) => {
  const { ids } = req.body
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' })
  const map = new Map(state.queue.map(item => [item.id, item]))
  const reordered = ids.map(id => map.get(id)).filter(Boolean)
  const missing = state.queue.filter(item => !ids.includes(item.id))
  state.queue = [...reordered, ...missing]
  log(`[queue] ${req.user} reordered ${state.queue.length} items`)
  broadcast()
  res.status(200).json({ ok: true })
})

router.delete('/:id', (req, res) => {
  const removed = state.queue.find(i => i.id === req.params.id)
  if (!removed) return res.status(404).json({ error: 'Not found' })
  state.queue = state.queue.filter(i => i.id !== req.params.id)
  log(`[queue] ${req.user} removed "${removed.title}" by ${removed.artist || 'unknown'} (${state.queue.length} in queue)`)
  broadcast()
  res.status(204).end()
})

export default router
