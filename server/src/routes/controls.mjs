import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { state, getState, broadcast } from '../state.mjs'
import { playItem, advanceQueue, stopCurrent, startProgressTimer } from '../playback.mjs'
import { log, logError } from '../logger.mjs'

const router = Router()

router.post('/', async (req, res) => {
  const { action, value } = req.body
  log(`[controls] ${req.user} ${action}${value !== undefined ? ` value=${value}` : ''}`)

  try {
    switch (action) {

      case 'pause':
        if (state.isPlaying && state.mpv) {
          if (state.mpv.connected) {
            await state.mpv.pause()
          } else {
            state.mpv.process?.kill('SIGSTOP')
          }
          if (state.progressInterval) {
            clearInterval(state.progressInterval)
            state.progressInterval = null
          }
          state.isPlaying = false
          broadcast()
        }
        break

      case 'resume':
        if (!state.isPlaying && state.mpv) {
          if (state.mpv.connected) {
            await state.mpv.resume()
          } else {
            state.mpv.process?.kill('SIGCONT')
          }
          state.isPlaying = true
          startProgressTimer(state.progressMs)
          broadcast()
        } else if (!state.isPlaying && !state.mpv && state.queue.length > 0) {
          playItem(state.queue[0])
        }
        break

      case 'skip':
        advanceQueue()
        break

      case 'volume':
        if (typeof value === 'number') {
          state.volume = Math.max(0, Math.min(100, value))
          if (state.mpv?.connected) await state.mpv.setVolume(state.volume)
          broadcast()
        }
        break

      case 'seek':
        if (typeof value === 'number' && state.mpv?.connected && state.nowPlaying) {
          const maxSecs = (state.nowPlaying.durationMs / 1000) - 1
          const secs    = Math.max(0, Math.min(value, maxSecs))
          await state.mpv.seek(secs)
          state.progressMs = Math.round(secs * 1000)
          broadcast()
        }
        break

      case 'back': {
        // More than 3s in: restart current track
        if (state.progressMs > 3000 && state.mpv?.connected) {
          await state.mpv.seek(0)
          state.progressMs = 0
          broadcast()
          break
        }
        // Otherwise: go to previous track
        state.playedStack.pop()               // remove current track
        const prev = state.playedStack.pop()  // playItem will re-push it
        if (prev) {
          state.queue.unshift({ ...prev, id: randomUUID(), addedAt: Date.now() })
          advanceQueue()
        } else if (state.mpv?.connected) {
          await state.mpv.seek(0)
          state.progressMs = 0
          broadcast()
        }
        break
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` })
    }
  } catch (err) {
    logError(`[controls/${action}] ${req.user}`, err.message)
    return res.status(500).json({ error: err.message })
  }

  res.json(getState())
})

export default router
