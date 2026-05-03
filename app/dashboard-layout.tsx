'use client'

import { useState } from 'react'
import { Sidebar, type Section } from '@/components/sidebar'

interface DashboardLayoutProps {
  counts: Record<Section, number>
  projectList: React.ReactNode
  serviceList: React.ReactNode
  infrastructureList: React.ReactNode
  toolsList: React.ReactNode
}

const TITLES: Record<Section, string> = {
  projects: 'Projects',
  services: 'Services',
  infrastructure: 'Infrastructure',
  tools: 'Tools',
}

export function DashboardLayout({
  counts,
  projectList,
  serviceList,
  infrastructureList,
  toolsList,
}: DashboardLayoutProps) {
  const [active, setActive] = useState<Section>('projects')

  return (
    <div className="flex min-h-screen">
      <Sidebar active={active} onNavigate={setActive} counts={counts} />
      <div className="flex-1 ml-[var(--sidebar-width)] flex flex-col min-h-screen">
        <header className="h-14 border-b border-[var(--border)] flex items-center px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--muted)]">clean-slate</span>
            <span className="text-[var(--muted)]">/</span>
            <span className="font-medium">{TITLES[active]}</span>
          </div>
          <div className="ml-auto text-[12px] text-[var(--muted)]">
            {counts[active]} items
          </div>
        </header>
        <main className="flex-1 px-6 py-6 max-w-5xl">
          {active === 'projects' && projectList}
          {active === 'services' && serviceList}
          {active === 'infrastructure' && infrastructureList}
          {active === 'tools' && toolsList}
        </main>
      </div>
    </div>
  )
}
