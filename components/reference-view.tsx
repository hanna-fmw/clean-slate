'use client'

import { useMemo, useState } from 'react'
import type { ReferenceInventory, ReferenceGroup } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ReferenceViewProps {
  reference: ReferenceInventory | undefined
}

export function ReferenceView({ reference }: ReferenceViewProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!reference) return []
    const q = query.trim().toLowerCase()
    if (!q) return reference.groups
    return reference.groups
      .map(g => ({
        ...g,
        items: g.items.filter(
          item =>
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.path.toLowerCase().includes(q),
        ),
      }))
      .filter(g => g.items.length > 0)
  }, [reference, query])

  if (!reference) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No reference inventory yet. Run: <code className="font-mono">pnpm sync:reference</code>
      </p>
    )
  }

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
            <ReferenceGroupCard key={group.name} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReferenceGroupCard({ group }: { group: ReferenceGroup }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-0.5">
          <CardTitle className="text-sm flex items-center gap-2">
            {group.name}
            <Badge variant="outline" className="text-[10px] font-mono">
              {group.items.length}
            </Badge>
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">{group.description}</p>
          <p className="text-[10px] font-mono text-muted-foreground/60">{group.path}</p>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1.5">
          {group.items.map(item => (
            <li
              key={item.path}
              className="grid grid-cols-[minmax(0,1fr)_2fr] gap-3 text-[12px] py-1 border-b border-[var(--border)]/40 last:border-0"
            >
              <div className="min-w-0">
                <div className="font-mono break-all">
                  {item.kind === 'dir' ? `${item.name.replace(/\/$/, '')}/` : item.name}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground/60 break-all">
                  {item.path}
                </div>
              </div>
              <div className="text-muted-foreground text-[11px] leading-snug whitespace-pre-wrap break-words">
                {item.description || <span className="text-muted-foreground/40 italic">no description</span>}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
