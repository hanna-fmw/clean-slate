'use client'

import { useState } from 'react'
import type { Cheatsheet } from '@/lib/cheatsheets'

interface CheatsheetsViewProps {
  cheatsheets: Cheatsheet[]
}

export function CheatsheetsView({ cheatsheets }: CheatsheetsViewProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (cheatsheets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No cheatsheets yet. Drop an <code className="font-mono">.html</code> file into{' '}
        <code className="font-mono">public/cheatsheets/</code>.
      </p>
    )
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-1">
        {cheatsheets.map(cs => (
          <CheatsheetCard
            key={cs.slug}
            cheatsheet={cs}
            onExpand={() => setExpanded(cs.slug)}
          />
        ))}
      </div>

      {expanded && (
        <ExpandedOverlay
          cheatsheet={cheatsheets.find(c => c.slug === expanded)!}
          onClose={() => setExpanded(null)}
        />
      )}
    </>
  )
}

function CheatsheetCard({
  cheatsheet,
  onExpand,
}: {
  cheatsheet: Cheatsheet
  onExpand: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[var(--border)] rounded-[var(--card-radius)] overflow-hidden bg-[var(--card-bg)] flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--border)] shrink-0 cursor-pointer text-left hover:bg-[var(--hover)] transition-colors"
      >
        <span className="flex items-center gap-2 min-w-0">
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`shrink-0 text-[var(--muted)] transition-transform ${open ? 'rotate-90' : ''}`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="text-sm font-medium truncate text-[var(--foreground)]">{cheatsheet.title}</span>
          <span className="text-[11px] font-mono truncate text-[var(--muted)] hidden sm:inline">{cheatsheet.file}</span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <span
            role="button"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); onExpand() }}
            onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onExpand() } }}
            className="text-[11px] text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer p-1"
            aria-label="Expand fullscreen"
            title="Expand fullscreen"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </span>
          <a
            href={cheatsheet.publicPath}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-[11px] text-[var(--muted)] hover:text-[var(--foreground)] p-1"
            aria-label="Open in new tab"
            title="Open in new tab"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </span>
      </button>
      {open && (
        <div
          className="cheatsheet-content p-4"
          dangerouslySetInnerHTML={{ __html: cheatsheet.bodyHtml }}
        />
      )}
    </div>
  )
}

function ExpandedOverlay({
  cheatsheet,
  onClose,
}: {
  cheatsheet: Cheatsheet
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 md:p-10"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[var(--card-radius)] overflow-hidden w-full max-w-4xl h-full max-h-[90vh] flex flex-col shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-[var(--border)] bg-[var(--card-bg)]">
          <span className="text-sm font-medium truncate">{cheatsheet.title}</span>
          <div className="flex items-center gap-3">
            <a
              href={cheatsheet.publicPath}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
            >
              open in new tab
            </a>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <iframe
          src={cheatsheet.publicPath}
          title={cheatsheet.title}
          className="flex-1 w-full bg-white"
        />
      </div>
    </div>
  )
}
