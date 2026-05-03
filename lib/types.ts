export interface ProjectGitHub {
  account: string
  ssh_alias: string
  repo_url: string
}

export interface Project {
  name: string
  path: string
  description: string
  description_short: string
  stack: string[]
  hosting: string
  database: string
  github: ProjectGitHub
  run_commands: Record<string, string>
  services: string[]
  notes: string
  last_modified: string
}

export interface ServiceAccount {
  alias: string
  username: string
  email: string
  chrome_profile: string
  use_for: string
  nordpass_hint: string
}

export interface Service {
  name: string
  category: string
  url: string
  subscription: boolean
  receipt_email: string
  accounts: ServiceAccount[]
  notes: string
  last_reviewed: string
}

export interface InfraResource {
  name: string
  purpose: string
}

export interface Infrastructure {
  name: string
  access_url: string
  login_email: string
  nordpass_hint: string
  notes: string
  sub_resources: InfraResource[]
  last_reviewed: string
}

export type ToolSource = 'official' | '3rd-party' | 'custom'

export interface AgentInfo {
  name: string
  description: string
  source: ToolSource
  category: string
}

export interface PluginInfo {
  name: string
  version: string
  source: ToolSource
  marketplace: string
}

export interface McpServerInfo {
  name: string
  source: ToolSource
  transport: string
  notes: string
}

export interface SkillInfo {
  name: string
  plugin: string
  source: ToolSource
}

export interface ToolsInventory {
  synced_at: string
  agents: AgentInfo[]
  plugins: PluginInfo[]
  mcp_servers: McpServerInfo[]
  skills: SkillInfo[]
}

export interface DashboardData {
  generated_at: string
  projects: Project[]
  services: Service[]
  infrastructure: Infrastructure[]
  tools?: ToolsInventory
}
