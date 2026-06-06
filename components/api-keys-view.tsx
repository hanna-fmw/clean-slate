import { ApiKeyRow } from './api-key-row'
import type { ApiKeyEntry } from '@/lib/types'

export function ApiKeysView({ entries }: { entries: ApiKeyEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)] py-4">
        No API keys yet. Add markdown files in <code className="font-mono text-xs">data/api-keys/</code> and run <code className="font-mono text-xs">pnpm sync</code>.
      </p>
    )
  }

  const withoutLimit = entries.filter((e) => !e.spendLimitSet).length

  return (
    <div className="space-y-4">
      {withoutLimit > 0 && (
        <p className="text-xs text-[var(--muted)]">
          {withoutLimit} provider{withoutLimit !== 1 ? 's' : ''} without a spend limit set.
        </p>
      )}
      <div className="space-y-2">
        {entries.map((entry) => (
          <ApiKeyRow key={entry.provider} entry={entry} />
        ))}
      </div>
    </div>
  )
}
