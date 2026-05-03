import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs'
import { join, basename } from 'path'
import { homedir } from 'os'

interface AgentInfo {
  name: string
  description: string
  source: 'official' | '3rd-party' | 'custom'
  category: string
}

interface PluginInfo {
  name: string
  version: string
  source: 'official' | '3rd-party' | 'custom'
  marketplace: string
}

interface McpServerInfo {
  name: string
  source: 'official' | '3rd-party' | 'custom'
  transport: string
  notes: string
}

interface SkillInfo {
  name: string
  plugin: string
  source: 'official' | '3rd-party' | 'custom'
}

function scanAgents(): AgentInfo[] {
  const agentsDir = join(homedir(), '.claude', 'agents')
  if (!existsSync(agentsDir)) return []

  return readdirSync(agentsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
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
      const category = filename.includes('-')
        ? filename.split('-')[0]
        : 'general'

      return {
        name: meta.name || filename,
        description: meta.description || '',
        source: 'custom' as const,
        category,
      }
    })
}

function scanPlugins(): PluginInfo[] {
  const pluginsFile = join(homedir(), '.claude', 'plugins', 'installed_plugins.json')
  if (!existsSync(pluginsFile)) return []

  const data = JSON.parse(readFileSync(pluginsFile, 'utf8'))
  const plugins = data.plugins || {}

  return Object.entries(plugins).map(([key, entries]) => {
    const info = (entries as Array<{ version?: string }>)[0] || {}
    const [name, marketplace] = key.split('@')

    let source: 'official' | '3rd-party' | 'custom' = '3rd-party'
    if (marketplace === 'claude-plugins-official') source = 'official'

    return {
      name,
      version: info.version || 'unknown',
      source,
      marketplace: marketplace || 'unknown',
    }
  })
}

function scanMcpServers(): McpServerInfo[] {
  const configFile = join(homedir(), '.claude.json')
  if (!existsSync(configFile)) return []

  const data = JSON.parse(readFileSync(configFile, 'utf8'))
  const servers = data.mcpServers || {}

  return Object.entries(servers).map(([name, config]) => {
    const cfg = config as Record<string, unknown>
    const transport = cfg.type === 'sse' || cfg.url
      ? 'sse'
      : 'stdio'

    let source: 'official' | '3rd-party' | 'custom' = '3rd-party'
    const officialServers = ['context7']
    if (officialServers.includes(name)) source = 'official'

    return {
      name,
      source,
      transport,
      notes: '',
    }
  })
}

function scanSkills(): SkillInfo[] {
  const pluginsCache = join(homedir(), '.claude', 'plugins', 'cache')
  if (!existsSync(pluginsCache)) return []

  const skills: SkillInfo[] = []
  const seen = new Set<string>()

  function walkSkillDirs(dir: string, pluginName: string, source: 'official' | '3rd-party') {
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
                plugin: pluginName,
                source,
              })
            }
          }
        }
      }
    } catch {
      // skip unreadable dirs
    }
  }

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
          const source = marketplace.name === 'claude-plugins-official'
            ? 'official' as const
            : '3rd-party' as const
          walkSkillDirs(skillsDir, plugin.name, source)
        }
      }
    }
  } catch {
    // skip
  }

  return skills
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
