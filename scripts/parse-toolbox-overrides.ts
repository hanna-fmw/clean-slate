import { readFileSync, existsSync } from 'fs'
import { z } from 'zod'

const ToolboxTypeSchema = z.enum(['skill', 'agent', 'plugin', 'mcp'])

export const PinnedSchema = z.object({
  name: z.string(),
  type: ToolboxTypeSchema,
})

export const OverridesSchema = z.object({
  pinned: z.array(PinnedSchema),
  one_liners: z.record(z.string(), z.string()),
  category_map: z.record(z.string(), z.string()),
  defaults: z.record(z.string(), z.string()),
})

export type Overrides = z.infer<typeof OverridesSchema>

export function parseOverrides(markdown: string): Overrides {
  const sections = splitH2(markdown)
  return OverridesSchema.parse({
    pinned: parsePinned(sections['pinned'] ?? ''),
    one_liners: parseKeyValue(sections['one-liners'] ?? sections['one liners'] ?? ''),
    category_map: parseArrowMap(sections['category map'] ?? ''),
    defaults: parseKeyValue(sections['defaults'] ?? ''),
  })
}

export function loadOverrides(path: string): Overrides {
  if (!existsSync(path)) {
    return { pinned: [], one_liners: {}, category_map: {}, defaults: {} }
  }
  const content = readFileSync(path, 'utf-8')
  return parseOverrides(content)
}

function splitH2(markdown: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const lines = markdown.split('\n')
  let key = ''
  let buf: string[] = []
  for (const line of lines) {
    const m = line.match(/^##\s+(.+)$/)
    if (m) {
      if (key) sections[key] = buf.join('\n').trim()
      key = m[1].toLowerCase().trim()
      buf = []
    } else if (key) {
      buf.push(line)
    }
  }
  if (key) sections[key] = buf.join('\n').trim()
  return sections
}

function parsePinned(text: string): Array<z.infer<typeof PinnedSchema>> {
  const result: Array<z.infer<typeof PinnedSchema>> = []
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line.startsWith('- ') && !line.startsWith('* ')) continue
    const body = line.replace(/^[-*]\s+/, '')
    // Format: "name (type)" or "name: type"
    const parenMatch = body.match(/^(.+?)\s*\(([a-z]+)\)\s*$/i)
    const colonMatch = body.match(/^(.+?):\s*([a-z]+)\s*$/i)
    const match = parenMatch ?? colonMatch
    if (!match) continue
    const name = stripFormatting(match[1].trim())
    const typeRaw = match[2].toLowerCase()
    const type = typeRaw === 'mcp server' || typeRaw === 'server' ? 'mcp' : typeRaw
    const parsed = ToolboxTypeSchema.safeParse(type)
    if (parsed.success) result.push({ name, type: parsed.data })
  }
  return result
}

function parseKeyValue(text: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line.startsWith('- ') && !line.startsWith('* ')) continue
    const body = line.replace(/^[-*]\s+/, '')
    const idx = body.indexOf(':')
    if (idx < 1) continue
    const key = stripFormatting(body.slice(0, idx).trim())
    const value = body.slice(idx + 1).trim()
    if (key && value) result[key] = value
  }
  return result
}

function parseArrowMap(text: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line.startsWith('- ') && !line.startsWith('* ')) continue
    const body = line.replace(/^[-*]\s+/, '')
    const parts = body.split(/\s*(?:→|->)\s*/)
    if (parts.length !== 2) continue
    const from = stripFormatting(parts[0].trim())
    const to = stripFormatting(parts[1].trim())
    if (from && to) result[from] = to
  }
  return result
}

function stripFormatting(text: string): string {
  return text.replace(/^`([^`]+)`$/, '$1').replace(/^\*\*([^*]+)\*\*$/, '$1').trim()
}
