import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { parseCleanSlate } from './parse-clean-slate'
import { detectFromPackageJson, detectFromGitConfig } from './detect-project'
import { readApiKeys } from './parse-api-keys'
import type { Project, DashboardData } from '../lib/types'

const HOME_DIR = process.env.HOME ?? ''
const DOCUMENTS_DIR = path.join(HOME_DIR, 'Documents')
const PROJECTS_DIR = path.join(DOCUMENTS_DIR, 'projects')
const OUTPUT_PATH = path.join(__dirname, '..', 'config', 'data.json')
const API_KEYS_DIR = path.join(__dirname, '..', 'data', 'api-keys')
// Local, gitignored list of project names to exclude from data.json entirely
// (e.g. to hide projects during a demo). Names never reach the deployed app.
const HIDDEN_PATH = path.join(__dirname, '..', 'config', 'hidden-projects.json')
const CLEAN_SLATE_FILE = 'CLEAN-SLATE.md'

// Directories never worth descending into when hunting for CLEAN-SLATE.md
const IGNORE_DIRS = new Set([
  'node_modules', '.next', 'dist', 'build', '.turbo', '.vercel', 'coverage', 'out',
])

export function displayPath(absPath: string): string {
  return HOME_DIR && absPath.startsWith(HOME_DIR) ? '~' + absPath.slice(HOME_DIR.length) : absPath
}

// Recursively collect directories that contain a CLEAN-SLATE.md. A directory
// with one is treated as a project root, so we don't descend further into it.
export function findProjectRoots(rootDir: string, depth = 0, results: string[] = []): string[] {
  if (depth > 6) return results
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(rootDir, { withFileTypes: true })
  } catch {
    return results
  }
  if (entries.some((e) => e.isFile() && e.name === CLEAN_SLATE_FILE)) {
    results.push(rootDir)
    return results
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (IGNORE_DIRS.has(entry.name) || entry.name.startsWith('.')) continue
    findProjectRoots(path.join(rootDir, entry.name), depth + 1, results)
  }
  return results
}

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

function scanProject(dirPath: string): Project | null {
  const dirName = path.basename(dirPath)
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
    path: displayPath(dirPath),
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
    chrome_profile: parsed.chrome_profile,
    last_modified: getLastModified(dirPath),
  }
}

// Collect candidate project directories: every top-level folder in ~/Documents
// (one level, as before), plus a recursive scan of ~/Documents/projects.
function collectProjectDirs(): string[] {
  const dirs = new Set<string>()

  for (const entry of fs.readdirSync(DOCUMENTS_DIR, { withFileTypes: true })) {
    if (entry.isDirectory()) dirs.add(path.join(DOCUMENTS_DIR, entry.name))
  }

  for (const dir of findProjectRoots(PROJECTS_DIR)) dirs.add(dir)

  return [...dirs]
}

function readHiddenNames(): string[] {
  const content = readFileIfExists(HIDDEN_PATH)
  if (!content) return []
  try {
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed.filter((n): n is string => typeof n === 'string') : []
  } catch {
    return []
  }
}

export function filterHidden(projects: Project[], hiddenNames: string[]): Project[] {
  if (hiddenNames.length === 0) return projects
  const hidden = new Set(hiddenNames.map((n) => n.toLowerCase().trim()))
  return projects.filter((p) => !hidden.has(p.name.toLowerCase().trim()))
}

function main() {
  const projects: Project[] = []
  const byName = new Map<string, Project>()

  for (const dirPath of collectProjectDirs()) {
    const project = scanProject(dirPath)
    if (!project) continue

    // A project can transiently exist in two places during migration into
    // ~/Documents/projects. Dedupe by name, keeping the most recently modified.
    const key = project.name.toLowerCase()
    const existing = byName.get(key)
    if (existing) {
      const winner = (project.last_modified ?? '') > (existing.last_modified ?? '') ? project : existing
      byName.set(key, winner)
      console.warn(`Duplicate project name "${project.name}" - keeping ${winner.path}`)
      continue
    }
    byName.set(key, project)
  }

  projects.push(...byName.values())
  projects.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))

  const hiddenNames = readHiddenNames()
  const visible = filterHidden(projects, hiddenNames)
  const hiddenCount = projects.length - visible.length

  const existing = readJsonIfExists(OUTPUT_PATH) as Partial<DashboardData> | null

  const apiKeys = readApiKeys(API_KEYS_DIR)

  const data: DashboardData = {
    generated_at: new Date().toISOString(),
    projects: visible,
    services: existing?.services ?? [],
    infrastructure: existing?.infrastructure ?? [],
    tools: existing?.tools,
    toolbox: existing?.toolbox,
    reference: existing?.reference,
    api_keys: apiKeys,
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2) + '\n')

  if (hiddenCount > 0) {
    console.log(`Hiding ${hiddenCount} project(s): ${hiddenNames.join(', ')}`)
  }
  console.log(`Synced ${visible.length} projects to config/data.json`)
}

if (require.main === module) main()
