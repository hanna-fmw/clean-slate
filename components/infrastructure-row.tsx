import { ExpandableRow } from './expandable-row'
import type { Infrastructure } from '@/lib/types'

function InfraSummary({ infra }: { infra: Infrastructure }) {
  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <span className="font-medium text-sm shrink-0">{infra.name}</span>
      {infra.access_url && infra.access_url !== 'TODO' && (
        <a
          href={infra.access_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-[var(--link)] hover:text-[var(--link-hover)] transition-colors truncate hidden sm:block"
        >
          {infra.access_url}
        </a>
      )}
      {infra.sub_resources.length > 0 && (
        <span className="text-[11px] text-[var(--muted)] shrink-0 ml-auto mr-2">
          {infra.sub_resources.length} resource{infra.sub_resources.length !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}

function InfraDetail({ infra }: { infra: Infrastructure }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
        {infra.access_url && (
          <>
            <span className="text-[var(--muted)]">URL</span>
            <a
              href={infra.access_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[var(--link)] hover:text-[var(--link-hover)] transition-colors"
            >
              {infra.access_url}
            </a>
          </>
        )}
        {infra.login_email && (
          <>
            <span className="text-[var(--muted)]">Login</span>
            <span className="font-mono">{infra.login_email}</span>
          </>
        )}
        {infra.nordpass_hint && (
          <>
            <span className="text-[var(--muted)]">NordPass</span>
            <span className="font-mono">{infra.nordpass_hint}</span>
          </>
        )}
      </div>

      {infra.notes && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-1 uppercase tracking-wider">Notes</p>
          <p className="text-[var(--muted)] whitespace-pre-line">{infra.notes}</p>
        </div>
      )}

      {infra.sub_resources.length > 0 && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-2 uppercase tracking-wider">Resources</p>
          <div className="space-y-1">
            {infra.sub_resources.map((r, i) => (
              <div key={i} className="flex gap-4 text-xs">
                <span className="font-mono font-bold shrink-0">{r.name}</span>
                <span className="text-[var(--muted)]">{r.purpose}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function InfrastructureRow({ infra }: { infra: Infrastructure }) {
  return (
    <ExpandableRow
      summary={<InfraSummary infra={infra} />}
      detail={<InfraDetail infra={infra} />}
    />
  )
}
