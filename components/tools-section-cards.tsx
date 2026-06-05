'use client'

import { useState } from 'react'
import type { ToolsInventory, ToolSource, ToolOrigin } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const SOURCE_COLORS: Record<ToolSource, string> = {
  anthropic: 'bg-emerald-500',
  '3rd-party': 'bg-blue-500',
  custom: 'bg-violet-500',
}

const SOURCE_BADGE_COLORS: Record<ToolSource, string> = {
  anthropic: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  '3rd-party': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  custom: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
}

function SourceBadge({ origin }: { origin: ToolOrigin }) {
  return (
    <Badge variant="outline" className={`text-[10px] font-mono ${SOURCE_BADGE_COLORS[origin.source]}`}>
      <span className={`rounded-full ${SOURCE_COLORS[origin.source]}`} style={{ width: 'var(--dot-size)', height: 'var(--dot-size)' }} />
      {origin.source}
    </Badge>
  )
}

function OriginDetail({ origin }: { origin: ToolOrigin }) {
  const parts: React.ReactNode[] = []
  if (origin.plugin) {
    parts.push(<span key="plugin">via <span className="text-foreground/60">{origin.plugin}</span> plugin</span>)
  }
  if (origin.repo_url) {
    const display = origin.repo_url.replace('https://github.com/', '').replace('https://', '')
    parts.push(
      <a
        key="repo"
        href={origin.repo_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground/60 hover:text-foreground transition-colors inline-flex items-center gap-0.5"
      >
        {display}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    )
  }
  if (parts.length === 0) return null
  return (
    <p className="text-[10px] text-muted-foreground/60 font-mono mt-1 flex items-center gap-2 flex-wrap">
      {parts}
    </p>
  )
}

function SectionIntro({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs text-muted-foreground mb-5 space-y-1">
      {children}
    </div>
  )
}

function CollapsibleSection({ title, count, defaultOpen = true, children }: { title: string; count: number; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-3 cursor-pointer hover:text-foreground transition-colors"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        {title}
        <span className="opacity-50">{count}</span>
      </button>
      {open && children}
    </div>
  )
}

type SubTab = 'agents' | 'plugins' | 'mcp_servers' | 'skills' | 'hooks'

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'agents', label: 'Agents' },
  { key: 'plugins', label: 'Plugins' },
  { key: 'mcp_servers', label: 'MCP Servers' },
  { key: 'skills', label: 'Skills' },
  { key: 'hooks', label: 'Hooks' },
]

export function ToolsSectionCards({ tools }: { tools: ToolsInventory }) {
  const [active, setActive] = useState<SubTab>('agents')

  const counts: Record<SubTab, number> = {
    agents: tools.agents.length,
    plugins: tools.plugins.length,
    mcp_servers: tools.mcp_servers.length,
    skills: tools.skills.length,
    hooks: 3,
  }

  return (
    <div>
      <div className="flex gap-1 mb-4 flex-wrap">
        {SUB_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`px-3 py-1.5 text-[13px] rounded-md transition-colors cursor-pointer ${
              active === key
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {label}
            <span className="ml-1.5 opacity-60">{counts[key]}</span>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground font-mono mb-4">
        Last synced: {new Date(tools.synced_at).toLocaleDateString('sv-SE')}{' '}
        {new Date(tools.synced_at).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
      </p>

      {active === 'agents' && <AgentCards agents={tools.agents} />}
      {active === 'plugins' && <PluginCards plugins={tools.plugins} />}
      {active === 'mcp_servers' && <McpServerCards servers={tools.mcp_servers} />}
      {active === 'skills' && <SkillCards skills={tools.skills} />}
      {active === 'hooks' && <HooksSection />}
    </div>
  )
}

function AgentCards({ agents }: { agents: ToolsInventory['agents'] }) {
  const categories = [...new Set(agents.map(a => a.category))].sort()

  return (
    <div className="space-y-4">
      <SectionIntro>
        <p>Custom agents live in <code className="font-mono text-foreground/70">~/.claude/agents/</code> as markdown files. Plugin agents are bundled with their plugin.</p>
        <p>Invoke with the Agent tool by setting <code className="font-mono text-foreground/70">subagent_type</code>, or Claude picks them automatically when the task matches.</p>
      </SectionIntro>
      {categories.map(cat => {
        const catAgents = agents.filter(a => a.category === cat)
        return (
          <CollapsibleSection key={cat} title={cat} count={catAgents.length}>
            <div className="space-y-2">
              {catAgents.map(agent => (
                <Card key={agent.name} size="sm">
                  <CardHeader>
                    <CardTitle className="text-sm">{agent.name}</CardTitle>
                    <CardAction>
                      <SourceBadge origin={agent.origin} />
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    {agent.description && (
                        <p className="text-sm text-muted-foreground">{agent.description}</p>
                    )}
                    <OriginDetail origin={agent.origin} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CollapsibleSection>
        )
      })}
    </div>
  )
}

function PluginCards({ plugins }: { plugins: ToolsInventory['plugins'] }) {
  return (
    <div className="space-y-4">
      <SectionIntro>
        <p>Plugins extend Claude Code with skills, hooks, agents, and tools.</p>
        <p>Managed via <code className="font-mono text-foreground/70">claude plugins</code> CLI. Installed to <code className="font-mono text-foreground/70">~/.claude/plugins/</code>. Enable/disable in <code className="font-mono text-foreground/70">~/.claude/settings.json</code>.</p>
      </SectionIntro>
      <CollapsibleSection title="Plugins" count={plugins.length}>
        <div className="space-y-2">
          {plugins.map(plugin => (
            <Card key={plugin.name} size="sm">
              <CardHeader>
                <CardTitle className="text-sm">{plugin.name}</CardTitle>
                <CardAction>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">v{plugin.version}</Badge>
                    <SourceBadge origin={plugin.origin} />
                  </div>
                </CardAction>
              </CardHeader>
              <CardContent>
                {plugin.marketplace && (
                  <p className="text-xs text-muted-foreground">{plugin.marketplace}</p>
                )}
                <OriginDetail origin={plugin.origin} />
              </CardContent>
            </Card>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  )
}

function McpServerCards({ servers }: { servers: ToolsInventory['mcp_servers'] }) {
  return (
    <div className="space-y-4">
      <SectionIntro>
        <p>MCP (Model Context Protocol) servers expose external tools and resources to Claude Code.</p>
        <p>Configured in <code className="font-mono text-foreground/70">~/.claude.json</code> under <code className="font-mono text-foreground/70">mcpServers</code>. Manage with <code className="font-mono text-foreground/70">claude mcp list</code> / <code className="font-mono text-foreground/70">add</code> / <code className="font-mono text-foreground/70">remove</code>.</p>
      </SectionIntro>
      <CollapsibleSection title="MCP Servers" count={servers.length}>
        <div className="space-y-2">
          {servers.map(server => (
            <Card key={server.name} size="sm">
              <CardHeader>
                <CardTitle className="text-sm">{server.name}</CardTitle>
                <CardAction>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">{server.transport}</Badge>
                    <SourceBadge origin={server.origin} />
                  </div>
                </CardAction>
              </CardHeader>
              {(server.notes || server.origin.repo_url) && (
                <CardContent>
                  {server.notes && (
                    <p className="text-sm text-muted-foreground">{server.notes}</p>
                  )}
                  <OriginDetail origin={server.origin} />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  )
}

function SkillCards({ skills }: { skills: ToolsInventory['skills'] }) {
  const groups = [...new Set(skills.map(s => s.plugin))].sort((a, b) => {
    if (a === 'custom') return -1
    if (b === 'custom') return 1
    return a.localeCompare(b)
  })

  return (
    <div className="space-y-4">
      <SectionIntro>
        <p>Skills are specialized instructions invoked with <code className="font-mono text-foreground/70">/skill-name</code> or via the Skill tool.</p>
        <p>Custom skills live in <code className="font-mono text-foreground/70">~/.claude/skills/</code> as directories with a <code className="font-mono text-foreground/70">SKILL.md</code> file. Plugin skills come from installed plugins.</p>
      </SectionIntro>
      {groups.map(group => {
        const groupSkills = skills.filter(s => s.plugin === group)
        return (
          <CollapsibleSection key={group} title={group} count={groupSkills.length}>
            <div className="space-y-2">
              {groupSkills.map(skill => (
                <Card key={`${skill.plugin}:${skill.name}`} size="sm">
                  <CardHeader>
                    <CardTitle className="font-mono text-sm">{skill.name}</CardTitle>
                    <CardAction>
                      <SourceBadge origin={skill.origin} />
                    </CardAction>
                  </CardHeader>
                  {(skill.description || skill.origin.repo_url) && (
                    <CardContent>
                      {skill.description && (
                        <p className="text-sm text-muted-foreground">{skill.description}</p>
                      )}
                      <OriginDetail origin={skill.origin} />
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </CollapsibleSection>
        )
      })}
    </div>
  )
}

const HOOKS = [
  {
    name: 'Superpowers',
    plugin: 'superpowers',
    event: 'SessionStart',
    description: 'Loads skill discovery and session initialization on startup, clear, and compact events.',
    origin: { source: 'anthropic' as const, repo_url: 'https://github.com/obra/superpowers', plugin: 'superpowers' },
  },
  {
    name: 'Vercel',
    plugin: 'vercel',
    event: 'SessionStart',
    description: 'Injects Vercel knowledge context, skill profiling, and Claude.md overrides on session start and resume.',
    origin: { source: 'anthropic' as const, repo_url: 'https://github.com/anthropics/claude-plugins-official', plugin: 'vercel' },
  },
  {
    name: 'Warp',
    plugin: 'warp',
    event: 'SessionStart, Stop',
    description: 'Sends terminal notifications when sessions start and when Claude stops (task complete or needs input).',
    origin: { source: '3rd-party' as const, repo_url: 'https://github.com/warpdotdev/claude-code-warp', plugin: 'warp' },
  },
]

function HooksSection() {
  return (
    <div className="space-y-4">
      <SectionIntro>
        <p>Hooks are shell commands that run in response to Claude Code lifecycle events (SessionStart, Stop, tool calls, etc.).</p>
        <p>User hooks go in <code className="font-mono text-foreground/70">~/.claude/settings.json</code> or <code className="font-mono text-foreground/70">.claude/settings.json</code> under <code className="font-mono text-foreground/70">hooks</code>. Plugin hooks are auto-registered. No custom user hooks are currently configured.</p>
      </SectionIntro>
      <CollapsibleSection title="Active Hooks" count={HOOKS.length}>
        <div className="space-y-2">
          {HOOKS.map(hook => (
            <Card key={hook.name} size="sm">
              <CardHeader>
                <CardTitle className="text-sm">{hook.name}</CardTitle>
                <CardAction>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">
                      {hook.event}
                    </Badge>
                    <SourceBadge origin={hook.origin} />
                  </div>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{hook.description}</p>
                <OriginDetail origin={hook.origin} />
              </CardContent>
            </Card>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  )
}
