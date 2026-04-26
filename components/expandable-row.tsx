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
      <CollapsibleTrigger className="flex w-full items-center gap-3 py-3 px-4 text-left hover:bg-[var(--hover)] transition-colors cursor-pointer border-b border-[var(--border)]">
        {summary}
        <span
          className={`ml-auto text-[var(--muted)] text-xs shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          &#9662;
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-5 pt-3 border-b border-[var(--border)] bg-[var(--hover)]">
        {detail}
      </CollapsibleContent>
    </Collapsible>
  )
}
