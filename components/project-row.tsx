import { ExpandableRow } from './expandable-row'
import { formatRelativeTime } from '@/lib/format'
import type { Project } from '@/lib/types'

function ProjectSummary({ project }: { project: Project }) {
  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <span className="font-mono font-bold text-sm shrink-0">{project.name}</span>
      <span className="text-sm text-[var(--muted)] truncate hidden sm:block">
        {project.description_short}
      </span>
      <div className="flex gap-1.5 ml-auto mr-2 justify-end overflow-hidden">
        {project.stack.slice(0, 4).map((s) => (
          <span
            key={s}
            className="text-[11px] font-mono bg-[var(--tag-bg)] text-[var(--tag-text)] px-1.5 py-0.5 rounded"
          >
            {s}
          </span>
        ))}
        {project.stack.length > 4 && (
          <span className="text-[11px] text-[var(--muted)]">+{project.stack.length - 4}</span>
        )}
      </div>
      {project.last_modified && (
        <span className="text-[11px] text-[var(--muted)] shrink-0 hidden md:block">
          {formatRelativeTime(project.last_modified)}
        </span>
      )}
    </div>
  )
}

function ProjectDetail({ project }: { project: Project }) {
  return (
    <div className="space-y-4 text-sm">
      {project.description && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">Description</p>
          <div
            className="text-[var(--foreground)] leading-relaxed whitespace-pre-line"
            dangerouslySetInnerHTML={{
              __html: project.description
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br />')
            }}
          />
        </div>
      )}

      {project.hosting && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">Hosting</p>
          <p>{project.hosting}</p>
        </div>
      )}

      {project.database && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">Database</p>
          <p>{project.database}</p>
        </div>
      )}

      {project.github.repo_url && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">GitHub</p>
          <p className="font-mono text-xs">
            {project.github.account && <span>{project.github.account}</span>}
            {project.github.ssh_alias && <span className="text-[var(--muted)]"> ({project.github.ssh_alias})</span>}
          </p>
          <a
            href={project.github.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-[var(--link)] hover:text-[var(--link-hover)] transition-colors"
          >
            {project.github.repo_url}
          </a>
        </div>
      )}

      {Object.keys(project.run_commands).length > 0 && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">Run Commands</p>
          <div className="bg-[var(--background)] rounded px-3 py-2 font-mono text-xs space-y-1">
            {Object.entries(project.run_commands).map(([cmd, desc]) => (
              <div key={cmd} className="flex gap-4">
                <span className="text-[var(--foreground)] shrink-0">{cmd}</span>
                <span className="text-[var(--muted)]">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {project.services.length > 0 && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">Services</p>
          <div className="flex flex-wrap gap-1.5">
            {project.services.map((s) => (
              <span key={s} className="text-xs font-mono bg-[var(--tag-bg)] text-[var(--tag-text)] px-1.5 py-0.5 rounded">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {project.notes && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">Notes</p>
          <p className="text-[var(--muted)] whitespace-pre-line">{project.notes}</p>
        </div>
      )}

      <div className="flex gap-6 text-xs text-[var(--muted)] pt-2 border-t border-[var(--border)]">
        <span className="font-mono">{project.path}</span>
        {project.last_modified && (
          <span>Modified: {new Date(project.last_modified).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  )
}

export function ProjectRow({ project }: { project: Project }) {
  return (
    <ExpandableRow
      summary={<ProjectSummary project={project} />}
      detail={<ProjectDetail project={project} />}
    />
  )
}
