'use client'

import { useState } from 'react'
import type { SyncLogEntry } from '@/lib/logs'

interface LogsViewProps {
  logs: SyncLogEntry[]
}

function formatRelative(ts: string): string {
  const date = new Date(ts)
  const diffMs = Date.now() - date.getTime()
  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  return date.toLocaleDateString()
}

function formatAbsolute(ts: string): string {
  return new Date(ts).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function LogsView({ logs }: LogsViewProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No sync history yet. The next scheduled run will start populating{' '}
        <code className="font-mono">config/sync-history.jsonl</code>.
      </p>
    )
  }

  const lastChange = logs.find(l => l.changed)
  const lastRun = logs[0]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <StatCard label="Total runs logged" value={logs.length.toString()} />
        <StatCard label="Last run" value={formatRelative(lastRun.ts)} sub={formatAbsolute(lastRun.ts)} />
        <StatCard
          label="Last change"
          value={lastChange ? formatRelative(lastChange.ts) : 'none in log'}
          sub={lastChange ? formatAbsolute(lastChange.ts) : undefined}
        />
      </div>

      <div className="border border-[var(--border)] rounded-[var(--card-radius)] overflow-hidden">
        {logs.map((entry, i) => {
          const id = `${entry.ts}-${i}`
          const isExpanded = expanded === id
          const delta = entry.added.length + entry.removed.length + entry.modified.length
          return (
            <div key={id} className="border-b border-[var(--border)] last:border-b-0">
              <button
                onClick={() => setExpanded(isExpanded ? null : id)}
                className="w-full flex items-center gap-3 py-2 px-3 text-left hover:bg-[var(--hover)] transition-colors cursor-pointer"
              >
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`shrink-0 text-[var(--muted)] transition-transform ${isExpanded ? 'rotate-90' : ''} ${!entry.changed ? 'opacity-30' : ''}`}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span className="text-xs font-mono text-[var(--muted)] shrink-0 w-44">
                  {formatAbsolute(entry.ts)}
                </span>
                <span className="text-xs text-[var(--muted)] shrink-0 w-20">
                  {formatRelative(entry.ts)}
                </span>
                <span className="text-xs flex-1 min-w-0">
                  {entry.changed ? (
                    <span className="flex gap-2.5">
                      {entry.added.length > 0 && (
                        <span className="text-emerald-500 font-mono">+{entry.added.length}</span>
                      )}
                      {entry.removed.length > 0 && (
                        <span className="text-rose-500 font-mono">-{entry.removed.length}</span>
                      )}
                      {entry.modified.length > 0 && (
                        <span className="text-amber-500 font-mono">~{entry.modified.length}</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-[var(--muted)] opacity-60">no changes</span>
                  )}
                </span>
                <span className="text-[11px] text-[var(--muted)] shrink-0">
                  {entry.total} project{entry.total === 1 ? '' : 's'}
                </span>
              </button>
              {isExpanded && delta > 0 && (
                <div className="px-3 pb-3 pt-1 pl-[60px] bg-[var(--hover)]/40 text-xs space-y-1.5">
                  {entry.added.length > 0 && <DiffList label="Added" color="emerald" items={entry.added} />}
                  {entry.removed.length > 0 && <DiffList label="Removed" color="rose" items={entry.removed} />}
                  {entry.modified.length > 0 && <DiffList label="Modified" color="amber" items={entry.modified} />}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-[var(--border)] rounded-[var(--card-radius)] p-3 bg-[var(--card-bg)]">
      <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="text-base font-medium mt-0.5">{value}</p>
      {sub && <p className="text-[11px] text-[var(--muted)] font-mono mt-0.5">{sub}</p>}
    </div>
  )
}

function DiffList({
  label,
  color,
  items,
}: {
  label: string
  color: 'emerald' | 'rose' | 'amber'
  items: string[]
}) {
  const colorClass = {
    emerald: 'text-emerald-500',
    rose: 'text-rose-500',
    amber: 'text-amber-500',
  }[color]
  return (
    <div className="flex gap-2">
      <span className={`shrink-0 font-mono w-20 ${colorClass}`}>{label}</span>
      <span className="text-[var(--foreground)] font-mono break-all">{items.join(', ')}</span>
    </div>
  )
}
