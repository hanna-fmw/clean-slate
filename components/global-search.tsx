'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Section } from './sidebar'
import { buildIndex, searchIndex, type SearchHit } from '@/lib/search-index'
import type {
  Project,
  Service,
  ToolsInventory,
  ToolboxEntry,
  ReferenceInventory,
} from '@/lib/types'

const SECTION_LABELS: Record<Section, string> = {
  projects: 'Projects',
  services: 'Services',
  tools: 'Tools',
  toolbox: 'My Toolbox',
  reference: 'Reference',
}

interface GlobalSearchProps {
  data: {
    projects: Project[]
    services: Service[]
    tools: ToolsInventory | undefined
    toolbox: ToolboxEntry[] | undefined
    reference: ReferenceInventory | undefined
  }
  onSelect: (section: Section) => void
}

export function GlobalSearch({ data, onSelect }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const index = useMemo(() => buildIndex(data), [data])
  const results = useMemo(() => searchIndex(index, query), [index, query])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [])

  const select = (hit: SearchHit) => {
    onSelect(hit.section)
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (!results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      select(results[activeIndex])
    }
  }

  const grouped = useMemo(() => {
    const map = new Map<Section, SearchHit[]>()
    for (const r of results) {
      const arr = map.get(r.section) ?? []
      arr.push(r)
      map.set(r.section, arr)
    }
    return Array.from(map.entries())
  }, [results])

  let cursor = 0
  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm">
      <div className="relative">
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder="Search everything..."
          className="w-full pl-8 pr-12 py-1.5 text-xs font-mono bg-[var(--card-bg)] border border-[var(--border)] rounded-[var(--card-radius)] focus:outline-none focus:border-[var(--foreground)]/40"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--muted)] border border-[var(--border)] rounded px-1 py-0.5 pointer-events-none">
          {typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? 'cmd K' : 'ctrl K'}
        </kbd>
      </div>

      {open && query && (
        <div className="absolute top-full right-0 mt-1.5 w-[min(28rem,calc(100vw-2rem))] max-h-[70vh] overflow-y-auto bg-[var(--card-bg)] border border-[var(--border)] rounded-[var(--card-radius)] shadow-lg z-50">
          {results.length === 0 ? (
            <div className="px-3 py-4 text-xs text-[var(--muted)] text-center">
              No matches for &quot;{query}&quot;
            </div>
          ) : (
            grouped.map(([section, items]) => (
              <div key={section}>
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] bg-[var(--hover)]/50 border-b border-[var(--border)] sticky top-0">
                  {SECTION_LABELS[section]} ({items.length})
                </div>
                {items.map(hit => {
                  const idx = cursor++
                  const active = idx === activeIndex
                  return (
                    <button
                      key={`${section}-${hit.kind}-${hit.title}-${idx}`}
                      onClick={() => select(hit)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full text-left px-3 py-2 border-b border-[var(--border)]/40 last:border-0 transition-colors cursor-pointer ${
                        active ? 'bg-[var(--sidebar-active)]' : 'hover:bg-[var(--hover)]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[var(--muted)] shrink-0 w-20 truncate">{hit.kind}</span>
                        <span className="text-xs font-medium truncate flex-1 min-w-0">{hit.title}</span>
                      </div>
                      {hit.subtitle && (
                        <div className="text-[11px] text-[var(--muted)] truncate mt-0.5 pl-[5.5rem]">
                          {hit.subtitle}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
