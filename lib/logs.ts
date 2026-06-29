import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export interface SyncLogEntry {
  ts: string
  total: number
  changed: boolean
  added: string[]
  removed: string[]
  modified: string[]
}

const LOG_PATH = join(process.cwd(), 'config', 'sync-history.jsonl')

export function getSyncLogs(): SyncLogEntry[] {
  if (!existsSync(LOG_PATH)) return []
  const raw = readFileSync(LOG_PATH, 'utf8')
  const lines = raw.split('\n').filter(l => l.trim())
  const entries: SyncLogEntry[] = []
  for (const line of lines) {
    try {
      entries.push(JSON.parse(line) as SyncLogEntry)
    } catch {
      // skip malformed line
    }
  }
  // Most recent first.
  return entries.reverse()
}
