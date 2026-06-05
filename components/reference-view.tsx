'use client'

import { useMemo, useState } from 'react'
import type {
  ReferenceInventory,
  ReferenceGroup,
  ReferenceSubdir,
} from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ReferenceViewProps {
  reference: ReferenceInventory | undefined
}

function matchesQuery(text: string, q: string) {
  return text.toLowerCase().includes(q)
}

export function ReferenceView({ reference }: ReferenceViewProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!reference) return []
    const q = query.trim().toLowerCase()
    if (!q) return reference.groups
    return reference.groups
      .map(g => {
        const items = g.items.filter(
          item =>
            matchesQuery(item.name, q) ||
            matchesQuery(item.description, q) ||
            matchesQuery(item.path, q),
        )
        const subdirs = g.subdirs
          .map(sd => ({
            ...sd,
            items: sd.items.filter(
              item =>
                matchesQuery(item.name, q) ||
                matchesQuery(item.description, q) ||
                matchesQuery(item.path, q) ||
                matchesQuery(sd.name, q),
            ),
          }))
          .filter(sd => sd.items.length > 0)
        return { ...g, items, subdirs }
      })
      .filter(g => g.items.length > 0 || g.subdirs.length > 0)
  }, [reference, query])

  if (!reference) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No reference inventory yet. Run: <code className="font-mono">pnpm sync:reference</code>
      </p>
    )
  }

  const forceOpen = query.trim().length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          Filesystem map of <span className="font-mono">{reference.root}</span> - every file that shapes how Claude Code behaves on this machine.
        </p>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Filter by name, description, or path..."
          className="w-full max-w-md px-3 py-1.5 text-xs font-mono bg-[var(--card-bg)] border border-[var(--border)] rounded-[var(--card-radius)] focus:outline-none focus:border-[var(--foreground)]/40"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4">No matches for &quot;{query}&quot;.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(group => (
            <ReferenceGroupCard key={group.name} group={group} forceOpen={forceOpen} />
          ))}
        </div>
      )}
    </div>
  )
}

function totalCount(group: ReferenceGroup) {
  return group.items.length + group.subdirs.reduce((sum, sd) => sum + sd.items.length, 0)
}

function ReferenceGroupCard({ group, forceOpen }: { group: ReferenceGroup; forceOpen: boolean }) {
  const [open, setOpen] = useState(true)
  const isOpen = forceOpen || open
  return (
    <Card>
      <CardHeader
        onClick={() => setOpen(o => !o)}
        className="cursor-pointer hover:bg-[var(--hover)]/40 transition-colors rounded-t-xl"
      >
        <div className="flex flex-col gap-0.5">
          <CardTitle className="text-sm flex items-center gap-2">
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            {group.name}
            <Badge variant="outline" className="text-[10px] font-mono">
              {totalCount(group)}
            </Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground pl-[18px]">{group.description}</p>
          <p className="text-[11px] font-mono text-muted-foreground/60 pl-[18px]">{group.path}</p>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent>
          {group.items.length > 0 && <ItemList items={group.items} />}
          {group.subdirs.length > 0 && (
            <div className={group.items.length > 0 ? 'mt-2' : ''}>
              {group.subdirs.map(sd => (
                <SubdirSection key={sd.path} subdir={sd} forceOpen={forceOpen} />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

function SubdirSection({ subdir, forceOpen }: { subdir: ReferenceSubdir; forceOpen: boolean }) {
  const [open, setOpen] = useState(false)
  const isOpen = forceOpen || open
  return (
    <div className="border-t border-[var(--border)]/40 first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 py-1.5 hover:bg-[var(--hover)]/50 transition-colors cursor-pointer text-left rounded-sm"
      >
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="font-mono text-sm font-medium">{subdir.name}/</span>
        <Badge variant="outline" className="text-[10px] font-mono ml-1">
          {subdir.items.length}
        </Badge>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground/60 truncate">
          {subdir.path}
        </span>
      </button>
      {isOpen && (
        <div className="pl-5 ml-1.5 border-l border-[var(--border)]/60 pb-2">
          <ItemList items={subdir.items} />
        </div>
      )}
    </div>
  )
}

function ItemList({ items }: { items: ReferenceGroup['items'] }) {
  return (
    <ul className="space-y-1.5">
      {items.map(item => (
        <li
          key={item.path}
          className="grid grid-cols-[minmax(0,1fr)_2fr] gap-3 py-1.5 border-b border-[var(--border)]/40 last:border-0"
        >
          <div className="min-w-0">
            <div className="font-mono text-sm break-all">
              {item.kind === 'dir' ? `${item.name.replace(/\/$/, '')}/` : item.name}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground/60 break-all">
              {item.path}
            </div>
          </div>
          <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap break-words">
            {item.description || <span className="text-muted-foreground/40 italic">no description</span>}
          </div>
        </li>
      ))}
    </ul>
  )
}
