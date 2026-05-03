'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-medium">
        {n}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium mb-1">{title}</p>
        <div className="text-xs text-muted-foreground space-y-1">{children}</div>
      </div>
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-foreground bg-muted px-1 py-0.5 rounded text-[11px]">{children}</code>
}

export function SyncInfoDialog() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-6 h-6 rounded-full border border-[var(--border)] flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer"
        aria-label="How syncing works"
      >
        ?
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>How this dashboard stays up to date</DialogTitle>
            <DialogDescription>
              The dashboard reads data from your local machine and deploys automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            <Step n={1} title="CLEAN-SLATE.md in each project">
              <p>Every project in <Code>~/Documents/</Code> has a <Code>CLEAN-SLATE.md</Code> file in its root (added to <Code>.gitignore</Code> so it stays local).</p>
              <p>This file has sections for Description, Stack, Hosting, GitHub, Run Commands, Services, and Notes. The sync script parses it to populate the Projects tab.</p>
              <p>Claude Code keeps it updated - the global instructions in <Code>~/.claude/CLAUDE.md</Code> tell Claude to create and maintain this file for every project. The <Code>session-handoff</Code> and <Code>compact-handoff</Code> skills also check it.</p>
            </Step>

            <Step n={2} title="Sync scripts collect the data">
              <p>Two scripts scan your machine and write everything to <Code>config/data.json</Code>:</p>
              <p><Code>pnpm sync</Code> - Reads each <Code>CLEAN-SLATE.md</Code> in <Code>~/Documents/</Code>, detects stack from <Code>package.json</Code>, reads git config for GitHub info, and gets the last commit date.</p>
              <p><Code>pnpm sync:tools</Code> - Scans <Code>~/.claude/agents/</Code>, <Code>~/.claude/skills/</Code>, <Code>~/.claude/plugins/</Code>, and <Code>~/.claude.json</Code> for your full tools inventory (agents, plugins, MCP servers, skills).</p>
            </Step>

            <Step n={3} title="Auto-sync runs every 6 hours">
              <p>A macOS LaunchAgent (<Code>com.hosk.clean-slate-sync</Code>) runs the sync inline every 6 hours. It:</p>
              <p>1. Runs both sync scripts</p>
              <p>2. Checks if <Code>config/data.json</Code> changed</p>
              <p>3. If yes: commits and pushes to GitHub</p>
              <p>The plist lives at <Code>~/Library/LaunchAgents/com.hosk.clean-slate-sync.plist</Code>.</p>
            </Step>

            <Step n={4} title="Push to GitHub triggers Vercel deploy">
              <p>The repo (<Code>hanna-fmw/clean-slate</Code>) is connected to Vercel. Any push to <Code>main</Code> triggers an automatic production deployment.</p>
              <p>The app is static (pre-rendered at build time), so the data baked into <Code>config/data.json</Code> at build time is what you see on the dashboard.</p>
            </Step>

            <div className="border-t border-[var(--border)] pt-4">
              <p className="text-sm font-medium mb-2">Manual sync</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>If you want to update immediately without waiting for the auto-sync:</p>
                <div className="font-mono bg-muted/50 rounded p-2 text-[11px] space-y-0.5">
                  <p>cd ~/Documents/clean-slate</p>
                  <p>pnpm sync:all</p>
                  <p>git add config/data.json && git commit -m "chore: sync" && git push</p>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-4">
              <p className="text-sm font-medium mb-2">Data sources</p>
              <div className="text-xs text-muted-foreground">
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                  <span>Projects</span>
                  <span><Code>~/Documents/*/CLEAN-SLATE.md</Code></span>
                  <span>Services</span>
                  <span><Code>config/data.json</Code> (manual)</span>
                  <span>Agents</span>
                  <span><Code>~/.claude/agents/</Code> + plugin cache</span>
                  <span>Skills</span>
                  <span><Code>~/.claude/skills/</Code> + plugin cache</span>
                  <span>Plugins</span>
                  <span><Code>~/.claude/plugins/installed_plugins.json</Code></span>
                  <span>MCP Servers</span>
                  <span><Code>~/.claude.json</Code></span>
                  <span>Hooks</span>
                  <span>Plugin hook directories (hardcoded)</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
