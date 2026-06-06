import fs from 'fs'
import path from 'path'
import type { ApiKeyEntry } from '../lib/types'

// Minimal YAML frontmatter parser for the api-keys markdown files.
// Supports: key: value, key: "quoted", key: [], key: list-on-next-lines with "- item".
// Not a general YAML parser — only the shapes used in data/api-keys/*.md.
function parseFrontmatter(content: string): { meta: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { meta: {}, body: content.trim() }
  const [, raw, body] = match
  const meta: Record<string, unknown> = {}
  const lines = raw.split('\n')

  let currentListKey: string | null = null
  let currentList: string[] = []

  const commitList = () => {
    if (currentListKey) {
      meta[currentListKey] = currentList
      currentListKey = null
      currentList = []
    }
  }

  for (const line of lines) {
    if (currentListKey && /^\s+-\s+/.test(line)) {
      currentList.push(line.replace(/^\s+-\s+/, '').trim())
      continue
    }
    if (currentListKey) commitList()

    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!m) continue
    const [, key, rawValue] = m
    const value = rawValue.trim()

    if (value === '') {
      currentListKey = key
      currentList = []
      continue
    }
    if (value === '[]') {
      meta[key] = []
      continue
    }
    if (value === 'true') { meta[key] = true; continue }
    if (value === 'false') { meta[key] = false; continue }

    // strip surrounding quotes
    let v = value
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    meta[key] = v
  }
  commitList()

  return { meta, body: body.trim() }
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

function asBool(v: unknown): boolean {
  return v === true
}

export function parseApiKeyFile(content: string): ApiKeyEntry | null {
  const { meta, body } = parseFrontmatter(content)
  const provider = asString(meta.provider)
  if (!provider) return null
  return {
    provider,
    vault_ref: asString(meta.vault_ref),
    vault_url: asString(meta.vault_url),
    billingUrl: asString(meta.billingUrl),
    keysUrl: asString(meta.keysUrl),
    spendLimit: asString(meta.spendLimit),
    spendLimitSet: asBool(meta.spendLimitSet),
    lastRotated: asString(meta.lastRotated),
    projects: asStringArray(meta.projects),
    notes: body,
  }
}

export function readApiKeys(dir: string): ApiKeyEntry[] {
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return []
  }
  const results: ApiKeyEntry[] = []
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue
    try {
      const content = fs.readFileSync(path.join(dir, entry.name), 'utf-8')
      const parsed = parseApiKeyFile(content)
      if (parsed) results.push(parsed)
    } catch { /* skip */ }
  }
  results.sort((a, b) => a.provider.toLowerCase().localeCompare(b.provider.toLowerCase()))
  return results
}
