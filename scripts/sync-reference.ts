import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs'
import { join, basename, relative } from 'path'
import { homedir } from 'os'

interface ReferenceItem {
  name: string
  path: string
  description: string
  kind: 'file' | 'dir'
}

interface ReferenceGroup {
  name: string
  path: string
  description: string
  items: ReferenceItem[]
}

const CLAUDE_ROOT = join(homedir(), '.claude')

const NOISE_DIRS = new Set([
  'cache', 'backups', 'chrome', 'daemon', 'debug', 'file-history',
  'image-cache', 'jobs', 'paste-cache', 'projects', 'sessions',
  'shell-snapshots', 'statsig', 'tasks', 'teams', 'telemetry', 'todos',
  'ide', 'security', 'session-env', 'vercel-plugin-device-id',
  'vercel-plugin-telemetry-preference', 'stats-cache', 'get-shit-done',
  'node_modules', '.git',
])

function shortenPath(p: string): string {
  return p.replace(homedir(), '~')
}

function firstLine(text: string): string {
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('#')) continue
    if (line.startsWith('---')) continue
    if (line.startsWith('<!--')) continue
    return line.replace(/^[-*+]\s+/, '').replace(/[*_`]/g, '').slice(0, 600)
  }
  return ''
}

function readFrontmatterDescription(content: string): string {
  const m = content.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return ''
  const line = m[1].split('\n').find(l => l.trim().startsWith('description:'))
  if (!line) return ''
  return line.replace(/^\s*description:\s*"?/, '').replace(/"?\s*$/, '').trim().slice(0, 600)
}

function describeMarkdown(path: string): string {
  try {
    const content = readFileSync(path, 'utf8')
    const fm = readFrontmatterDescription(content)
    if (fm) return fm
    const body = content.replace(/^---\n[\s\S]*?\n---\n?/, '')
    return firstLine(body)
  } catch {
    return ''
  }
}

function describeFile(path: string): string {
  if (path.endsWith('.md')) return describeMarkdown(path)
  const name = basename(path)
  switch (name) {
    case 'settings.json': return 'Global Claude Code settings (permissions, env, hooks)'
    case 'settings.local.json': return 'Local settings overrides (not synced)'
    case 'mcp.json': return 'MCP server config (note: real config lives in ~/.claude.json)'
    case 'statusline.sh': return 'Status line script shown at bottom of Claude Code'
    case 'pdf-style.css': return 'CSS for PDF export styling'
    case 'preferences.md': return 'User preferences'
    default:
      if (name.endsWith('.js') || name.endsWith('.mjs')) return 'Hook script'
      if (name.endsWith('.sh')) return 'Shell script'
      if (name.endsWith('.json')) return 'JSON config'
      return ''
  }
}

function listMarkdownFiles(dir: string, recursive = false): ReferenceItem[] {
  if (!existsSync(dir)) return []
  const items: ReferenceItem[] = []
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (recursive && !NOISE_DIRS.has(entry.name)) {
          items.push(...listMarkdownFiles(full, true))
        }
        continue
      }
      if (!entry.name.endsWith('.md')) continue
      items.push({
        name: relative(dir, full),
        path: shortenPath(full),
        description: describeMarkdown(full),
        kind: 'file',
      })
    }
  } catch { /* skip */ }
  return items.sort((a, b) => a.name.localeCompare(b.name))
}

function listFilesByExt(dir: string, exts: string[]): ReferenceItem[] {
  if (!existsSync(dir)) return []
  const items: ReferenceItem[] = []
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile()) continue
      if (!exts.some(e => entry.name.endsWith(e))) continue
      const full = join(dir, entry.name)
      items.push({
        name: entry.name,
        path: shortenPath(full),
        description: describeFile(full),
        kind: 'file',
      })
    }
  } catch { /* skip */ }
  return items.sort((a, b) => a.name.localeCompare(b.name))
}

function listSkillDirs(dir: string): ReferenceItem[] {
  if (!existsSync(dir)) return []
  const items: ReferenceItem[] = []
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const skillMd = join(dir, entry.name, 'SKILL.md')
      const skillMdLower = join(dir, entry.name, 'skill.md')
      const md = existsSync(skillMd) ? skillMd : existsSync(skillMdLower) ? skillMdLower : null
      if (!md) continue
      items.push({
        name: entry.name,
        path: shortenPath(join(dir, entry.name)),
        description: describeMarkdown(md),
        kind: 'dir',
      })
    }
  } catch { /* skip */ }
  return items.sort((a, b) => a.name.localeCompare(b.name))
}

function listCommandDirs(dir: string): ReferenceItem[] {
  if (!existsSync(dir)) return []
  const items: ReferenceItem[] = []
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isFile() && entry.name.endsWith('.md')) {
        items.push({
          name: entry.name,
          path: shortenPath(full),
          description: describeMarkdown(full),
          kind: 'file',
        })
      } else if (entry.isDirectory() && !NOISE_DIRS.has(entry.name)) {
        const nested = listMarkdownFiles(full, true)
        items.push({
          name: entry.name + '/',
          path: shortenPath(full),
          description: `${nested.length} command${nested.length === 1 ? '' : 's'}`,
          kind: 'dir',
        })
      }
    }
  } catch { /* skip */ }
  return items.sort((a, b) => a.name.localeCompare(b.name))
}

function listRootConfigs(): ReferenceItem[] {
  const items: ReferenceItem[] = []
  const candidates = [
    'CLAUDE.md', 'settings.json', 'settings.local.json', 'mcp.json',
    'preferences.md', 'statusline.sh', 'pdf-style.css',
  ]
  for (const name of candidates) {
    const full = join(CLAUDE_ROOT, name)
    if (!existsSync(full)) continue
    items.push({
      name,
      path: shortenPath(full),
      description: describeFile(full),
      kind: 'file',
    })
  }
  return items
}

function listPluginsSummary(): ReferenceItem[] {
  const pluginsFile = join(CLAUDE_ROOT, 'plugins', 'installed_plugins.json')
  if (!existsSync(pluginsFile)) return []
  try {
    const data = JSON.parse(readFileSync(pluginsFile, 'utf8'))
    const items: ReferenceItem[] = []
    for (const [marketplace, plugins] of Object.entries<Record<string, unknown>>(data)) {
      for (const pluginName of Object.keys(plugins)) {
        const [name] = pluginName.split('@')
        items.push({
          name,
          path: `~/.claude/plugins/cache/${marketplace}/${name}`,
          description: `Installed from ${marketplace}`,
          kind: 'dir',
        })
      }
    }
    return items.sort((a, b) => a.name.localeCompare(b.name))
  } catch {
    return []
  }
}

function buildReference(): ReferenceGroup[] {
  return [
    {
      name: 'Root configs',
      path: shortenPath(CLAUDE_ROOT),
      description: 'Top-level Claude Code config and entry point files',
      items: listRootConfigs(),
    },
    {
      name: 'Rules',
      path: shortenPath(join(CLAUDE_ROOT, 'rules')),
      description: 'Global instruction files imported by CLAUDE.md',
      items: listMarkdownFiles(join(CLAUDE_ROOT, 'rules'), true),
    },
    {
      name: 'Agents',
      path: shortenPath(join(CLAUDE_ROOT, 'agents')),
      description: 'Custom subagents available via the Task tool',
      items: listMarkdownFiles(join(CLAUDE_ROOT, 'agents'), false),
    },
    {
      name: 'Skills',
      path: shortenPath(join(CLAUDE_ROOT, 'skills')),
      description: 'User-authored skills (each is a folder with SKILL.md)',
      items: listSkillDirs(join(CLAUDE_ROOT, 'skills')),
    },
    {
      name: 'Commands',
      path: shortenPath(join(CLAUDE_ROOT, 'commands')),
      description: 'Custom slash commands',
      items: listCommandDirs(join(CLAUDE_ROOT, 'commands')),
    },
    {
      name: 'Hooks',
      path: shortenPath(join(CLAUDE_ROOT, 'hooks')),
      description: 'Hook scripts that run on Claude Code events',
      items: listFilesByExt(join(CLAUDE_ROOT, 'hooks'), ['.js', '.mjs', '.sh']),
    },
    {
      name: 'Memory',
      path: shortenPath(join(CLAUDE_ROOT, 'memory')),
      description: 'Auto-memory files (also lives per-project under ~/.claude/projects/*/memory/)',
      items: listMarkdownFiles(join(CLAUDE_ROOT, 'memory'), false),
    },
    {
      name: 'Plugins',
      path: shortenPath(join(CLAUDE_ROOT, 'plugins')),
      description: 'Installed plugin packages (managed by Claude Code)',
      items: listPluginsSummary(),
    },
  ].filter(g => g.items.length > 0)
}

function main() {
  const scriptDir = new URL('.', import.meta.url).pathname
  const dataFile = join(scriptDir, '..', 'config', 'data.json')
  const data = JSON.parse(readFileSync(dataFile, 'utf8'))

  const reference = {
    synced_at: new Date().toISOString(),
    root: shortenPath(CLAUDE_ROOT),
    groups: buildReference(),
  }

  data.reference = reference
  writeFileSync(dataFile, JSON.stringify(data, null, 2) + '\n')

  console.log(`Synced reference inventory:`)
  for (const g of reference.groups) {
    console.log(`  ${g.name}: ${g.items.length}`)
  }
}

main()
