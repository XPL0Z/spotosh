import express from 'express'
import cors from 'cors'

import eventsRouter   from './routes/events.mjs'
import statusRouter   from './routes/status.mjs'
import historyRouter  from './routes/history.mjs'
import queueRouter    from './routes/queue.mjs'
import controlsRouter from './routes/controls.mjs'
import { log } from './logger.mjs'

const app = express()
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  const start = Date.now()
  // Set by the web app from the user's session; not verified here
  try { req.user = decodeURIComponent(req.get('x-user') ?? '') || 'anonymous' }
  catch { req.user = 'invalid-user-header' }
  res.on('close', () => {
    log(`[${req.method}] ${req.user} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`)
  })
  next()
})

app.use('/events',   eventsRouter)
app.use('/status',   statusRouter)
app.use('/history',  historyRouter)
app.use('/queue',    queueRouter)
app.use('/controls', controlsRouter)

const PORT = process.env.PORT ?? 4000
app.listen(PORT, () => log(`🎵  server on :${PORT}`))
