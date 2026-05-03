'use client'

import { useState } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface ExpandableRowProps {
  summary: React.ReactNode
  detail: React.ReactNode
}

export function ExpandableRow({ summary, detail }: ExpandableRowProps) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-3 py-2.5 px-3 text-left hover:bg-[var(--hover)] transition-colors cursor-pointer border-b border-[var(--border)] rounded-sm">
        {summary}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className={`ml-auto text-[var(--muted)] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-4 pt-3 border-b border-[var(--border)] bg-[var(--hover)]">
        {detail}
      </CollapsibleContent>
    </Collapsible>
  )
}
