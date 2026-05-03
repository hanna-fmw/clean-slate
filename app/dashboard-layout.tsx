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
  services: 'Services & Accounts',
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
      <main className="flex-1 ml-[var(--sidebar-width)]">
        <div className="border-b border-[var(--border)] px-8 py-5">
          <h2 className="text-sm font-medium">{TITLES[active]}</h2>
        </div>
        <div className="px-8 py-6">
          {active === 'projects' && projectList}
          {active === 'services' && serviceList}
          {active === 'infrastructure' && infrastructureList}
          {active === 'tools' && toolsList}
        </div>
      </main>
    </div>
  )
}
