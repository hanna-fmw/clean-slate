import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { z } from 'zod'
import { loadOverrides, type Overrides } from './parse-toolbox-overrides'
import type {
  DashboardData,
  Project,
  ToolboxEntry,
  ToolboxType,
  ToolsInventory,
  ToolSource,
} from '../lib/types'

const DATA_PATH = join(__dirname, '..', 'config', 'data.json')
const OVERRIDES_PATH = join(homedir(), 'Documents', 'clean-slate', 'toolbox-overrides.md')

const ToolboxEntrySchema = z.object({
  name: z.string(),
  type: z.enum(['skill', 'agent', 'plugin', 'mcp']),
  category: z.string(),
  usage_count: z.number().int().nonnegative(),
  projects: z.array(z.string()),
  origin: z.enum(['anthropic', '3rd-party', 'custom', 'unknown']),
  one_liner: z.string(),
  pinned: z.boolean(),
  installed: z.boolean(),
})

type InventoryLookup = Map<string, { origin: ToolSource | 'unknown'; description: string }>

function indexInventory(tools: ToolsInventory | undefined): Record<ToolboxType, InventoryLookup> {
  const lookups: Record<ToolboxType, InventoryLookup> = {
    skill: new Map(),
    agent: new Map(),
    plugin: new Map(),
    mcp: new Map(),
  }
  if (!tools) return lookups

  for (const s of tools.skills) {
    lookups.skill.set(normalizeName(s.name), {
      origin: s.origin.source,
      description: s.description,
    })
  }
  for (const a of tools.agents) {
    lookups.agent.set(normalizeName(a.name), {
      origin: a.origin.source,
      description: a.description,
    })
  }
  for (const p of tools.plugins) {
    lookups.plugin.set(normalizeName(p.name), {
      origin: p.origin.source,
      description: '',
    })
  }
  for (const m of tools.mcp_servers) {
    lookups.mcp.set(normalizeName(m.name), {
      origin: m.origin.source,
      description: m.notes,
    })
  }
  return lookups
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase()
}

function canonicalCategory(raw: string | null, map: Record<string, string>): string {
  if (!raw) return 'Uncategorized'
  if (map[raw]) return map[raw]
  const lower = raw.toLowerCase()
  for (const [from, to] of Object.entries(map)) {
    if (from.toLowerCase() === lower) return to
  }
  return raw
}

interface Accumulator {
  name: string
  type: ToolboxType
  categories: Map<string, number>
  projects: Set<string>
}

function key(name: string, type: ToolboxType): string {
  return `${type}::${normalizeName(name)}`
}

function pickCategory(categories: Map<string, number>): string {
  if (categories.size === 0) return 'Uncategorized'
  let best = 'Uncategorized'
  let bestCount = -1
  for (const [cat, count] of categories) {
    if (count > bestCount || (count === bestCount && cat !== 'Uncategorized' && best === 'Uncategorized')) {
      best = cat
      bestCount = count
    }
  }
  return best
}

function aggregate(projects: Project[], tools: ToolsInventory | undefined, overrides: Overrides): ToolboxEntry[] {
  const inventory = indexInventory(tools)
  const acc = new Map<string, Accumulator>()

  for (const project of projects) {
    for (const mention of project.toolbox_mentions) {
      const k = key(mention.name, mention.type)
      const existing = acc.get(k) ?? {
        name: mention.name,
        type: mention.type,
        categories: new Map<string, number>(),
        projects: new Set<string>(),
      }
      const cat = canonicalCategory(mention.category, overrides.category_map)
      existing.categories.set(cat, (existing.categories.get(cat) ?? 0) + 1)
      existing.projects.add(project.name)
      acc.set(k, existing)
    }
  }

  // Add pinned entries that aren't mentioned anywhere
  for (const p of overrides.pinned) {
    const k = key(p.name, p.type)
    if (!acc.has(k)) {
      acc.set(k, {
        name: p.name,
        type: p.type,
        categories: new Map(),
        projects: new Set(),
      })
    }
  }

  const pinnedKeys = new Set(overrides.pinned.map(p => key(p.name, p.type)))

  const entries: ToolboxEntry[] = []
  for (const [k, a] of acc) {
    const lookup = inventory[a.type].get(normalizeName(a.name))
    const oneLinerOverride = overrides.one_liners[a.name]
    const defaultCategory = overrides.defaults[a.name]
    let category = pickCategory(a.categories)
    if (category === 'Uncategorized' && defaultCategory) {
      category = canonicalCategory(defaultCategory, overrides.category_map)
    }

    entries.push({
      name: a.name,
      type: a.type,
      category,
      usage_count: a.projects.size,
      projects: Array.from(a.projects).sort(),
      origin: lookup?.origin ?? 'unknown',
      one_liner: oneLinerOverride ?? (lookup?.description ?? ''),
      pinned: pinnedKeys.has(k),
      installed: !!lookup,
    })
  }

  // Sort: pinned desc, then usage_count desc, then name asc
  entries.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    if (a.usage_count !== b.usage_count) return b.usage_count - a.usage_count
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  })

  return z.array(ToolboxEntrySchema).parse(entries)
}

function main() {
  if (!existsSync(DATA_PATH)) {
    console.error(`No data.json at ${DATA_PATH} — run sync first.`)
    process.exit(1)
  }
  const data: DashboardData = JSON.parse(readFileSync(DATA_PATH, 'utf-8'))
  const overrides = loadOverrides(OVERRIDES_PATH)
  const toolbox = aggregate(data.projects, data.tools, overrides)
  data.toolbox = toolbox
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n')

  const installed = toolbox.filter(t => t.installed).length
  const pinned = toolbox.filter(t => t.pinned).length
  console.log(`Built toolbox: ${toolbox.length} entries (${installed} installed, ${pinned} pinned)`)
}

main()
