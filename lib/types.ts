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

export interface DashboardData {
  generated_at: string
  projects: Project[]
}
