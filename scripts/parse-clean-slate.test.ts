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

## Chrome Profile

Personal

## Skills, Agents & Plugins

### Skills

#### Content & Research
- content-write-article - Write long-form articles
- deep-research

#### Frontend
- \`frontend-design\` - distinctive UI
- **vercel:nextjs**: Next.js guidance

### Agents

- Frontend Developer - React/Next.js implementation
- Backend Architect

### Plugins

- compound-engineering
- vercel

### MCP Servers

- context7
- supabase-signalstack
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

  it('extracts deployed url from hosting prose', () => {
    expect(result.deployed_url).toBe('https://aeo.stormfors.ai')
  })

  it('extracts chrome_profile from dedicated section', () => {
    expect(result.chrome_profile).toBe('Personal')
  })

  it('extracts toolbox mentions with types, categories, and names', () => {
    expect(result.toolbox_mentions).toEqual([
      { type: 'skill', category: 'Content & Research', name: 'content-write-article' },
      { type: 'skill', category: 'Content & Research', name: 'deep-research' },
      { type: 'skill', category: 'Frontend', name: 'frontend-design' },
      { type: 'skill', category: 'Frontend', name: 'vercel:nextjs' },
      { type: 'agent', category: null, name: 'Frontend Developer' },
      { type: 'agent', category: null, name: 'Backend Architect' },
      { type: 'plugin', category: null, name: 'compound-engineering' },
      { type: 'plugin', category: null, name: 'vercel' },
      { type: 'mcp', category: null, name: 'context7' },
      { type: 'mcp', category: null, name: 'supabase-signalstack' },
    ])
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
    expect(result.toolbox_mentions).toEqual([])
    expect(result.deployed_url).toBe('')
    expect(result.chrome_profile).toBe('')
  })
})

describe('parseCleanSlate chrome_profile extraction', () => {
  it('extracts chrome_profile from a labeled line inside the GitHub section', () => {
    const md = `# X
## GitHub
Account: personal (hanna-fmw)
Chrome Profile: Personal
`
    const r = parseCleanSlate(md)
    expect(r.chrome_profile).toBe('Personal')
  })

  it('strips wrapping formatting on chrome_profile values', () => {
    const md = `# X
## Chrome Profile
**Work**
`
    const r = parseCleanSlate(md)
    expect(r.chrome_profile).toBe('Work')
  })
})

describe('parseCleanSlate deployed_url extraction', () => {
  it('uses explicit "Live at:" label over surrounding prose', () => {
    const md = `# X
## Hosting
Vercel free tier (something else.com mentioned in passing).
Live at: https://my-real-app.example.com
`
    const r = parseCleanSlate(md)
    expect(r.deployed_url).toBe('https://my-real-app.example.com')
  })

  it('extracts bare domain from prose', () => {
    const md = `# X
## Hosting
Coolify on Hetzner, live at kb.stormfors.ai.
`
    const r = parseCleanSlate(md)
    expect(r.deployed_url).toBe('https://kb.stormfors.ai')
  })

  it('skips private/VPN/local IPs', () => {
    const md = `# X
## Hosting
Coolify on VM2 (local IP 192.168.0.104, NetBird IP 100.109.251.80). Accessible at http://100.109.251.80/ via NetBird private network.
`
    const r = parseCleanSlate(md)
    expect(r.deployed_url).toBe('')
  })

  it('returns empty when marked not yet deployed', () => {
    const md = `# X
## Hosting
Web: Vercel (not yet deployed at app.example.com).
`
    const r = parseCleanSlate(md)
    expect(r.deployed_url).toBe('')
  })

  it('treats undeployed markers as whole words (no "future-proof" false positive)', () => {
    const md = `# X
## Hosting
Vercel, live at future-proof-app.example.com.
`
    const r = parseCleanSlate(md)
    expect(r.deployed_url).toBe('https://future-proof-app.example.com')
  })

  it('rejects URLs with embedded credentials by parsing via URL API', () => {
    const md = `# X
## Hosting
Live at https://attacker@192.168.0.5/
`
    const r = parseCleanSlate(md)
    expect(r.deployed_url).toBe('')
  })

  it('strips wrapping markdown formatting and trailing punctuation', () => {
    const md = `# X
## Hosting
App: Coolify on Hetzner server, live at **https://kb.stormfors.ai** (notes follow).
`
    const r = parseCleanSlate(md)
    expect(r.deployed_url).toBe('https://kb.stormfors.ai')
  })
})
