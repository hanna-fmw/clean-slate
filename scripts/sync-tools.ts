import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs'
import { join, basename } from 'path'
import { homedir } from 'os'

interface ToolOrigin {
  source: 'anthropic' | '3rd-party' | 'custom'
  repo_url?: string
  plugin?: string
}

interface AgentInfo {
  name: string
  description: string
  origin: ToolOrigin
  category: string
}

interface PluginInfo {
  name: string
  version: string
  origin: ToolOrigin
  marketplace: string
}

interface McpServerInfo {
  name: string
  origin: ToolOrigin
  transport: string
  notes: string
}

interface SkillInfo {
  name: string
  description: string
  plugin: string
  origin: ToolOrigin
}

const PLUGIN_REPOS: Record<string, string> = {
  'superpowers': 'https://github.com/obra/superpowers',
  'vercel': 'https://github.com/anthropics/claude-plugins-official',
  'playwright': 'https://github.com/anthropics/claude-plugins-official',
  'github': 'https://github.com/anthropics/claude-plugins-official',
  'huggingface-skills': 'https://github.com/anthropics/claude-plugins-official',
  'figma': 'https://github.com/anthropics/claude-plugins-official',
  'pr-review-toolkit': 'https://github.com/anthropics/claude-plugins-official',
  'code-simplifier': 'https://github.com/anthropics/claude-plugins-official',
  'security-guidance': 'https://github.com/anthropics/claude-plugins-official',
  'agent-sdk-dev': 'https://github.com/anthropics/claude-plugins-official',
  'skill-creator': 'https://github.com/anthropics/claude-plugins-official',
  'frontend-design': 'https://github.com/anthropics/claude-plugins-official',
  'compound-engineering': 'https://github.com/EveryInc/compound-engineering-plugin',
  'warp': 'https://github.com/warpdotdev/claude-code-warp',
}

function pluginOrigin(pluginName: string, marketplace: string): ToolOrigin {
  const isAnthropic = marketplace === 'claude-plugins-official'
  return {
    source: isAnthropic ? 'anthropic' : '3rd-party',
    repo_url: PLUGIN_REPOS[pluginName],
    plugin: pluginName,
  }
}

function agentFileOrigin(filename: string): ToolOrigin {
  if (filename.startsWith('gsd-')) {
    return {
      source: '3rd-party',
      repo_url: 'https://github.com/gsd-build/get-shit-done',
    }
  }
  return {
    source: '3rd-party',
    repo_url: 'https://github.com/msitarzewski/agency-agents',
  }
}

function scanAgents(): AgentInfo[] {
  const agents: AgentInfo[] = []
  const seen = new Set<string>()

  const agentsDir = join(homedir(), '.claude', 'agents')
  if (existsSync(agentsDir)) {
    for (const f of readdirSync(agentsDir)) {
      if (!f.endsWith('.md')) continue
      const content = readFileSync(join(agentsDir, f), 'utf8')
      const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)
      const meta: Record<string, string> = {}
      if (frontmatter) {
        frontmatter[1].split('\n').forEach(line => {
          const [key, ...rest] = line.split(':')
          if (key && rest.length) meta[key.trim()] = rest.join(':').trim()
        })
      }

      const filename = basename(f, '.md')
      let category = filename.includes('-')
        ? filename.split('-')[0]
        : 'general'
      if (category === 'agentic') category = 'agents'

      const name = meta.name || filename
      if (seen.has(name)) continue
      seen.add(name)

      agents.push({
        name,
        description: meta.description || '',
        origin: agentFileOrigin(filename),
        category,
      })
    }
  }

  const pluginsCache = join(homedir(), '.claude', 'plugins', 'cache')
  if (existsSync(pluginsCache)) {
    try {
      for (const marketplace of readdirSync(pluginsCache, { withFileTypes: true })) {
        if (!marketplace.isDirectory()) continue
        const marketDir = join(pluginsCache, marketplace.name)
        for (const plugin of readdirSync(marketDir, { withFileTypes: true })) {
          if (!plugin.isDirectory()) continue
          const pluginDir = join(marketDir, plugin.name)
          for (const version of readdirSync(pluginDir, { withFileTypes: true })) {
            if (!version.isDirectory()) continue
            const agentsPath = join(pluginDir, version.name, 'agents')
            if (!existsSync(agentsPath)) continue
            scanAgentDir(agentsPath, plugin.name, marketplace.name, agents, seen)
          }
        }
      }
    } catch { /* skip unreadable dirs */ }
  }

  return agents
}

function scanAgentDir(dir: string, pluginName: string, marketplace: string, agents: AgentInfo[], seen: Set<string>) {
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        scanAgentDir(join(dir, entry.name), pluginName, marketplace, agents, seen)
        continue
      }
      if (!entry.name.endsWith('.md')) continue
      const content = readFileSync(join(dir, entry.name), 'utf8')
      const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)
      const meta: Record<string, string> = {}
      if (frontmatter) {
        frontmatter[1].split('\n').forEach(line => {
          const [key, ...rest] = line.split(':')
          if (key && rest.length) meta[key.trim()] = rest.join(':').trim()
        })
      }

      const name = meta.name || basename(entry.name, '.md')
      if (seen.has(name)) continue
      seen.add(name)

      agents.push({
        name,
        description: meta.description || '',
        origin: pluginOrigin(pluginName, marketplace),
        category: pluginName,
      })
    }
  } catch { /* skip */ }
}

function scanPlugins(): PluginInfo[] {
  const pluginsFile = join(homedir(), '.claude', 'plugins', 'installed_plugins.json')
  if (!existsSync(pluginsFile)) return []

  const data = JSON.parse(readFileSync(pluginsFile, 'utf8'))
  const plugins = data.plugins || {}

  return Object.entries(plugins).map(([key, entries]) => {
    const info = (entries as Array<{ version?: string }>)[0] || {}
    const [name, marketplace] = key.split('@')

    return {
      name,
      version: info.version || 'unknown',
      origin: {
        source: (marketplace === 'claude-plugins-official' ? 'anthropic' : '3rd-party') as 'anthropic' | '3rd-party',
        repo_url: PLUGIN_REPOS[name],
        plugin: name,
      },
      marketplace: marketplace || 'unknown',
    }
  })
}

function scanMcpServers(): McpServerInfo[] {
  const configFile = join(homedir(), '.claude.json')
  if (!existsSync(configFile)) return []

  const data = JSON.parse(readFileSync(configFile, 'utf8'))
  const servers = data.mcpServers || {}

  const MCP_REPOS: Record<string, { source: 'anthropic' | '3rd-party', repo_url: string }> = {
    'context7': { source: 'anthropic', repo_url: 'https://github.com/anthropics/claude-plugins-official' },
    'plugin_compound-engineering_context7': { source: 'anthropic', repo_url: 'https://github.com/anthropics/claude-plugins-official' },
    'Sanity': { source: '3rd-party', repo_url: 'https://github.com/sanity-io/sanity-mcp-server' },
    'coolify': { source: '3rd-party', repo_url: 'https://github.com/StuMason/coolify-mcp' },
    'coolify-stormfors': { source: '3rd-party', repo_url: 'https://github.com/StuMason/coolify-mcp' },
    'proxmox': { source: '3rd-party', repo_url: 'https://github.com/canvrno/ProxmoxMCP' },
    'ssh-server': { source: '3rd-party', repo_url: 'https://github.com/oaslananka-lab/mcp-ssh-tool' },
    'supabase-signalstack': { source: '3rd-party', repo_url: 'https://github.com/supabase-community/supabase-mcp' },
    'n8n-mcp': { source: '3rd-party', repo_url: 'https://github.com/leonardsellem/n8n-mcp-server' },
    'nano-banana': { source: '3rd-party', repo_url: 'https://github.com/ConechoAI/Nano-Banana-MCP' },
    'firecrawl-mcp-stormfors': { source: '3rd-party', repo_url: 'https://github.com/firecrawl/firecrawl-mcp-server' },
    'MCP_DOCKER': { source: '3rd-party', repo_url: 'https://github.com/docker/mcp-gateway' },
    'docker': { source: '3rd-party', repo_url: 'https://github.com/docker/mcp-gateway' },
    'figma-personal': { source: '3rd-party', repo_url: 'https://mcp.figma.com' },
  }

  return Object.entries(servers).map(([name, config]) => {
    const cfg = config as Record<string, unknown>
    const transport = cfg.type === 'sse' || cfg.url ? 'sse' : 'stdio'

    const known = MCP_REPOS[name]

    return {
      name,
      origin: known
        ? { source: known.source, repo_url: known.repo_url }
        : { source: '3rd-party' as const },
      transport,
      notes: '',
    }
  })
}

function readSkillDescription(skillDir: string, skillName: string): string {
  for (const name of ['SKILL.md', 'skill.md']) {
    const path = join(skillDir, skillName, name)
    if (!existsSync(path)) continue
    try {
      const content = readFileSync(path, 'utf8')
      const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)
      if (!frontmatter) return ''
      const descLine = frontmatter[1].split('\n').find(l => l.startsWith('description:'))
      if (!descLine) return ''
      return descLine.replace(/^description:\s*"?/, '').replace(/"$/, '').trim()
    } catch { return '' }
  }
  return ''
}

function scanSkills(): SkillInfo[] {
  const skills: SkillInfo[] = []
  const seen = new Set<string>()

  const userSkillsDir = join(homedir(), '.claude', 'skills')
  if (existsSync(userSkillsDir)) {
    try {
      for (const entry of readdirSync(userSkillsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue
        const skillMd = join(userSkillsDir, entry.name, 'SKILL.md')
        const skillMdLower = join(userSkillsDir, entry.name, 'skill.md')
        if (!existsSync(skillMd) && !existsSync(skillMdLower)) continue

        const isFromPlugin = existsSync(join(homedir(), '.claude', 'plugins', 'cache', entry.name))
          || readdirSync(join(homedir(), '.claude', 'plugins', 'cache')).some(marketplace => {
            const marketDir = join(homedir(), '.claude', 'plugins', 'cache', marketplace)
            try {
              return readdirSync(marketDir).includes(entry.name)
            } catch { return false }
          })

        if (isFromPlugin) continue

        const key = `custom:${entry.name}`
        if (!seen.has(key)) {
          seen.add(key)
          skills.push({
            name: entry.name,
            description: readSkillDescription(userSkillsDir, entry.name),
            plugin: 'custom',
            origin: { source: 'custom' },
          })
        }
      }
    } catch { /* skip */ }
  }

  const pluginsCache = join(homedir(), '.claude', 'plugins', 'cache')
  if (existsSync(pluginsCache)) {
    try {
      const marketplaces = readdirSync(pluginsCache, { withFileTypes: true })
      for (const marketplace of marketplaces) {
        if (!marketplace.isDirectory()) continue
        const marketDir = join(pluginsCache, marketplace.name)
        const plugins = readdirSync(marketDir, { withFileTypes: true })

        for (const plugin of plugins) {
          if (!plugin.isDirectory()) continue
          const pluginDir = join(marketDir, plugin.name)
          const versions = readdirSync(pluginDir, { withFileTypes: true })

          for (const version of versions) {
            if (!version.isDirectory()) continue
            const skillsDir = join(pluginDir, version.name, 'skills')
            if (!existsSync(skillsDir)) continue

            walkSkillDirs(skillsDir, plugin.name, marketplace.name, skills, seen)
          }
        }
      }
    } catch { /* skip */ }
  }

  return skills
}

function walkSkillDirs(dir: string, pluginName: string, marketplace: string, skills: SkillInfo[], seen: Set<string>) {
  if (!existsSync(dir)) return
  try {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillMd = join(dir, entry.name, 'SKILL.md')
        if (existsSync(skillMd)) {
          const key = `${pluginName}:${entry.name}`
          if (!seen.has(key)) {
            seen.add(key)
            skills.push({
              name: entry.name,
              description: readSkillDescription(dir, entry.name),
              plugin: pluginName,
              origin: pluginOrigin(pluginName, marketplace),
            })
          }
        }
      }
    }
  } catch { /* skip */ }
}

function main() {
  const scriptDir = new URL('.', import.meta.url).pathname
  const dataFile = join(scriptDir, '..', 'config', 'data.json')
  const data = JSON.parse(readFileSync(dataFile, 'utf8'))

  const tools = {
    synced_at: new Date().toISOString(),
    agents: scanAgents(),
    plugins: scanPlugins(),
    mcp_servers: scanMcpServers(),
    skills: scanSkills(),
  }

  data.tools = tools
  writeFileSync(dataFile, JSON.stringify(data, null, 2) + '\n')

  console.log(`Synced tools inventory:`)
  console.log(`  Agents: ${tools.agents.length}`)
  console.log(`  Plugins: ${tools.plugins.length}`)
  console.log(`  MCP servers: ${tools.mcp_servers.length}`)
  console.log(`  Skills: ${tools.skills.length}`)
}

main()
