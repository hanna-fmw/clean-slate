'use client'

import { useState } from 'react'
import { Sidebar, type Section } from '@/components/sidebar'
import { SyncInfoDialog } from '@/components/sync-info-dialog'
import { GlobalSearch } from '@/components/global-search'
import type {
  Project,
  Service,
  ToolsInventory,
  ToolboxEntry,
  ReferenceInventory,
} from '@/lib/types'

interface DashboardLayoutProps {
  counts: Record<Section, number>
  projectList: React.ReactNode
  serviceList: React.ReactNode
  toolsList: React.ReactNode
  toolboxList: React.ReactNode
  referenceList: React.ReactNode
  apiKeysList: React.ReactNode
  searchData: {
    projects: Project[]
    services: Service[]
    tools: ToolsInventory | undefined
    toolbox: ToolboxEntry[] | undefined
    reference: ReferenceInventory | undefined
  }
}

const TITLES: Record<Section, string> = {
  projects: 'Projects',
  services: 'Services',
  tools: 'Tools',
  toolbox: 'My Toolbox',
  reference: 'Reference',
  'api-keys': 'API Keys',
}

export function DashboardLayout({
  counts,
  projectList,
  serviceList,
  toolsList,
  toolboxList,
  referenceList,
  apiKeysList,
  searchData,
}: DashboardLayoutProps) {
  const [active, setActive] = useState<Section>('projects')

  return (
    <div className="flex min-h-screen">
      <Sidebar active={active} onNavigate={setActive} counts={counts} />
      <div className="flex-1 min-w-0 md:ml-[var(--sidebar-width)] flex flex-col min-h-screen pt-[var(--header-height)] md:pt-0">
        <header className="h-[var(--header-height)] border-b border-[var(--border)] flex items-center gap-4 px-[var(--card-padding)] md:px-[var(--space-section)] shrink-0">
          <div className="flex items-center gap-2 text-sm shrink-0">
            <span className="text-[var(--muted)] hidden sm:inline">clean-slate</span>
            <span className="text-[var(--muted)] hidden sm:inline">/</span>
            <span className="font-medium">{TITLES[active]}</span>
          </div>
          <div className="flex-1 flex justify-end">
            <GlobalSearch data={searchData} onSelect={setActive} />
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--muted)] shrink-0">
            <span className="hidden sm:inline">{counts[active]} items</span>
            <SyncInfoDialog />
          </div>
        </header>
        <main className="flex-1 px-[var(--card-padding)] md:px-[var(--space-section)] py-[var(--space-section)] max-w-5xl">
          {({
            projects: projectList,
            services: serviceList,
            tools: toolsList,
            toolbox: toolboxList,
            reference: referenceList,
            'api-keys': apiKeysList,
          } as Record<Section, React.ReactNode>)[active]}
        </main>
      </div>
    </div>
  )
}
