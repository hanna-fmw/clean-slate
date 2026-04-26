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

  return {
    name, description, description_short, stack, hosting, database,
    github, run_commands, services, notes,
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
