import { ExpandableRow } from './expandable-row'
import type { Service } from '@/lib/types'

function ServiceSummary({ service }: { service: Service }) {
  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <span className="font-medium text-sm shrink-0">{service.name}</span>
      <span className="text-[11px] font-mono bg-[var(--tag-bg)] text-[var(--tag-text)] px-1.5 py-0.5 rounded shrink-0">
        {service.category}
      </span>
      <span className="text-sm text-[var(--muted)] hidden sm:block">
        {service.accounts.length} account{service.accounts.length !== 1 ? 's' : ''}
      </span>
      {service.subscription && (
        <span className="text-[11px] text-[var(--muted)] shrink-0 hidden md:block">
          paid {service.receipt_email ? `- ${service.receipt_email}` : ''}
        </span>
      )}
    </div>
  )
}

function ServiceDetail({ service }: { service: Service }) {
  return (
    <div className="space-y-4 text-sm">
      {service.url && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-1 uppercase tracking-wider">URL</p>
          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-[var(--link)] hover:text-[var(--link-hover)] transition-colors"
          >
            {service.url}
          </a>
        </div>
      )}

      <div>
        <p className="text-xs text-[var(--muted)] mb-2 uppercase tracking-wider">Accounts</p>
        <div className="space-y-3">
          {service.accounts.map((account, i) => (
            <div key={i} className="bg-[var(--background)] rounded px-3 py-2 space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs">{account.alias || 'Account'}</span>
                {account.username && (
                  <span className="font-mono text-xs text-[var(--muted)]">@{account.username}</span>
                )}
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-xs">
                {account.email && (
                  <>
                    <span className="text-[var(--muted)]">Email</span>
                    <span className="font-mono">{account.email}</span>
                  </>
                )}
                {account.chrome_profile && (
                  <>
                    <span className="text-[var(--muted)]">Chrome</span>
                    <span className="font-mono">{account.chrome_profile}</span>
                  </>
                )}
                {account.use_for && (
                  <>
                    <span className="text-[var(--muted)]">Use for</span>
                    <span>{account.use_for}</span>
                  </>
                )}
                {account.nordpass_hint && (
                  <>
                    <span className="text-[var(--muted)]">NordPass</span>
                    <span className="font-mono">{account.nordpass_hint}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {service.notes && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-1 uppercase tracking-wider">Notes</p>
          <p className="text-[var(--muted)] whitespace-pre-line">{service.notes}</p>
        </div>
      )}
    </div>
  )
}

export function ServiceRow({ service }: { service: Service }) {
  return (
    <ExpandableRow
      summary={<ServiceSummary service={service} />}
      detail={<ServiceDetail service={service} />}
    />
  )
}
