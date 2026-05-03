import { ExpandableRow } from './expandable-row'
import { ThemeToggle } from './theme-toggle'

export function Header() {
  return (
    <header className="mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-mono text-lg font-bold tracking-tight mb-1">clean-slate</h1>
          <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
            Your personal hub for all projects, accounts, and infrastructure.
          </p>
        </div>
        <ThemeToggle />
      </div>
      <div className="mb-4">
        <ExpandableRow
          summary={
            <span className="text-xs text-[var(--muted)]">How does this work?</span>
          }
          detail={
            <div className="space-y-3 text-xs text-[var(--muted)] leading-relaxed">
              <div>
                <p className="text-[var(--foreground)] font-mono font-bold mb-1">What is this?</p>
                <p>
                  A dashboard showing all your projects, service accounts (Supabase, Vercel, GitHub, etc.),
                  and infrastructure (servers, domains). Lives at{' '}
                  <span className="font-mono text-[var(--foreground)]">~/Documents/clean-slate</span>.
                  Deployed on Vercel - auto-updates when data changes.
                </p>
              </div>
              <div>
                <p className="text-[var(--foreground)] font-mono font-bold mb-1">How to update projects</p>
                <p>
                  Each project in ~/Documents/ has a <span className="font-mono text-[var(--foreground)]">CLEAN-SLATE.md</span> file.
                  Edit that file to update what shows here. A sync script runs automatically every 6 hours,
                  or run <span className="font-mono text-[var(--foreground)]">pnpm sync</span> manually from this project folder.
                </p>
              </div>
              <div>
                <p className="text-[var(--foreground)] font-mono font-bold mb-1">How to update services & infrastructure</p>
                <p>
                  Open Claude Code in this project and say something like{' '}
                  <span className="font-mono text-[var(--foreground)]">&quot;add my Supabase account under email X, Chrome profile Y&quot;</span>{' '}
                  or <span className="font-mono text-[var(--foreground)]">&quot;update the Proxmox access URL to X&quot;</span>.
                  Claude knows where the data file is and will edit it for you.
                  Or edit <span className="font-mono text-[var(--foreground)]">config/data.json</span> directly if you prefer.
                </p>
              </div>
              <div>
                <p className="text-[var(--foreground)] font-mono font-bold mb-1">How to add a new project</p>
                <p>
                  Create a <span className="font-mono text-[var(--foreground)]">CLEAN-SLATE.md</span> in the
                  project&apos;s root folder with sections: Description, Stack, Hosting, GitHub, Run Commands, Services, Notes.
                  The sync script picks it up automatically.
                </p>
              </div>
            </div>
          }
        />
      </div>
    </header>
  )
}
