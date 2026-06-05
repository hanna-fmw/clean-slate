import type { Section } from '@/components/sidebar'
import type {
  Project,
  Service,
  ToolsInventory,
  ToolboxEntry,
  ReferenceInventory,
} from './types'

export interface SearchHit {
  section: Section
  kind: string
  title: string
  subtitle: string
  haystack: string
}

export function buildIndex(input: {
  projects: Project[]
  services: Service[]
  tools: ToolsInventory | undefined
  toolbox: ToolboxEntry[] | undefined
  reference: ReferenceInventory | undefined
}): SearchHit[] {
  const hits: SearchHit[] = []

  for (const p of input.projects) {
    hits.push({
      section: 'projects',
      kind: 'Project',
      title: p.name,
      subtitle: p.description_short || p.hosting || p.path,
      haystack: [
        p.name,
        p.description_short,
        p.description,
        p.hosting,
        p.database,
        p.notes,
        p.path,
        p.deployed_url,
        p.chrome_profile,
        p.stack.join(' '),
        p.services.join(' '),
        Object.keys(p.run_commands).join(' '),
      ].filter(Boolean).join(' ').toLowerCase(),
    })
  }

  for (const s of input.services) {
    hits.push({
      section: 'services',
      kind: 'Service',
      title: s.name,
      subtitle: s.category,
      haystack: [
        s.name,
        s.category,
        s.url,
        s.notes,
        s.accounts.map(a => [a.alias, a.email, a.use_for, a.chrome_profile].filter(Boolean).join(' ')).join(' '),
      ].filter(Boolean).join(' ').toLowerCase(),
    })
  }

  if (input.tools) {
    for (const a of input.tools.agents) {
      hits.push({
        section: 'tools',
        kind: 'Agent',
        title: a.name,
        subtitle: a.description || a.category,
        haystack: [a.name, a.description, a.category].filter(Boolean).join(' ').toLowerCase(),
      })
    }
    for (const p of input.tools.plugins) {
      hits.push({
        section: 'tools',
        kind: 'Plugin',
        title: p.name,
        subtitle: p.marketplace,
        haystack: [p.name, p.marketplace].filter(Boolean).join(' ').toLowerCase(),
      })
    }
    for (const m of input.tools.mcp_servers) {
      hits.push({
        section: 'tools',
        kind: 'MCP Server',
        title: m.name,
        subtitle: m.transport,
        haystack: [m.name, m.notes, m.transport].filter(Boolean).join(' ').toLowerCase(),
      })
    }
    for (const sk of input.tools.skills) {
      hits.push({
        section: 'tools',
        kind: 'Skill',
        title: sk.name,
        subtitle: sk.description || sk.plugin,
        haystack: [sk.name, sk.description, sk.plugin].filter(Boolean).join(' ').toLowerCase(),
      })
    }
  }

  if (input.toolbox) {
    for (const e of input.toolbox) {
      hits.push({
        section: 'toolbox',
        kind: `Toolbox: ${e.type}`,
        title: e.name,
        subtitle: e.one_liner || e.category,
        haystack: [e.name, e.one_liner, e.category, e.type].filter(Boolean).join(' ').toLowerCase(),
      })
    }
  }

  if (input.reference) {
    for (const g of input.reference.groups) {
      for (const item of g.items) {
        hits.push({
          section: 'reference',
          kind: g.name,
          title: item.name,
          subtitle: item.description || item.path,
          haystack: [item.name, item.path, item.description, g.name].filter(Boolean).join(' ').toLowerCase(),
        })
      }
    }
  }

  return hits
}

export function searchIndex(hits: SearchHit[], query: string, limit = 30): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const terms = q.split(/\s+/).filter(Boolean)
  const matches = hits.filter(h => terms.every(t => h.haystack.includes(t)))
  return matches.slice(0, limit)
}
