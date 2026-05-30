'use client'

import { useMemo, useState } from 'react'
import type { ToolboxEntry, ToolboxType } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

const TYPE_LABEL: Record<ToolboxType, string> = {
  skill: 'skill',
  agent: 'agent',
  plugin: 'plugin',
  mcp: 'mcp',
}

const TYPE_COLORS: Record<ToolboxType, string> = {
  skill: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  agent: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  plugin: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  mcp: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
}

const ORIGIN_COLORS: Record<string, string> = {
  anthropic: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  '3rd-party': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  custom: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  unknown: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
}

interface Props {
  toolbox: ToolboxEntry[]
}

type TypeFilter = ToolboxType | 'all'

export function ToolboxView({ toolbox }: Props) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return toolbox.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (!q) return true
      return (
        t.name.toLowerCase().includes(q) ||
        t.one_liner.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      )
    })
  }, [toolbox, query, typeFilter])

  const grouped = useMemo(() => {
    const groups = new Map<string, ToolboxEntry[]>()
    for (const entry of filtered) {
      const list = groups.get(entry.category) ?? []
      list.push(entry)
      groups.set(entry.category, list)
    }
    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === 'Uncategorized') return 1
      if (b === 'Uncategorized') return -1
      return a.localeCompare(b)
    })
  }, [filtered])

  const isOpen = (cat: string) => openCategories[cat] ?? true

  if (toolbox.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No toolbox entries yet. Add a &quot;Skills, Agents &amp; Plugins&quot; section to your project CLEAN-SLATE.md files, then run <code className="font-mono text-xs">pnpm sync:all</code>.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or description..."
          className="flex-1 px-3 py-1.5 text-sm bg-transparent border border-[var(--border)] rounded-[var(--card-radius)] focus:outline-none focus:border-[var(--foreground)]/30 font-mono"
        />
        <div className="flex gap-1 flex-wrap">
          {(['all', 'skill', 'agent', 'plugin', 'mcp'] as TypeFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-[var(--card-radius)] border transition-colors cursor-pointer ${
                typeFilter === t
                  ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]'
                  : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {grouped.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">No matches.</p>
      )}

      <div className="space-y-3">
        {grouped.map(([category, entries]) => (
          <section key={category} className="border border-[var(--border)] rounded-[var(--card-radius)] overflow-hidden">
            <button
              onClick={() => setOpenCategories((s) => ({ ...s, [category]: !isOpen(category) }))}
              className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-[var(--hover)] transition-colors cursor-pointer"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`shrink-0 text-[var(--muted)] transition-transform ${isOpen(category) ? 'rotate-90' : ''}`}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span className="text-[13px] font-medium">{category}</span>
              <span className="text-[11px] text-[var(--muted)] font-mono ml-1">{entries.length}</span>
            </button>
            {isOpen(category) && (
              <div className="border-t border-[var(--border)]">
                {entries.map((entry) => (
                  <ToolboxRow key={`${entry.type}-${entry.name}`} entry={entry} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

function ToolboxRow({ entry }: { entry: ToolboxEntry }) {
  return (
    <div className="px-3 py-2.5 border-b border-[var(--border)] last:border-b-0 flex flex-col sm:flex-row sm:items-start gap-2 hover:bg-[var(--hover)] transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[13px] font-medium truncate">{entry.name}</span>
          <Badge variant="outline" className={`text-[10px] font-mono ${TYPE_COLORS[entry.type]}`}>
            {TYPE_LABEL[entry.type]}
          </Badge>
          {entry.pinned && (
            <Badge variant="outline" className="text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
              pinned
            </Badge>
          )}
          {!entry.installed && (
            <Badge variant="outline" className="text-[10px] font-mono bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20">
              not installed
            </Badge>
          )}
        </div>
        {entry.one_liner && (
          <p className="text-[12px] text-[var(--muted)] mt-1 line-clamp-2">{entry.one_liner}</p>
        )}
        {entry.projects.length > 0 && (
          <p className="text-[10px] text-[var(--muted)]/70 font-mono mt-1">
            used in: {entry.projects.join(', ')}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className={`text-[10px] font-mono ${ORIGIN_COLORS[entry.origin]}`}>
          {entry.origin}
        </Badge>
        <span className="text-[10px] font-mono text-[var(--muted)] tabular-nums">
          {entry.usage_count}×
        </span>
      </div>
    </div>
  )
}
