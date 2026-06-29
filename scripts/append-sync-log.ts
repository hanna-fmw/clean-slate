import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs'
import { join } from 'path'

interface Project {
  name: string
  last_modified?: string
}

interface DataJson {
  projects?: Project[]
  generated_at?: string
}

function loadProjects(path: string): Project[] {
  if (!existsSync(path)) return []
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as DataJson
    return parsed.projects ?? []
  } catch {
    return []
  }
}

function nameSet(projects: Project[]): Set<string> {
  return new Set(projects.map(p => p.name))
}

const [, , beforePath, afterPath] = process.argv
if (!beforePath || !afterPath) {
  console.error('usage: append-sync-log.ts <before-data.json> <after-data.json>')
  process.exit(2)
}

const before = loadProjects(beforePath)
const after = loadProjects(afterPath)

const beforeNames = nameSet(before)
const afterNames = nameSet(after)

const added = [...afterNames].filter(n => !beforeNames.has(n)).sort()
const removed = [...beforeNames].filter(n => !afterNames.has(n)).sort()

const beforeByName = new Map(before.map(p => [p.name, p]))
const modified: string[] = []
for (const p of after) {
  const prev = beforeByName.get(p.name)
  if (!prev) continue
  if ((prev.last_modified ?? '') !== (p.last_modified ?? '')) {
    modified.push(p.name)
  }
}
modified.sort()

const entry = {
  ts: new Date().toISOString(),
  total: after.length,
  changed: added.length + removed.length + modified.length > 0,
  added,
  removed,
  modified,
}

const logPath = join(process.cwd(), 'config', 'sync-history.jsonl')
appendFileSync(logPath, JSON.stringify(entry) + '\n')
console.log(
  `Logged sync: total=${entry.total} +${added.length}/-${removed.length}/~${modified.length}`,
)

// Cap history file at last 500 entries so it stays trim across years of daily runs.
const all = readFileSync(logPath, 'utf8').trim().split('\n')
if (all.length > 500) {
  writeFileSync(logPath, all.slice(-500).join('\n') + '\n')
}
