import fs from 'node:fs'
import path from 'node:path'
import { format } from 'node:util'
import { DATA_DIR } from './history.mjs'

export const LOG_FILE = process.env.LOG_FILE ?? path.join(DATA_DIR, 'logs', 'server.log')

let stream = null
try {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true })
  stream = fs.createWriteStream(LOG_FILE, { flags: 'a' })
  stream.on('error', err => {
    console.error('[logger] write failed:', err.message)
    stream = null
  })
} catch (err) {
  console.error(`[logger] cannot open ${LOG_FILE}:`, err.message)
}

function write(level, args) {
  const line = format(...args)
  if (level === 'ERROR') console.error(line)
  else console.log(line)
  stream?.write(`${new Date().toISOString()} ${level} ${line}\n`)
}

export const log      = (...args) => write('INFO', args)
export const logError = (...args) => write('ERROR', args)
