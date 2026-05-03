'use client'

import { useState } from 'react'
import type { ToolsInventory, ToolSource } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function SourceBadge({ source }: { source: ToolSource }) {
  const variants: Record<ToolSource, 'default' | 'secondary' | 'outline'> = {
    official: 'default',
    '3rd-party': 'secondary',
    custom: 'outline',
  }

  return (
    <Badge variant={variants[source]} className="text-[10px] font-mono">
      {source}
    </Badge>
  )
}

type SubTab = 'agents' | 'plugins' | 'mcp_servers' | 'skills'

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'agents', label: 'Agents' },
  { key: 'plugins', label: 'Plugins' },
  { key: 'mcp_servers', label: 'MCP Servers' },
  { key: 'skills', label: 'Skills' },
]

export function ToolsSectionCards({ tools }: { tools: ToolsInventory }) {
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
    </div>
  )
}

function AgentCards({ agents }: { agents: ToolsInventory['agents'] }) {
  const categories = [...new Set(agents.map(a => a.category))].sort()

  return (
    <div className="space-y-6">
      {categories.map(cat => (
        <div key={cat}>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{cat}</p>
          <div className="space-y-2">
            {agents
              .filter(a => a.category === cat)
              .map(agent => (
                <Card key={agent.name} size="sm">
                  <CardHeader>
                    <CardTitle className="text-sm">{agent.name}</CardTitle>
                    <CardAction>
                      <SourceBadge source={agent.source} />
                    </CardAction>
                  </CardHeader>
                  {agent.description && (
                    <CardContent>
                      <p className="text-xs text-muted-foreground line-clamp-2">{agent.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function PluginCards({ plugins }: { plugins: ToolsInventory['plugins'] }) {
  return (
    <div className="space-y-2">
      {plugins.map(plugin => (
        <Card key={plugin.name} size="sm">
          <CardHeader>
            <CardTitle className="text-sm">{plugin.name}</CardTitle>
            <CardAction>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-[10px]">v{plugin.version}</Badge>
                <SourceBadge source={plugin.source} />
              </div>
            </CardAction>
          </CardHeader>
          {plugin.marketplace && (
            <CardContent>
              <p className="text-xs text-muted-foreground">{plugin.marketplace}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}

function McpServerCards({ servers }: { servers: ToolsInventory['mcp_servers'] }) {
  return (
    <div className="space-y-2">
      {servers.map(server => (
        <Card key={server.name} size="sm">
          <CardHeader>
            <CardTitle className="text-sm">{server.name}</CardTitle>
            <CardAction>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-[10px]">{server.transport}</Badge>
                <SourceBadge source={server.source} />
              </div>
            </CardAction>
          </CardHeader>
          {server.notes && (
            <CardContent>
              <p className="text-xs text-muted-foreground">{server.notes}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}

function SkillCards({ skills }: { skills: ToolsInventory['skills'] }) {
  const plugins = [...new Set(skills.map(s => s.plugin))].sort()

  return (
    <div className="space-y-6">
      {plugins.map(plugin => (
        <div key={plugin}>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{plugin}</p>
          <div className="space-y-2">
            {skills
              .filter(s => s.plugin === plugin)
              .map(skill => (
                <Card key={`${skill.plugin}:${skill.name}`} size="sm">
                  <CardHeader>
                    <CardTitle className="font-mono text-sm">{skill.name}</CardTitle>
                    <CardAction>
                      <SourceBadge source={skill.source} />
                    </CardAction>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
