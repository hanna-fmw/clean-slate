'use client'

import { useState } from 'react'

type Tab = 'projects' | 'services' | 'infrastructure' | 'tools'

const TABS: { key: Tab; label: string }[] = [
  { key: 'projects', label: 'Projects' },
  { key: 'services', label: 'Services & Accounts' },
  { key: 'infrastructure', label: 'Infrastructure' },
  { key: 'tools', label: 'Tools' },
]

interface DashboardTabsProps {
  counts: Record<Tab, number>
  projectList: React.ReactNode
  serviceList: React.ReactNode
  infrastructureList: React.ReactNode
  toolsList: React.ReactNode
}

export function DashboardTabs({
  counts,
  projectList,
  serviceList,
  infrastructureList,
  toolsList,
}: DashboardTabsProps) {
  const [active, setActive] = useState<Tab>('projects')

  return (
    <div>
      <nav className="flex gap-1 border-b border-[var(--border)] mb-6">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`px-4 py-2.5 text-sm font-mono transition-colors cursor-pointer ${
              active === key
                ? 'text-[var(--foreground)] border-b-2 border-[var(--foreground)] -mb-px'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {label}
            <span className="ml-2 text-[11px] text-[var(--muted)]">{counts[key]}</span>
          </button>
        ))}
      </nav>
      {active === 'projects' && projectList}
      {active === 'services' && serviceList}
      {active === 'infrastructure' && infrastructureList}
      {active === 'tools' && toolsList}
    </div>
  )
}
