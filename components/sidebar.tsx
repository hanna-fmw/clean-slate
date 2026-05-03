'use client'

import { useState } from 'react'
import { ThemeToggle } from './theme-toggle'

export type Section = 'projects' | 'services' | 'infrastructure' | 'tools'

const NAV_ITEMS: { key: Section; label: string; icon: React.ReactNode }[] = [
  {
    key: 'projects',
    label: 'Projects',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    key: 'services',
    label: 'Services & Accounts',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
  },
  {
    key: 'infrastructure',
    label: 'Infrastructure',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" />
        <path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" />
      </svg>
    ),
  },
  {
    key: 'tools',
    label: 'Tools',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
]

interface SidebarProps {
  active: Section
  onNavigate: (section: Section) => void
  counts: Record<Section, number>
}

export function Sidebar({ active, onNavigate, counts }: SidebarProps) {
  return (
    <aside className="fixed top-0 left-0 h-full w-[var(--sidebar-width)] bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex flex-col">
      <div className="px-4 py-5 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-medium">clean-slate</h1>
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex-1 py-3 px-2">
        {NAV_ITEMS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-md transition-colors cursor-pointer mb-0.5 ${
              active === key
                ? 'bg-[var(--sidebar-active)] text-[var(--foreground)] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)]'
            }`}
          >
            <span className="shrink-0 opacity-70">{icon}</span>
            {label}
            <span className="ml-auto text-[11px] opacity-50">{counts[key]}</span>
          </button>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-[var(--border)] text-[11px] text-[var(--muted)]">
        ops.hosk.app
      </div>
    </aside>
  )
}
