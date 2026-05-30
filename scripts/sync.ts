import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { parseCleanSlate } from './parse-clean-slate'
import { detectFromPackageJson, detectFromGitConfig } from './detect-project'
import type { Project, DashboardData } from '../lib/types'

const DOCUMENTS_DIR = path.join(process.env.HOME ?? '', 'Documents')
const OUTPUT_PATH = path.join(__dirname, '..', 'config', 'data.json')
const CLEAN_SLATE_FILE = 'CLEAN-SLATE.md'

function getLastModified(dirPath: string): string {
  try {
    const result = execSync(
      'git log -1 --format=%aI 2>/dev/null',
      { cwd: dirPath, encoding: 'utf-8', timeout: 5000 }
    ).trim()
    if (result) return result
  } catch { /* not a git repo or no commits */ }
  try {
    const stat = fs.statSync(dirPath)
    return stat.mtime.toISOString()
  } catch {
    return ''
  }
}

function readFileIfExists(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return null
  }
}

function readJsonIfExists(filePath: string): Record<string, unknown> | null {
  const content = readFileIfExists(filePath)
  if (!content) return null
  try {
    return JSON.parse(content)
  } catch {
    return null
  }
}

function scanProject(dirPath: string, dirName: string): Project | null {
  const cleanSlatePath = path.join(dirPath, CLEAN_SLATE_FILE)
  const cleanSlateContent = readFileIfExists(cleanSlatePath)
  if (!cleanSlateContent) return null

  const parsed = parseCleanSlate(cleanSlateContent)

  const pkgJson = readJsonIfExists(path.join(dirPath, 'package.json'))
  const detected = pkgJson
    ? detectFromPackageJson(pkgJson as Parameters<typeof detectFromPackageJson>[0])
    : { run_commands: {}, stack: [] }

  const gitConfig = readFileIfExists(path.join(dirPath, '.git', 'config'))
  const gitInfo = gitConfig ? detectFromGitConfig(gitConfig) : { ssh_alias: '', repo_url: '', account: '' }

  return {
    name: parsed.name || dirName,
    path: `~/Documents/${dirName}`,
    description: parsed.description,
    description_short: parsed.description_short,
    stack: parsed.stack.length > 0 ? parsed.stack : detected.stack,
    hosting: parsed.hosting,
    database: parsed.database,
    github: {
      account: parsed.github.account || gitInfo.account,
      ssh_alias: parsed.github.ssh_alias || gitInfo.ssh_alias,
      repo_url: parsed.github.repo_url || gitInfo.repo_url,
    },
    run_commands: Object.keys(parsed.run_commands).length > 0
      ? parsed.run_commands
      : detected.run_commands,
    services: parsed.services,
    notes: parsed.notes,
    toolbox_mentions: parsed.toolbox_mentions,
    deployed_url: parsed.deployed_url,
    last_modified: getLastModified(dirPath),
  }
}

function main() {
  const entries = fs.readdirSync(DOCUMENTS_DIR, { withFileTypes: true })
  const projects: Project[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const dirPath = path.join(DOCUMENTS_DIR, entry.name)
    const project = scanProject(dirPath, entry.name)
    if (project) projects.push(project)
  }

  projects.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))

  const existing = readJsonIfExists(OUTPUT_PATH) as Partial<DashboardData> | null

  const data: DashboardData = {
    generated_at: new Date().toISOString(),
    projects,
    services: existing?.services ?? [],
    infrastructure: existing?.infrastructure ?? [],
    tools: existing?.tools,
    toolbox: existing?.toolbox,
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2) + '\n')

  console.log(`Synced ${projects.length} projects to config/data.json`)
}

main()
