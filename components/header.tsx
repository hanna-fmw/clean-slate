export function Header({ projectCount }: { projectCount: number }) {
  return (
    <header className="mb-8">
      <h1 className="font-mono text-lg font-bold tracking-tight mb-2">clean-slate</h1>
      <p className="text-sm text-[var(--muted)] leading-relaxed max-w-2xl">
        Personal project dashboard. {projectCount} projects synced from ~/Documents/.
        Each project has a CLEAN-SLATE.md in its root - the sync script reads them
        and rebuilds this page. Run <code className="font-mono text-[var(--foreground)]">pnpm sync</code> to
        refresh, or let the launchd job do it automatically.
      </p>
    </header>
  )
}
