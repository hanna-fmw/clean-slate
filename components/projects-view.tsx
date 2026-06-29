'use client'

import { useEffect, useState } from 'react'
import type { Project } from '@/lib/types'
import { ProjectCard } from './project-card'
import { ExpandableRow } from './expandable-row'
import { formatRelativeTime } from '@/lib/format'

type ViewMode = 'cards' | 'compact'
const STORAGE_KEY = 'clean-slate.projects.view'

interface ProjectsViewProps {
  projects: Project[]
}

export function ProjectsView({ projects }: ProjectsViewProps) {
  const [mode, setMode] = useState<ViewMode>('cards')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ViewMode | null
    if (saved === 'cards' || saved === 'compact') setMode(saved)
  }, [])

  const setAndPersist = (m: ViewMode) => {
    setMode(m)
    localStorage.setItem(STORAGE_KEY, m)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <div className="inline-flex border border-[var(--border)] rounded-[var(--card-radius)] overflow-hidden text-[11px]">
          <button
            onClick={() => setAndPersist('cards')}
            className={`flex items-center gap-1.5 px-2.5 py-1 cursor-pointer transition-colors ${
              mode === 'cards'
                ? 'bg-[var(--sidebar-active)] text-[var(--foreground)]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)]'
            }`}
            aria-pressed={mode === 'cards'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Cards
          </button>
          <button
            onClick={() => setAndPersist('compact')}
            className={`flex items-center gap-1.5 px-2.5 py-1 cursor-pointer transition-colors border-l border-[var(--border)] ${
              mode === 'compact'
                ? 'bg-[var(--sidebar-active)] text-[var(--foreground)]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)]'
            }`}
            aria-pressed={mode === 'compact'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            Compact
          </button>
        </div>
      </div>

      {mode === 'cards' ? (
        <div className="space-y-4">
          {projects.map(p => (
            <ProjectCard key={p.name} project={p} />
          ))}
        </div>
      ) : (
        <div className="border border-[var(--border)] rounded-[var(--card-radius)] overflow-hidden">
          {projects.map(p => (
            <ExpandableRow
              key={p.name}
              summary={
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="font-medium text-sm shrink-0">{p.name}</span>
                  <span className="font-mono text-xs text-[var(--muted)] truncate">
                    {p.path}
                  </span>
                  {p.last_modified && (
                    <span className="text-[11px] text-[var(--muted)] shrink-0 hidden md:block ml-auto mr-2">
                      {formatRelativeTime(p.last_modified)}
                    </span>
                  )}
                </div>
              }
              detail={<CompactDetail project={p} />}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CompactDetail({ project }: { project: Project }) {
  return (
    <div className="space-y-2 text-sm">
      {project.description_short && (
        <p className="text-[var(--muted)] leading-relaxed">{project.description_short}</p>
      )}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[var(--muted)]">
        {project.hosting && <span><span className="opacity-70">Hosting:</span> {project.hosting}</span>}
        {project.database && <span><span className="opacity-70">DB:</span> {project.database}</span>}
        {project.deployed_url && (
          <a
            href={project.deployed_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[var(--link)] hover:text-[var(--link-hover)]"
          >
            {project.deployed_url.replace(/^https?:\/\//, '')}
          </a>
        )}
        {project.github.repo_url && (
          <a
            href={project.github.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[var(--link)] hover:text-[var(--link-hover)]"
          >
            {project.github.repo_url.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>
      {project.stack.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {project.stack.map(s => (
            <span
              key={s}
              className="text-[10px] font-mono bg-[var(--tag-bg)] text-[var(--tag-text)] px-1.5 py-0.5 rounded"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
