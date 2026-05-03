# Clean Slate Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dark, monospace project dashboard that auto-syncs from ~/Documents/ by reading CLEAN-SLATE.md files, displaying projects in a compact expandable list.

**Architecture:** Single-page Next.js 16 static app. A sync script scans ~/Documents/ for CLEAN-SLATE.md files, merges with auto-detected data (package.json, git remote), and writes config/data.json. The Next.js app reads data.json at build time and renders a dark, dense, expandable project list. A macOS launchd job runs the sync automatically.

**Tech Stack:** Next.js 16 (App Router, static generation), TypeScript, shadcn/ui (Collapsible), Tailwind CSS v4, Geist + Geist Mono fonts, Vitest, pnpm.

---

## File Map

| File | Responsibility |
|---|---|
| `app/layout.tsx` | Root layout. Dark theme, Geist fonts, metadata (noindex) |
| `app/page.tsx` | Server component. Reads data, renders header + project list |
| `app/globals.css` | Tailwind v4 import, dark theme CSS variables, custom styles |
| `app/robots.ts` | Blocks all crawlers |
| `lib/types.ts` | TypeScript interfaces for Project and DashboardData |
| `lib/data.ts` | Reads and returns typed data from config/data.json |
| `lib/format.ts` | Utility: relative time formatting ("3 days ago") |
| `lib/format.test.ts` | Tests for relative time formatting |
| `components/expandable-row.tsx` | `'use client'` - Collapsible wrapper with expand/collapse |
| `components/project-row.tsx` | Server component - collapsed summary + expanded detail for a project |
| `components/header.tsx` | Server component - title, intro text, Clean Slate project info |
| `scripts/sync.ts` | Sync script: scan ~/Documents/, parse CLEAN-SLATE.md, write data.json |
| `scripts/parse-clean-slate.ts` | Parser: CLEAN-SLATE.md markdown to structured sections |
| `scripts/parse-clean-slate.test.ts` | Tests for the markdown parser |
| `scripts/detect-project.ts` | Auto-detection: package.json, git remote, file checks |
| `scripts/detect-project.test.ts` | Tests for auto-detection |
| `com.hosk.clean-slate-sync.plist` | macOS launchd job for auto-sync |

---

## Task 1: Scaffold Next.js app

**Files:**
- Create: all Next.js scaffold files in project root
- Modify: `app/globals.css` (strip defaults)
- Modify: `app/page.tsx` (placeholder)

- [ ] **Step 1: Scaffold into existing directory**

```bash
cd /Users/hanna/Documents/clean-slate
pnpm create next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-pnpm
```

When prompted about existing files (CLAUDE.md, config/, docs/), keep them. Accept all defaults. This creates `app/`, `public/`, `package.json`, `tsconfig.json`, `next.config.ts`, etc. Next.js 16 ships with Tailwind v4 and Geist fonts by default.

- [ ] **Step 2: Clean up default content**

```bash
rm -f public/next.svg public/vercel.svg public/file.svg public/globe.svg public/window.svg
```

Replace `app/page.tsx` with a placeholder:

```tsx
export default function Home() {
  return <main className="p-6"><p>Loading...</p></main>
}
```

- [ ] **Step 3: Strip globals.css to essentials**

Replace `app/globals.css` with just the Tailwind v4 import and dark theme setup:

```css
@import "tailwindcss";

:root {
  --background: #0a0a0a;
  --foreground: #e5e5e5;
  --muted: #888888;
  --border: #1a1a1a;
  --hover: #111111;
  --tag-bg: #161616;
  --tag-text: #a0a0a0;
  --link: #888888;
  --link-hover: #cccccc;
}

body {
  background-color: var(--background);
  color: var(--foreground);
}
```

- [ ] **Step 4: Verify the app runs**

```bash
pnpm dev
```

Open http://localhost:3000. Verify dark background, light "Loading..." text. Stop the server.

- [ ] **Step 5: Install dev dependencies**

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom
```

- [ ] **Step 6: Add vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

Add test scripts to `package.json` (inside `"scripts"`):

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 app with Tailwind v4 and Vitest"
```

---

## Task 2: Install and configure shadcn/ui

**Files:**
- Create: `components/ui/collapsible.tsx` (auto-generated)
- Create: `components.json` (shadcn config)
- Modify: `app/globals.css` (shadcn may update)

- [ ] **Step 1: Initialize shadcn**

```bash
pnpm dlx shadcn@latest init
```

Choose: Default style, Neutral base color, yes to CSS variables. This creates `components.json` and `lib/utils.ts`.

- [ ] **Step 2: Add collapsible component**

```bash
pnpm dlx shadcn@latest add collapsible
```

This creates `components/ui/collapsible.tsx`.

- [ ] **Step 3: Verify the dev server still runs**

```bash
pnpm dev
```

Open http://localhost:3000. Confirm dark background still works. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: add shadcn/ui with collapsible component"
```

---

## Task 3: TypeScript types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Create types file**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add TypeScript types for dashboard data model"
```

---

## Task 4: Data loader and relative time formatter

**Files:**
- Create: `lib/data.ts`
- Create: `lib/format.ts`
- Create: `lib/format.test.ts`

- [ ] **Step 1: Write failing test for formatRelativeTime()**

Create `lib/format.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { formatRelativeTime } from './format'

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-26T12:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns "today" for the current date', () => {
    expect(formatRelativeTime('2026-04-26T10:00:00Z')).toBe('today')
  })

  it('returns "yesterday" for 1 day ago', () => {
    expect(formatRelativeTime('2026-04-25T10:00:00Z')).toBe('yesterday')
  })

  it('returns "3 days ago" for 3 days ago', () => {
    expect(formatRelativeTime('2026-04-23T10:00:00Z')).toBe('3 days ago')
  })

  it('returns "2 weeks ago" for 14 days ago', () => {
    expect(formatRelativeTime('2026-04-12T10:00:00Z')).toBe('2 weeks ago')
  })

  it('returns "1 month ago" for 35 days ago', () => {
    expect(formatRelativeTime('2026-03-22T10:00:00Z')).toBe('1 month ago')
  })

  it('returns "3 months ago" for 95 days ago', () => {
    expect(formatRelativeTime('2026-01-21T10:00:00Z')).toBe('3 months ago')
  })

  it('returns empty string for empty input', () => {
    expect(formatRelativeTime('')).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test
```

Expected: FAIL - `Cannot find module './format'`

- [ ] **Step 3: Implement formatRelativeTime()**

Create `lib/format.ts`:

```ts
export function formatRelativeTime(isoDate: string): string {
  if (!isoDate) return ''
  const now = new Date()
  const then = new Date(isoDate)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 14) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  const months = Math.floor(diffDays / 30)
  return `${months} month${months === 1 ? '' : 's'} ago`
}
```

- [ ] **Step 4: Run tests - verify they pass**

```bash
pnpm test
```

Expected: all 7 tests PASS.

- [ ] **Step 5: Create data loader**

Create `lib/data.ts`:

```ts
import rawData from '@/config/data.json'
import type { DashboardData } from './types'

export function getData(): DashboardData {
  return rawData as DashboardData
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/format.ts lib/format.test.ts lib/data.ts
git commit -m "feat: add data loader and relative time formatter with tests"
```

---

## Task 5: Sync script - CLEAN-SLATE.md parser

**Files:**
- Create: `scripts/parse-clean-slate.ts`
- Create: `scripts/parse-clean-slate.test.ts`

- [ ] **Step 1: Write failing test for parseCleanSlate()**

Create `scripts/parse-clean-slate.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { parseCleanSlate } from './parse-clean-slate'

const SAMPLE = `# JSON-LD Generator

## Description

A tool for generating **JSON-LD structured data** and **llms.txt files** for websites.
You start by entering a company's URL and basic info.

## Stack

Next.js 16, TypeScript, Prisma 7, PostgreSQL, Firecrawl, OpenRouter

## Hosting

Coolify on Stormfors Hetzner server. Domain: aeo.stormfors.ai
Database: PostgreSQL on same Hetzner server.

## GitHub

Account: personal (hanna-fmw)
SSH alias: github.com-personal
Repo: https://github.com/hanna-fmw/json-ld-generator

## Run Commands

- \`pnpm dev\` - start dev server
- \`pnpm build\` - build for production
- \`pnpm lint\` - lint

## Services

Firecrawl, OpenRouter (Gemini 2.0 Flash), Coolify

## Notes

No local database - DB only on server.
Uses Prisma 7 WASM client engine.
`

describe('parseCleanSlate', () => {
  const result = parseCleanSlate(SAMPLE)

  it('extracts the project name from h1', () => {
    expect(result.name).toBe('JSON-LD Generator')
  })

  it('extracts the full description', () => {
    expect(result.description).toContain('JSON-LD structured data')
    expect(result.description).toContain("entering a company's URL")
  })

  it('extracts the short description (first sentence)', () => {
    expect(result.description_short).toBe(
      'A tool for generating JSON-LD structured data and llms.txt files for websites.'
    )
  })

  it('extracts stack as an array', () => {
    expect(result.stack).toEqual([
      'Next.js 16', 'TypeScript', 'Prisma 7', 'PostgreSQL', 'Firecrawl', 'OpenRouter'
    ])
  })

  it('extracts hosting', () => {
    expect(result.hosting).toContain('Coolify on Stormfors Hetzner')
  })

  it('extracts database from hosting section', () => {
    expect(result.database).toContain('PostgreSQL on same Hetzner')
  })

  it('extracts github info', () => {
    expect(result.github.account).toBe('personal (hanna-fmw)')
    expect(result.github.ssh_alias).toBe('github.com-personal')
    expect(result.github.repo_url).toBe('https://github.com/hanna-fmw/json-ld-generator')
  })

  it('extracts run commands', () => {
    expect(result.run_commands).toEqual({
      'pnpm dev': 'start dev server',
      'pnpm build': 'build for production',
      'pnpm lint': 'lint',
    })
  })

  it('extracts services as an array', () => {
    expect(result.services).toEqual([
      'Firecrawl', 'OpenRouter (Gemini 2.0 Flash)', 'Coolify'
    ])
  })

  it('extracts notes', () => {
    expect(result.notes).toContain('No local database')
    expect(result.notes).toContain('Prisma 7 WASM')
  })
})

describe('parseCleanSlate with missing sections', () => {
  const minimal = `# My Project

## Description

A simple tool.
`
  const result = parseCleanSlate(minimal)

  it('handles missing sections with defaults', () => {
    expect(result.name).toBe('My Project')
    expect(result.description).toBe('A simple tool.')
    expect(result.stack).toEqual([])
    expect(result.hosting).toBe('')
    expect(result.database).toBe('')
    expect(result.github).toEqual({ account: '', ssh_alias: '', repo_url: '' })
    expect(result.run_commands).toEqual({})
    expect(result.services).toEqual([])
    expect(result.notes).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test
```

Expected: FAIL - `Cannot find module './parse-clean-slate'`

- [ ] **Step 3: Implement parseCleanSlate()**

Create `scripts/parse-clean-slate.ts`:

```ts
interface ParsedProject {
  name: string
  description: string
  description_short: string
  stack: string[]
  hosting: string
  database: string
  github: { account: string; ssh_alias: string; repo_url: string }
  run_commands: Record<string, string>
  services: string[]
  notes: string
}

export function parseCleanSlate(markdown: string): ParsedProject {
  const sections = splitSections(markdown)

  const name = extractH1(markdown)
  const description = stripBold(sections['description'] ?? '').trim()
  const description_short = extractFirstSentence(description)
  const stack = parseCommaSeparated(sections['stack'] ?? '')
  const hosting = extractHosting(sections['hosting'] ?? '')
  const database = extractDatabase(sections['hosting'] ?? '')
  const github = parseGitHub(sections['github'] ?? '')
  const run_commands = parseRunCommands(sections['run commands'] ?? '')
  const services = parseCommaSeparated(sections['services'] ?? '')
  const notes = (sections['notes'] ?? '').trim()

  return {
    name, description, description_short, stack, hosting, database,
    github, run_commands, services, notes,
  }
}

function splitSections(markdown: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const lines = markdown.split('\n')
  let currentKey = ''
  let currentContent: string[] = []

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/)
    if (h2Match) {
      if (currentKey) {
        sections[currentKey] = currentContent.join('\n').trim()
      }
      currentKey = h2Match[1].toLowerCase()
      currentContent = []
    } else if (currentKey) {
      currentContent.push(line)
    }
  }
  if (currentKey) {
    sections[currentKey] = currentContent.join('\n').trim()
  }
  return sections
}

function extractH1(markdown: string): string {
  const match = markdown.match(/^# (.+)$/m)
  return match ? match[1].trim() : ''
}

function stripBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1')
}

function extractFirstSentence(text: string): string {
  const match = text.match(/^(.+?\.)\s/)
  return match ? match[1] : text.split('\n')[0]
}

function parseCommaSeparated(text: string): string[] {
  if (!text.trim()) return []
  return text.trim().split(',').map(s => s.trim()).filter(Boolean)
}

function extractHosting(text: string): string {
  const lines = text.split('\n').filter(l => !l.toLowerCase().startsWith('database:'))
  return lines.join('\n').trim()
}

function extractDatabase(text: string): string {
  const dbLine = text.split('\n').find(l => l.toLowerCase().startsWith('database:'))
  return dbLine ? dbLine.replace(/^database:\s*/i, '').trim() : ''
}

function parseGitHub(text: string): { account: string; ssh_alias: string; repo_url: string } {
  const result = { account: '', ssh_alias: '', repo_url: '' }
  for (const line of text.split('\n')) {
    const lower = line.toLowerCase()
    if (lower.startsWith('account:')) result.account = line.replace(/^account:\s*/i, '').trim()
    else if (lower.startsWith('ssh alias:')) result.ssh_alias = line.replace(/^ssh alias:\s*/i, '').trim()
    else if (lower.startsWith('repo:')) result.repo_url = line.replace(/^repo:\s*/i, '').trim()
  }
  return result
}

function parseRunCommands(text: string): Record<string, string> {
  const commands: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const match = line.match(/^-\s+`(.+?)`\s*[-:]\s*(.+)$/)
    if (match) {
      commands[match[1]] = match[2].trim()
    }
  }
  return commands
}
```

- [ ] **Step 4: Run tests - verify they pass**

```bash
pnpm test
```

Expected: all 12 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/parse-clean-slate.ts scripts/parse-clean-slate.test.ts
git commit -m "feat: add CLEAN-SLATE.md parser with tests"
```

---

## Task 6: Sync script - project auto-detection

**Files:**
- Create: `scripts/detect-project.ts`
- Create: `scripts/detect-project.test.ts`

- [ ] **Step 1: Write failing test for detectFromPackageJson()**

Create `scripts/detect-project.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { detectFromPackageJson, detectFromGitConfig, extractStack } from './detect-project'

describe('extractStack', () => {
  it('extracts known frameworks from dependencies', () => {
    const deps = {
      'next': '16.1.0',
      'react': '19.0.0',
      'react-dom': '19.0.0',
      '@prisma/client': '7.0.0',
      'tailwindcss': '4.0.0',
      'typescript': '5.5.0',
    }
    const stack = extractStack(deps)
    expect(stack).toContain('Next.js')
    expect(stack).toContain('Prisma')
    expect(stack).toContain('TypeScript')
    expect(stack).not.toContain('react-dom')
  })

  it('returns empty array for empty deps', () => {
    expect(extractStack({})).toEqual([])
  })
})

describe('detectFromPackageJson', () => {
  it('extracts scripts and stack from package.json content', () => {
    const pkg = {
      scripts: { dev: 'next dev', build: 'next build', test: 'vitest run' },
      dependencies: { next: '16.1.0', react: '19.0.0' },
      devDependencies: { typescript: '5.5.0' },
    }
    const result = detectFromPackageJson(pkg)
    expect(result.run_commands).toEqual({
      'pnpm dev': 'next dev',
      'pnpm build': 'next build',
      'pnpm test': 'vitest run',
    })
    expect(result.stack).toContain('Next.js')
    expect(result.stack).toContain('TypeScript')
  })
})

describe('detectFromGitConfig', () => {
  it('extracts remote URL and SSH alias from git config', () => {
    const config = `[core]
\trepositoryformatversion = 0
[remote "origin"]
\turl = git@github.com-personal:hanna-fmw/json-ld-generator.git
\tfetch = +refs/heads/*:refs/remotes/origin/*
`
    const result = detectFromGitConfig(config)
    expect(result.ssh_alias).toBe('github.com-personal')
    expect(result.repo_url).toBe('https://github.com/hanna-fmw/json-ld-generator')
    expect(result.account).toBe('hanna-fmw')
  })

  it('handles standard github.com remote', () => {
    const config = `[remote "origin"]
\turl = git@github.com:someuser/somerepo.git
`
    const result = detectFromGitConfig(config)
    expect(result.ssh_alias).toBe('github.com')
    expect(result.repo_url).toBe('https://github.com/someuser/somerepo')
    expect(result.account).toBe('someuser')
  })

  it('returns empty for no remote', () => {
    const config = `[core]\n\tbare = false\n`
    const result = detectFromGitConfig(config)
    expect(result.ssh_alias).toBe('')
    expect(result.repo_url).toBe('')
    expect(result.account).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test
```

Expected: FAIL - `Cannot find module './detect-project'`

- [ ] **Step 3: Implement detection functions**

Create `scripts/detect-project.ts`:

```ts
const KNOWN_STACK: Record<string, string> = {
  'next': 'Next.js',
  'react': 'React',
  'vue': 'Vue',
  'express': 'Express',
  '@prisma/client': 'Prisma',
  'prisma': 'Prisma',
  'drizzle-orm': 'Drizzle',
  '@supabase/supabase-js': 'Supabase',
  'stripe': 'Stripe',
  'openai': 'OpenAI',
  'langchain': 'LangChain',
  '@langchain/langgraph': 'LangGraph',
  'tailwindcss': 'Tailwind CSS',
  'typescript': 'TypeScript',
  'expo': 'Expo',
  'react-native': 'React Native',
  'docker-compose': 'Docker',
  'pg': 'PostgreSQL',
  '@neondatabase/serverless': 'Neon',
  'mongoose': 'MongoDB',
  'redis': 'Redis',
  'ioredis': 'Redis',
}

export function extractStack(deps: Record<string, string>): string[] {
  const found = new Set<string>()
  for (const dep of Object.keys(deps)) {
    if (KNOWN_STACK[dep]) found.add(KNOWN_STACK[dep])
  }
  return Array.from(found).sort()
}

export function detectFromPackageJson(pkg: {
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}): { run_commands: Record<string, string>; stack: string[] } {
  const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }
  const stack = extractStack(allDeps)

  const run_commands: Record<string, string> = {}
  const usefulScripts = ['dev', 'build', 'start', 'test', 'lint', 'sync', 'seed', 'migrate']
  for (const [name, cmd] of Object.entries(pkg.scripts ?? {})) {
    if (usefulScripts.includes(name)) {
      run_commands[`pnpm ${name}`] = cmd
    }
  }

  return { run_commands, stack }
}

export function detectFromGitConfig(configContent: string): {
  ssh_alias: string
  repo_url: string
  account: string
} {
  const match = configContent.match(/url\s*=\s*git@([^:]+):([^/]+)\/(.+?)(?:\.git)?\s*$/m)
  if (!match) return { ssh_alias: '', repo_url: '', account: '' }

  const [, host, user, repo] = match
  return {
    ssh_alias: host,
    repo_url: `https://github.com/${user}/${repo}`,
    account: user,
  }
}
```

- [ ] **Step 4: Run tests - verify they pass**

```bash
pnpm test
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/detect-project.ts scripts/detect-project.test.ts
git commit -m "feat: add project auto-detection from package.json and git config"
```

---

## Task 7: Sync script - main orchestrator

**Files:**
- Create: `scripts/sync.ts`
- Modify: `package.json` (add sync script)

- [ ] **Step 1: Create the sync script**

Create `scripts/sync.ts`:

```ts
import fs from 'fs'
import path from 'path'
import { parseCleanSlate } from './parse-clean-slate'
import { detectFromPackageJson, detectFromGitConfig } from './detect-project'
import type { Project, DashboardData } from '../lib/types'

const DOCUMENTS_DIR = path.join(process.env.HOME ?? '', 'Documents')
const OUTPUT_PATH = path.join(__dirname, '..', 'config', 'data.json')
const CLEAN_SLATE_FILE = 'CLEAN-SLATE.md'

function getLastModified(dirPath: string): string {
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

  const data: DashboardData = {
    generated_at: new Date().toISOString(),
    projects,
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2) + '\n')

  console.log(`Synced ${projects.length} projects to config/data.json`)
}

main()
```

- [ ] **Step 2: Add sync script to package.json**

Add to `"scripts"` in `package.json`:

```json
"sync": "npx tsx scripts/sync.ts"
```

- [ ] **Step 3: Install tsx**

```bash
pnpm add -D tsx
```

- [ ] **Step 4: Create a test CLEAN-SLATE.md for the clean-slate project itself**

Create `/Users/hanna/Documents/clean-slate/CLEAN-SLATE.md`:

```markdown
# Clean Slate

## Description

A personal **project dashboard** that auto-syncs from ~/Documents/. Shows every project you work on in a compact, expandable list with everything you need to orient yourself: what the project does, its tech stack, how to run it, where it's hosted, and which accounts it uses.

The dashboard reads from **CLEAN-SLATE.md** files placed in each project's root folder. A **sync script** scans ~/Documents/, parses these files along with package.json and git config, and writes the combined data to config/data.json. The Next.js app reads this at build time and renders a **dark, monospace, dense UI** - no fluff, just information.

A **macOS launchd job** runs the sync automatically on a schedule. When data.json changes, it auto-commits and pushes, and **Vercel deploys** the update. You never have to remember to sync manually.

## Stack

Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui

## Hosting

Vercel free tier. Domain: ops.hosk.app (or similar subdomain of hosk.app).

## GitHub

Account: personal (hanna-fmw)
SSH alias: github.com-personal
Repo: https://github.com/hanna-fmw/clean-slate

## Run Commands

- `pnpm dev` - start dev server on localhost:3000
- `pnpm build` - build for production (static export)
- `pnpm sync` - scan ~/Documents/ and regenerate config/data.json
- `pnpm test` - run tests
- `pnpm lint` - lint

## Services

Vercel

## Notes

No database. Fully static. Data comes exclusively from CLEAN-SLATE.md files in project folders.
To add a new project to the dashboard, create a CLEAN-SLATE.md in that project's root.
```

- [ ] **Step 5: Run the sync script**

```bash
pnpm sync
```

Expected: outputs "Synced 1 projects to config/data.json" (only clean-slate has a CLEAN-SLATE.md so far). Inspect `config/data.json` to verify the output matches the expected data model.

- [ ] **Step 6: Commit**

```bash
git add scripts/sync.ts package.json pnpm-lock.yaml CLEAN-SLATE.md config/data.json
git commit -m "feat: add sync script that scans ~/Documents/ for CLEAN-SLATE.md files"
```

---

## Task 8: UI - ExpandableRow component

**Files:**
- Create: `components/expandable-row.tsx`

- [ ] **Step 1: Create ExpandableRow**

Create `components/expandable-row.tsx`:

```tsx
'use client'

import { useState } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface ExpandableRowProps {
  summary: React.ReactNode
  detail: React.ReactNode
}

export function ExpandableRow({ summary, detail }: ExpandableRowProps) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-3 py-3 px-4 text-left hover:bg-[var(--hover)] transition-colors cursor-pointer border-b border-[var(--border)]">
        {summary}
        <span
          className={`ml-auto text-[var(--muted)] text-xs shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          &#9662;
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-5 pt-3 border-b border-[var(--border)] bg-[var(--hover)]">
        {detail}
      </CollapsibleContent>
    </Collapsible>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/expandable-row.tsx
git commit -m "feat: add ExpandableRow component with collapsible animation"
```

---

## Task 9: UI - ProjectRow component

**Files:**
- Create: `components/project-row.tsx`

- [ ] **Step 1: Create ProjectRow**

Create `components/project-row.tsx`:

```tsx
import { ExpandableRow } from './expandable-row'
import { formatRelativeTime } from '@/lib/format'
import type { Project } from '@/lib/types'

function ProjectSummary({ project }: { project: Project }) {
  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <span className="font-mono font-bold text-sm shrink-0">{project.name}</span>
      <span className="text-sm text-[var(--muted)] truncate hidden sm:block">
        {project.description_short}
      </span>
      <div className="flex gap-1.5 shrink-0 ml-auto mr-2 flex-wrap justify-end">
        {project.stack.slice(0, 4).map((s) => (
          <span
            key={s}
            className="text-[11px] font-mono bg-[var(--tag-bg)] text-[var(--tag-text)] px-1.5 py-0.5 rounded"
          >
            {s}
          </span>
        ))}
        {project.stack.length > 4 && (
          <span className="text-[11px] text-[var(--muted)]">+{project.stack.length - 4}</span>
        )}
      </div>
      {project.last_modified && (
        <span className="text-[11px] text-[var(--muted)] shrink-0 hidden md:block">
          {formatRelativeTime(project.last_modified)}
        </span>
      )}
    </div>
  )
}

function ProjectDetail({ project }: { project: Project }) {
  return (
    <div className="space-y-4 text-sm">
      {project.description && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">Description</p>
          <div
            className="text-[var(--foreground)] leading-relaxed whitespace-pre-line"
            dangerouslySetInnerHTML={{
              __html: project.description
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br />')
            }}
          />
        </div>
      )}

      {project.hosting && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">Hosting</p>
          <p>{project.hosting}</p>
        </div>
      )}

      {project.database && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">Database</p>
          <p>{project.database}</p>
        </div>
      )}

      {project.github.repo_url && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">GitHub</p>
          <p className="font-mono text-xs">
            {project.github.account && <span>{project.github.account}</span>}
            {project.github.ssh_alias && <span className="text-[var(--muted)]"> ({project.github.ssh_alias})</span>}
          </p>
          <a
            href={project.github.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-[var(--link)] hover:text-[var(--link-hover)] transition-colors"
          >
            {project.github.repo_url}
          </a>
        </div>
      )}

      {Object.keys(project.run_commands).length > 0 && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">Run Commands</p>
          <div className="bg-[var(--background)] rounded px-3 py-2 font-mono text-xs space-y-1">
            {Object.entries(project.run_commands).map(([cmd, desc]) => (
              <div key={cmd} className="flex gap-4">
                <span className="text-[var(--foreground)] shrink-0">{cmd}</span>
                <span className="text-[var(--muted)]">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {project.services.length > 0 && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">Services</p>
          <div className="flex flex-wrap gap-1.5">
            {project.services.map((s) => (
              <span key={s} className="text-xs font-mono bg-[var(--tag-bg)] text-[var(--tag-text)] px-1.5 py-0.5 rounded">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {project.notes && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">Notes</p>
          <p className="text-[var(--muted)] whitespace-pre-line">{project.notes}</p>
        </div>
      )}

      <div className="flex gap-6 text-xs text-[var(--muted)] pt-2 border-t border-[var(--border)]">
        <span className="font-mono">{project.path}</span>
        {project.last_modified && (
          <span>Modified: {new Date(project.last_modified).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  )
}

export function ProjectRow({ project }: { project: Project }) {
  return (
    <ExpandableRow
      summary={<ProjectSummary project={project} />}
      detail={<ProjectDetail project={project} />}
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/project-row.tsx
git commit -m "feat: add ProjectRow component with summary and expandable detail"
```

---

## Task 10: Header component

**Files:**
- Create: `components/header.tsx`

- [ ] **Step 1: Create Header**

Create `components/header.tsx`:

```tsx
export function Header({ projectCount }: { projectCount: number }) {
  return (
    <header className="mb-8">
      <h1 className="font-mono text-lg font-bold tracking-tight mb-2">clean-slate</h1>
      <p className="text-sm text-[var(--muted)] leading-relaxed max-w-2xl">
        Personal project dashboard. {projectCount} projects synced from ~/Documents/.
        Each project has a CLEAN-SLATE.md in its root - the sync script reads them
        and rebuilds this page. Run <code className="font-mono text-[var(--foreground)]">pnpm sync</code> to
        refresh, or let the launchd job do it automatically.
      </p>
    </header>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/header.tsx
git commit -m "feat: add Header component with project count and instructions"
```

---

## Task 11: Main page, layout, robots

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Create: `app/robots.ts`

- [ ] **Step 1: Update app/layout.tsx**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Clean Slate',
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Update app/page.tsx**

Replace `app/page.tsx`:

```tsx
import { getData } from '@/lib/data'
import { Header } from '@/components/header'
import { ProjectRow } from '@/components/project-row'

export default function Home() {
  const { projects } = getData()

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Header projectCount={projects.length} />
      <div>
        {projects.map((project) => (
          <ProjectRow key={project.name} project={project} />
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Create app/robots.ts**

Create `app/robots.ts`:

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', disallow: '/' },
  }
}
```

- [ ] **Step 4: Run dev server and verify**

```bash
pnpm dev
```

Open http://localhost:3000. Verify:
- Dark background (#0a0a0a)
- "clean-slate" header in monospace
- Project list showing projects from data.json
- Rows expand on click showing full details
- Monospace font on project names, paths, commands
- Sans-serif on descriptions
- Stack tags visible in collapsed rows
- Run commands displayed in code-styled block when expanded
- No color - just whites and grays

Fix any TypeScript or runtime errors before proceeding.

- [ ] **Step 5: Run tests**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/ components/header.tsx
git commit -m "feat: wire up main page with layout, header, project list, and robots"
```

---

## Task 12: macOS launchd auto-sync

**Files:**
- Create: `com.hosk.clean-slate-sync.plist`
- Create: `scripts/auto-sync.sh`

- [ ] **Step 1: Create the auto-sync shell script**

Create `scripts/auto-sync.sh`:

```bash
#!/bin/bash
set -e

PROJECT_DIR="$HOME/Documents/clean-slate"
cd "$PROJECT_DIR"

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

pnpm sync

if git diff --quiet config/data.json; then
  echo "No changes detected."
  exit 0
fi

git add config/data.json
git commit -m "chore: auto-sync project data from ~/Documents/"
git push
echo "Synced and pushed."
```

Make it executable:

```bash
chmod +x scripts/auto-sync.sh
```

- [ ] **Step 2: Create launchd plist**

Create `com.hosk.clean-slate-sync.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.hosk.clean-slate-sync</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/hanna/Documents/clean-slate/scripts/auto-sync.sh</string>
    </array>
    <key>StartInterval</key>
    <integer>21600</integer>
    <key>StandardOutPath</key>
    <string>/tmp/clean-slate-sync.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/clean-slate-sync.log</string>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
```

This runs every 6 hours (21600 seconds) and on login.

- [ ] **Step 3: Install the launchd job**

```bash
cp com.hosk.clean-slate-sync.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.hosk.clean-slate-sync.plist
```

- [ ] **Step 4: Verify it runs**

```bash
launchctl list | grep clean-slate
cat /tmp/clean-slate-sync.log
```

Expected: job is listed, log shows "No changes detected." or "Synced and pushed."

- [ ] **Step 5: Commit**

```bash
git add com.hosk.clean-slate-sync.plist scripts/auto-sync.sh
git commit -m "feat: add macOS launchd job for automatic sync every 6 hours"
```

---

## Task 13: Deploy to Vercel

**Files:** no code changes

- [ ] **Step 1: Confirm GitHub account**

Ask user: "Which GitHub account for the clean-slate repo? Likely personal (hanna-fmw)?"

Wait for answer.

- [ ] **Step 2: Create private GitHub repo and push**

Using the personal account (adjust if user says otherwise):

```bash
gh auth switch --user hanna-fmw
gh repo create clean-slate --private --source . --push
git remote set-url origin git@github.com-personal:hanna-fmw/clean-slate.git
git config user.name "Hanna Hosk"
git config user.email "<noreply github email>"
git push -u origin feat/scaffold
```

- [ ] **Step 3: Open pull request**

```bash
gh pr create --title "feat: initial Clean Slate dashboard" --body "$(cat <<'EOF'
## Summary
- Dark, monospace project dashboard that auto-syncs from ~/Documents/
- Reads CLEAN-SLATE.md files from project folders + auto-detects from package.json and git
- Compact expandable list: name, description, stack tags in collapsed view; full details on expand
- Sync script (pnpm sync) + macOS launchd job for automatic updates every 6 hours
- Static generation, deployed on Vercel, robots.txt blocks crawlers

## Test plan
- [ ] pnpm test passes (parser, formatter, detection tests)
- [ ] pnpm sync generates valid config/data.json
- [ ] Dev server shows project list with dark theme
- [ ] Rows expand/collapse with full project details
- [ ] GitHub links are clickable
- [ ] Run commands display in code block
- [ ] robots.txt returns Disallow: /

Generated with Claude Code
EOF
)"
```

Wait for user to review and merge.

- [ ] **Step 4: Import to Vercel and deploy**

1. Go to vercel.com, import the clean-slate repo
2. No environment variables needed (static app)
3. Deploy

- [ ] **Step 5: Connect domain**

In Vercel project settings > Domains, add `ops.hosk.app`.
In Cloudflare DNS for hosk.app, add CNAME: `ops` -> `cname.vercel-dns.com`.

- [ ] **Step 6: Verify live**

Open https://ops.hosk.app. Verify the dashboard loads with all synced projects.

---

## Task 14: Add CLEAN-SLATE.md to remaining projects

**Files:** CLEAN-SLATE.md files in various ~/Documents/ project folders (not in this repo)

- [ ] **Step 1: Scan each project and draft CLEAN-SLATE.md files**

For each project directory in ~/Documents/ that has a package.json or CLAUDE.md, read the codebase and write a CLEAN-SLATE.md following the format established for JSON-LD Generator. Show the user each draft for review before saving.

Projects to cover (from current data.json and ~/Documents/ listing):
- ranksmile
- signalstack
- tracker
- z-site-global
- baby-claw
- openClaw
- rn-health-tracker
- json-ld-generator
- social-media-generator
- company-kb
- ai-hub-project

- [ ] **Step 2: Run sync to pick them all up**

```bash
cd /Users/hanna/Documents/clean-slate
pnpm sync
```

Verify data.json now contains all projects.

- [ ] **Step 3: Commit updated data.json**

```bash
git add config/data.json
git commit -m "feat: sync all projects from ~/Documents/ CLEAN-SLATE.md files"
```

---

## Task 15: Add CLEAN-SLATE.md reminder to global CLAUDE.md

**Files:**
- Modify: `~/.claude/CLAUDE.md`

- [ ] **Step 1: Add reminder section**

Add to the global CLAUDE.md under a new heading:

```markdown
## CLEAN-SLATE.md (Project Dashboard)
- Every project in ~/Documents/ should have a `CLEAN-SLATE.md` in its root
- This file feeds the Clean Slate dashboard (ops.hosk.app)
- When creating a new project, always create a CLEAN-SLATE.md with: Description, Stack, Hosting, GitHub, Run Commands, Services, Notes
- Format: H1 for project name, H2 for each section, plain markdown
- The sync script at ~/Documents/clean-slate/ reads these files automatically
```

- [ ] **Step 2: Add a memory to check CLEAN-SLATE.md files periodically**

Save a memory to remind about keeping CLEAN-SLATE.md files up to date.

- [ ] **Step 3: Commit (no commit needed - this is outside the repo)**

No git commit needed for global CLAUDE.md changes.

---

## Self-Review

**Spec coverage:**
- Auto-sync from ~/Documents/ via CLEAN-SLATE.md: Tasks 5, 6, 7
- Dark monospace UI with expandable list: Tasks 8, 9, 10, 11
- Stack tags, run commands, hosting, GitHub in expanded view: Task 9
- Alphabetical sorting: Task 7 (sync script sorts)
- Header with Clean Slate project info: Task 10
- robots.txt and noindex: Task 11
- launchd auto-sync: Task 12
- Vercel deployment: Task 13
- CLEAN-SLATE.md for all existing projects: Task 14
- Global CLAUDE.md reminder: Task 15
- Services/accounts included when available: Task 9 (services section in detail)
- Last modified shown: Task 9 (relative time in summary, exact date in detail)
- No auth, no database, no edit UI: confirmed not in plan

**Placeholder scan:** No TBD, TODO, or vague steps found. All code is complete.

**Type consistency:**
- `Project` and `DashboardData` defined in Task 3, used consistently in Tasks 7, 9, 11
- `parseCleanSlate()` returns shape matching `Project` fields (Task 5)
- `detectFromPackageJson()` and `detectFromGitConfig()` return shapes merged in Task 7
- `formatRelativeTime()` defined in Task 4, used in Task 9
- `getData()` defined in Task 4, used in Task 11
