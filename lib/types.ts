export interface ProjectGitHub {
  account: string
  ssh_alias: string
  repo_url: string
}

export type ToolboxType = 'skill' | 'agent' | 'plugin' | 'mcp'

export interface ToolboxMention {
  type: ToolboxType
  category: string | null
  name: string
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
  toolbox_mentions: ToolboxMention[]
  deployed_url: string
  chrome_profile: string
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

export type ToolSource = 'anthropic' | '3rd-party' | 'custom'

export interface ToolOrigin {
  source: ToolSource
  repo_url?: string
  plugin?: string
}

export interface AgentInfo {
  name: string
  description: string
  origin: ToolOrigin
  category: string
}

export interface PluginInfo {
  name: string
  version: string
  origin: ToolOrigin
  marketplace: string
}

export interface McpServerInfo {
  name: string
  origin: ToolOrigin
  transport: string
  notes: string
}

export interface SkillInfo {
  name: string
  description: string
  origin: ToolOrigin
  plugin: string
}

export interface ToolsInventory {
  synced_at: string
  agents: AgentInfo[]
  plugins: PluginInfo[]
  mcp_servers: McpServerInfo[]
  skills: SkillInfo[]
}

export interface ToolboxEntry {
  name: string
  type: ToolboxType
  category: string
  usage_count: number
  projects: string[]
  origin: ToolSource | 'unknown'
  one_liner: string
  pinned: boolean
  installed: boolean
}

export interface ReferenceItem {
  name: string
  path: string
  description: string
  kind: 'file' | 'dir'
}

export interface ReferenceSubdir {
  name: string
  path: string
  items: ReferenceItem[]
}

export interface ReferenceGroup {
  name: string
  path: string
  description: string
  items: ReferenceItem[]
  subdirs: ReferenceSubdir[]
}

export interface ReferenceInventory {
  synced_at: string
  root: string
  groups: ReferenceGroup[]
}

export interface ApiKeyEntry {
  provider: string
  vault_ref: string
  vault_url: string
  billingUrl: string
  keysUrl: string
  spendLimit: string
  spendLimitSet: boolean
  lastRotated: string
  projects: string[]
  notes: string
}

export interface DashboardData {
  generated_at: string
  projects: Project[]
  services: Service[]
  infrastructure: Infrastructure[]
  tools?: ToolsInventory
  toolbox?: ToolboxEntry[]
  reference?: ReferenceInventory
  api_keys?: ApiKeyEntry[]
}
