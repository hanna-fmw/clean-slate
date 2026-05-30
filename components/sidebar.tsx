'use client'

import { useState, useEffect } from 'react'
import { ThemeToggle } from './theme-toggle'

export type Section = 'projects' | 'services' | 'tools' | 'toolbox'

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
    label: 'Services',
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
    key: 'tools',
    label: 'Tools',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    key: 'toolbox',
    label: 'My Toolbox',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 8h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z" />
        <path d="M8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
        <line x1="3" y1="13" x2="21" y2="13" />
        <rect x="10" y="11" width="4" height="4" rx="0.5" />
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
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) return
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [mobileOpen])

  const handleNavigate = (section: Section) => {
    onNavigate(section)
    setMobileOpen(false)
  }

  const navContent = (
    <>
      <div className="px-4 h-[var(--header-height)] flex items-center border-b border-[var(--border)]">
        <div className="flex items-center gap-2 text-sm font-medium">
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="currentColor" opacity="0.1"/>
            <path d="M8 10h16M8 16h10M8 22h13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="24" cy="22" r="3" fill="#3ECF8E"/>
          </svg>
          clean-slate
        </div>
        <button
          className="ml-auto md:hidden p-1 text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
          onClick={() => setMobileOpen(false)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 py-2 px-2 overflow-y-auto">
        {NAV_ITEMS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => handleNavigate(key)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-[7px] text-[13px] rounded-[var(--card-radius)] transition-colors cursor-pointer mb-px ${
              active === key
                ? 'bg-[var(--sidebar-active)] text-[var(--foreground)] font-medium'
                : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)]'
            }`}
          >
            <span className="shrink-0">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="border-t border-[var(--border)] px-3 py-3 space-y-2">
        <div className="text-[11px] text-[var(--muted)] space-y-0.5">
          <p>Next.js 16 - Vercel</p>
          <p className="font-mono">ops.hosk.app</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[var(--muted)]">Personal Ops Dashboard</span>
          <ThemeToggle />
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile header bar */}
      <div className="fixed top-0 left-0 right-0 h-[var(--header-height)] bg-[var(--sidebar-bg)] border-b border-[var(--border)] flex items-center px-4 z-20 md:hidden">
        <button
          className="p-1 text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
          onClick={() => setMobileOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="flex items-center gap-2 text-sm font-medium ml-3">
          <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="currentColor" opacity="0.1"/>
            <path d="M8 10h16M8 16h10M8 22h13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="24" cy="22" r="3" fill="#3ECF8E"/>
          </svg>
          clean-slate
        </div>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - fixed on desktop, slide-over on mobile */}
      <aside
        className={`fixed top-0 left-0 h-full w-[var(--sidebar-width)] bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex flex-col z-40 transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {navContent}
      </aside>
    </>
  )
}
