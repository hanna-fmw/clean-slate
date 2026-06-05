'use client'

import { useState } from 'react'
import { Sidebar, type Section } from '@/components/sidebar'
import { SyncInfoDialog } from '@/components/sync-info-dialog'

interface DashboardLayoutProps {
  counts: Record<Section, number>
  projectList: React.ReactNode
  serviceList: React.ReactNode
  toolsList: React.ReactNode
  toolboxList: React.ReactNode
  referenceList: React.ReactNode
}

const TITLES: Record<Section, string> = {
  projects: 'Projects',
  services: 'Services',
  tools: 'Tools',
  toolbox: 'My Toolbox',
  reference: 'Reference',
}

export function DashboardLayout({
  counts,
  projectList,
  serviceList,
  toolsList,
  toolboxList,
  referenceList,
}: DashboardLayoutProps) {
  const [active, setActive] = useState<Section>('projects')

  return (
    <div className="flex min-h-screen">
      <Sidebar active={active} onNavigate={setActive} counts={counts} />
      <div className="flex-1 min-w-0 md:ml-[var(--sidebar-width)] flex flex-col min-h-screen pt-[var(--header-height)] md:pt-0">
        <header className="h-[var(--header-height)] border-b border-[var(--border)] flex items-center px-[var(--card-padding)] md:px-[var(--space-section)] shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--muted)] hidden sm:inline">clean-slate</span>
            <span className="text-[var(--muted)] hidden sm:inline">/</span>
            <span className="font-medium">{TITLES[active]}</span>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs text-[var(--muted)]">
            {counts[active]} items
            <SyncInfoDialog />
          </div>
        </header>
        <main className="flex-1 px-[var(--card-padding)] md:px-[var(--space-section)] py-[var(--space-section)] max-w-5xl">
          {active === 'projects' && projectList}
          {active === 'services' && serviceList}
          {active === 'tools' && toolsList}
          {active === 'toolbox' && toolboxList}
          {active === 'reference' && referenceList}
        </main>
      </div>
    </div>
  )
}
