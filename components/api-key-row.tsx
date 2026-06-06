import { ExpandableRow } from './expandable-row'
import type { ApiKeyEntry } from '@/lib/types'

function ApiKeySummary({ entry }: { entry: ApiKeyEntry }) {
  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <span className="font-medium text-sm shrink-0">{entry.provider}</span>
      <span className="text-sm text-[var(--muted)] hidden sm:block">
        {entry.projects.length} project{entry.projects.length !== 1 ? 's' : ''}
      </span>
      <span className="text-[11px] font-mono bg-[var(--tag-bg)] text-[var(--tag-text)] px-1.5 py-0.5 rounded shrink-0 hidden md:block">
        {entry.spendLimit || 'no limit'}
      </span>
      {!entry.spendLimitSet && (
        <span
          className="text-[11px] font-mono px-1.5 py-0.5 rounded shrink-0 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
          title="No spend limit set"
        >
          unlimited
        </span>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-[var(--muted)] mb-1 uppercase tracking-wider">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  )
}

function ApiKeyDetail({ entry }: { entry: ApiKeyEntry }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {entry.vault_ref && (
          <Field label="Vault reference">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs">{entry.vault_ref}</span>
              {entry.vault_url && (
                <a
                  href={entry.vault_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--link)] hover:text-[var(--link-hover)] transition-colors"
                  title="Open NordPass"
                >
                  open →
                </a>
              )}
            </div>
          </Field>
        )}
        {entry.spendLimit && (
          <Field label="Spend limit">
            <span className="font-mono text-xs">{entry.spendLimit}</span>
          </Field>
        )}
        {entry.lastRotated && (
          <Field label="Last rotated">
            <span className="font-mono text-xs">{entry.lastRotated}</span>
          </Field>
        )}
      </div>

      {(entry.billingUrl || entry.keysUrl) && (
        <Field label="Links">
          <div className="flex flex-col gap-1">
            {entry.billingUrl && (
              <a
                href={entry.billingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-[var(--link)] hover:text-[var(--link-hover)] transition-colors"
              >
                Billing →
              </a>
            )}
            {entry.keysUrl && (
              <a
                href={entry.keysUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-[var(--link)] hover:text-[var(--link-hover)] transition-colors"
              >
                Manage keys →
              </a>
            )}
          </div>
        </Field>
      )}

      {entry.projects.length > 0 && (
        <Field label="Projects using it">
          <div className="flex flex-wrap gap-1.5">
            {entry.projects.map((p) => (
              <span
                key={p}
                className="text-[11px] font-mono bg-[var(--tag-bg)] text-[var(--tag-text)] px-1.5 py-0.5 rounded"
              >
                {p}
              </span>
            ))}
          </div>
        </Field>
      )}

      {entry.notes && (
        <Field label="Notes">
          <p className="text-[var(--muted)] whitespace-pre-line">{entry.notes}</p>
        </Field>
      )}
    </div>
  )
}

export function ApiKeyRow({ entry }: { entry: ApiKeyEntry }) {
  return (
    <ExpandableRow
      summary={<ApiKeySummary entry={entry} />}
      detail={<ApiKeyDetail entry={entry} />}
    />
  )
}
