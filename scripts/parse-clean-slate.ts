type ToolboxType = 'skill' | 'agent' | 'plugin' | 'mcp'

interface ToolboxMention {
  type: ToolboxType
  category: string | null
  name: string
}

interface ParsedProject {
  name: string
  description: string
  description_short: string
  stack: string[]
  hosting: string
  database: string
  github: { account: string; ssh_alias: string; repo_url: string }
  run_commands: Record<string, string>
  services: string[]
  notes: string
  toolbox_mentions: ToolboxMention[]
}

export function parseCleanSlate(markdown: string): ParsedProject {
  const sections = splitSections(markdown)

  const name = extractH1(markdown)
  const description = stripBold(sections['description'] ?? '').trim()
  const description_short = extractFirstSentence(description)
  const stack = parseCommaSeparated(sections['stack'] ?? '')
  const hosting = extractHosting(sections['hosting'] ?? '')
  const database = extractDatabase(sections['hosting'] ?? '')
  const github = parseGitHub(sections['github'] ?? '')
  const run_commands = parseRunCommands(sections['run commands'] ?? '')
  const services = parseCommaSeparated(sections['services'] ?? '')
  const notes = (sections['notes'] ?? '').trim()
  const toolbox_mentions = parseToolboxSection(findToolboxSection(sections))

  return {
    name, description, description_short, stack, hosting, database,
    github, run_commands, services, notes, toolbox_mentions,
  }
}

function splitSections(markdown: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const lines = markdown.split('\n')
  let currentKey = ''
  let currentContent: string[] = []

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/)
    if (h2Match) {
      if (currentKey) {
        sections[currentKey] = currentContent.join('\n').trim()
      }
      currentKey = h2Match[1].toLowerCase()
      currentContent = []
    } else if (currentKey) {
      currentContent.push(line)
    }
  }
  if (currentKey) {
    sections[currentKey] = currentContent.join('\n').trim()
  }
  return sections
}

function extractH1(markdown: string): string {
  const match = markdown.match(/^# (.+)$/m)
  return match ? match[1].trim() : ''
}

function stripBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1')
}

function extractFirstSentence(text: string): string {
  const match = text.match(/^(.+?\.)\s/)
  return match ? match[1] : text.split('\n')[0]
}

function parseCommaSeparated(text: string): string[] {
  if (!text.trim()) return []
  return text.trim().split(',').map(s => s.trim()).filter(Boolean)
}

function extractHosting(text: string): string {
  const lines = text.split('\n').filter(l => !l.toLowerCase().startsWith('database:'))
  return lines.join('\n').trim()
}

function extractDatabase(text: string): string {
  const dbLine = text.split('\n').find(l => l.toLowerCase().startsWith('database:'))
  return dbLine ? dbLine.replace(/^database:\s*/i, '').trim() : ''
}

function parseGitHub(text: string): { account: string; ssh_alias: string; repo_url: string } {
  const result = { account: '', ssh_alias: '', repo_url: '' }
  for (const line of text.split('\n')) {
    const lower = line.toLowerCase()
    if (lower.startsWith('account:')) result.account = line.replace(/^account:\s*/i, '').trim()
    else if (lower.startsWith('ssh alias:')) result.ssh_alias = line.replace(/^ssh alias:\s*/i, '').trim()
    else if (lower.startsWith('repo:')) result.repo_url = line.replace(/^repo:\s*/i, '').trim()
  }
  return result
}

function findToolboxSection(sections: Record<string, string>): string {
  const candidates = [
    'skills, agents & plugins',
    'skills, agents and plugins',
    'skills agents plugins',
    'skills, agents & plugins & mcp servers',
    'skills, agents, plugins & mcp servers',
    'skills, agents, plugins and mcp servers',
    'tools',
    'toolbox',
  ]
  for (const key of Object.keys(sections)) {
    const lower = key.toLowerCase()
    if (candidates.includes(lower)) return sections[key]
    if (lower.startsWith('skills') && (lower.includes('agent') || lower.includes('plugin'))) {
      return sections[key]
    }
  }
  return ''
}

const TYPE_MAP: Record<string, ToolboxType> = {
  'skill': 'skill',
  'skills': 'skill',
  'agent': 'agent',
  'agents': 'agent',
  'plugin': 'plugin',
  'plugins': 'plugin',
  'mcp': 'mcp',
  'mcp server': 'mcp',
  'mcp servers': 'mcp',
}

function classifyType(heading: string): ToolboxType | null {
  const normalized = heading.trim().toLowerCase().replace(/[^a-z ]/g, '').trim()
  if (TYPE_MAP[normalized]) return TYPE_MAP[normalized]
  for (const [key, value] of Object.entries(TYPE_MAP)) {
    if (normalized === key || normalized.startsWith(key + ' ') || normalized.endsWith(' ' + key)) {
      return value
    }
  }
  return null
}

function extractToolName(bullet: string): string {
  // Strip leading "- " or "* ", then take text before first " - " or " — " or ":"
  let text = bullet.replace(/^[-*]\s+/, '').trim()
  // Inline code: `name` -> name
  const codeMatch = text.match(/^`([^`]+)`/)
  if (codeMatch) return stripSlashCommand(codeMatch[1].trim())
  // Bold: **name** -> name
  const boldMatch = text.match(/^\*\*([^*]+)\*\*/)
  if (boldMatch) return stripSlashCommand(boldMatch[1].trim())
  // Plain text before separator
  text = text.split(/\s+[-—:]\s+/)[0]
  return stripSlashCommand(text.trim())
}

function stripSlashCommand(name: string): string {
  return name.replace(/^\//, '').trim()
}

function parseToolboxSection(text: string): ToolboxMention[] {
  if (!text.trim()) return []
  const mentions: ToolboxMention[] = []
  const lines = text.split('\n')
  let currentType: ToolboxType | null = null
  let currentCategory: string | null = null

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    const h3 = line.match(/^###\s+(.+)$/)
    if (h3) {
      const t = classifyType(h3[1])
      if (t) {
        currentType = t
        currentCategory = null
      }
      continue
    }
    const h4 = line.match(/^####\s+(.+)$/)
    if (h4) {
      currentCategory = h4[1].trim()
      continue
    }
    const bullet = line.match(/^\s*[-*]\s+/)
    if (bullet && currentType) {
      const name = extractToolName(line.trimStart())
      if (name) {
        mentions.push({ type: currentType, category: currentCategory, name })
      }
    }
  }
  return mentions
}

function parseRunCommands(text: string): Record<string, string> {
  const commands: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const match = line.match(/^-\s+`(.+?)`\s*[-:]\s*(.+)$/)
    if (match) {
      commands[match[1]] = match[2].trim()
    }
  }
  return commands
}
