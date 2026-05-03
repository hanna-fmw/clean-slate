'use client'

import { useState } from 'react'
import type { ToolsInventory, ToolSource } from '@/lib/types'

function SourceBadge({ source }: { source: ToolSource }) {
  const colors: Record<ToolSource, string> = {
    official: 'bg-[var(--tag-bg)] text-green-500',
    '3rd-party': 'bg-[var(--tag-bg)] text-blue-500',
    custom: 'bg-[var(--tag-bg)] text-purple-500',
  }

  return (
    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${colors[source]}`}>
      {source}
    </span>
  )
}

type SubTab = 'agents' | 'plugins' | 'mcp_servers' | 'skills'

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'agents', label: 'Agents' },
  { key: 'plugins', label: 'Plugins' },
  { key: 'mcp_servers', label: 'MCP Servers' },
  { key: 'skills', label: 'Skills' },
]

export function ToolsSection({ tools }: { tools: ToolsInventory }) {
  const [active, setActive] = useState<SubTab>('agents')

  const counts: Record<SubTab, number> = {
    agents: tools.agents.length,
    plugins: tools.plugins.length,
    mcp_servers: tools.mcp_servers.length,
    skills: tools.skills.length,
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
                ? 'bg-[var(--foreground)] text-[var(--background)]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)]'
            }`}
          >
            {label}
            <span className="ml-1.5 opacity-60">{counts[key]}</span>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-[var(--muted)] font-mono mb-4">
        Last synced: {new Date(tools.synced_at).toLocaleDateString('sv-SE')}{' '}
        {new Date(tools.synced_at).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
      </p>

      {active === 'agents' && <AgentsList agents={tools.agents} />}
      {active === 'plugins' && <PluginsList plugins={tools.plugins} />}
      {active === 'mcp_servers' && <McpServersList servers={tools.mcp_servers} />}
      {active === 'skills' && <SkillsList skills={tools.skills} />}
    </div>
  )
}

function AgentsList({ agents }: { agents: ToolsInventory['agents'] }) {
  const categories = [...new Set(agents.map(a => a.category))].sort()

  return (
    <div className="space-y-4">
      {categories.map(cat => (
        <div key={cat}>
          <p className="text-[11px] font-mono text-[var(--muted)] uppercase tracking-wider mb-2">{cat}</p>
          <div className="space-y-0">
            {agents
              .filter(a => a.category === cat)
              .map(agent => (
                <div
                  key={agent.name}
                  className="flex items-center gap-3 py-2 px-4 border-b border-[var(--border)]"
                >
                  <span className="text-sm font-medium shrink-0">{agent.name}</span>
                  <SourceBadge source={agent.source} />
                  <span className="text-xs text-[var(--muted)] truncate hidden sm:block">
                    {agent.description}
                  </span>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function PluginsList({ plugins }: { plugins: ToolsInventory['plugins'] }) {
  return (
    <div>
      {plugins.map(plugin => (
        <div
          key={plugin.name}
          className="flex items-center gap-3 py-2 px-4 border-b border-[var(--border)]"
        >
          <span className="text-sm font-medium shrink-0">{plugin.name}</span>
          <SourceBadge source={plugin.source} />
          <span className="text-[11px] font-mono bg-[var(--tag-bg)] text-[var(--tag-text)] px-1.5 py-0.5 rounded shrink-0">
            v{plugin.version}
          </span>
          <span className="text-xs text-[var(--muted)] hidden sm:block">{plugin.marketplace}</span>
        </div>
      ))}
    </div>
  )
}

function McpServersList({ servers }: { servers: ToolsInventory['mcp_servers'] }) {
  return (
    <div>
      {servers.map(server => (
        <div
          key={server.name}
          className="flex items-center gap-3 py-2 px-4 border-b border-[var(--border)]"
        >
          <span className="text-sm font-medium shrink-0">{server.name}</span>
          <SourceBadge source={server.source} />
          <span className="text-[11px] font-mono bg-[var(--tag-bg)] text-[var(--tag-text)] px-1.5 py-0.5 rounded shrink-0">
            {server.transport}
          </span>
        </div>
      ))}
    </div>
  )
}

function SkillsList({ skills }: { skills: ToolsInventory['skills'] }) {
  const plugins = [...new Set(skills.map(s => s.plugin))].sort()

  return (
    <div className="space-y-4">
      {plugins.map(plugin => (
        <div key={plugin}>
          <p className="text-[11px] font-mono text-[var(--muted)] uppercase tracking-wider mb-2">{plugin}</p>
          <div className="space-y-0">
            {skills
              .filter(s => s.plugin === plugin)
              .map(skill => (
                <div
                  key={`${skill.plugin}:${skill.name}`}
                  className="flex items-center gap-3 py-2 px-4 border-b border-[var(--border)]"
                >
                  <span className="font-mono text-sm shrink-0">{skill.name}</span>
                  <SourceBadge source={skill.source} />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
