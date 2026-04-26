# Clean Slate Dashboard - Design Spec

**Date:** 2026-04-26
**Status:** Draft
**Replaces:** 2026-04-06-personal-ops-dashboard-design.md

## Overview

A personal project dashboard that auto-syncs from ~/Documents/. One page, one list. Every project you work on, with everything you need to orient yourself: what it does, how it works, how to run it, where it's hosted, which accounts it uses. Dark, monospace, dense, good-looking.

## How Data Gets In

### CLEAN-SLATE.md (one per project)

Every project in ~/Documents/ gets a `CLEAN-SLATE.md` file in its root. This is the primary data source for the dashboard. The file contains structured info written by the developer (with Claude Code's help):

- **Description** - a few paragraphs explaining what the project does, how it works, what features it has. Written for someone who hasn't touched the project in months. Key terms in **bold** for scanning. This is the most important part.
- **Stack** - frameworks, languages, key libraries
- **Hosting** - where the app runs (Vercel, Coolify/Hetzner, local only, etc.) and where the database lives
- **GitHub** - which account (personal/work/rookie/ranksmile), SSH alias, repo URL
- **Run commands** - how to start dev server, build, test, any project-specific scripts
- **Services/accounts** - which Supabase account, which Vercel account, which Google Cloud project, etc. (whatever is relevant to the project)
- **Notes** - anything else worth knowing (deployment gotchas, renewal dates, special setup)

Format is plain markdown with H2 headers for each section. The sync script parses these headers to extract structured data.

### Sync script (npm run sync)

A Node.js script that:

1. Scans ~/Documents/ for directories containing a `CLEAN-SLATE.md`
2. Parses each `CLEAN-SLATE.md` by section headers
3. Also reads from each project (if present):
   - `package.json` - dependencies (auto-detects tech stack), scripts (run commands)
   - `.git/config` - remote URL, SSH alias
   - File existence checks: Dockerfile, prisma/, .env, etc.
4. Merges CLEAN-SLATE.md content with auto-detected data (CLEAN-SLATE.md wins on conflicts)
5. Reads filesystem metadata: folder last-modified date
6. Writes everything to `config/data.json`

The script is idempotent. Running it twice produces the same output. Projects without a CLEAN-SLATE.md are ignored.

### Auto-sync via macOS launchd

A launchd plist runs the sync script automatically (configurable interval, default daily). If data.json changed, it auto-commits and pushes. Vercel deploys on push. The dashboard stays current without any manual steps.

## Data Model (config/data.json)

```json
{
  "generated_at": "2026-04-26T14:30:00Z",
  "projects": [
    {
      "name": "JSON-LD Generator",
      "path": "~/Documents/json-ld-generator",
      "description": "Full description from CLEAN-SLATE.md...",
      "description_short": "First line/sentence for the collapsed row",
      "stack": ["Next.js 16", "TypeScript", "Prisma 7", "PostgreSQL", "Firecrawl", "OpenRouter"],
      "hosting": "Coolify on Stormfors Hetzner server. Domain: aeo.stormfors.ai",
      "database": "PostgreSQL on Coolify (same Hetzner server)",
      "github": {
        "account": "personal (hanna-fmw)",
        "ssh_alias": "github.com-personal",
        "repo_url": "https://github.com/hanna-fmw/json-ld-generator"
      },
      "run_commands": {
        "dev": "pnpm dev",
        "build": "pnpm build",
        "lint": "pnpm lint"
      },
      "services": ["Firecrawl", "OpenRouter (Gemini 2.0 Flash)", "Coolify"],
      "notes": "No local database - DB only on server. Uses Prisma 7 WASM client engine.",
      "last_modified": "2026-04-20T10:15:00Z"
    }
  ]
}
```

## UI

### Layout

Single page. No tabs, no sidebar, no navigation.

**Header area** at the top:
- "Clean Slate" title
- Brief intro text explaining what this dashboard is and how it works (this is also the entry for the Clean Slate project itself: its Vercel URL, local path, how to start it, how to add new projects)

**Project list** below the header:
- Alphabetically sorted
- Each row is a compact expandable item

### Collapsed row (always visible)

- **Project name** in monospace, bold
- **Short description** - first sentence, truncated, in regular text
- **Stack tags** - small inline labels (e.g. `Next.js` `Prisma` `PostgreSQL`)
- **Last modified** - relative time ("3 days ago", "2 months ago") shown subtly

### Expanded row (on click)

- **Full description** - multiple paragraphs with bold highlights, as written in CLEAN-SLATE.md
- **Hosting** - where the app and database run
- **GitHub** - account, SSH alias, clickable repo link
- **Run commands** - in a code-styled block with monospace font
- **Services/accounts** - listed if present
- **Notes** - any extra info
- **Path** - local filesystem path in monospace
- **Last modified** - exact date

### Visual style

- **Dark background** (#0a0a0a or similar near-black), **light text** (#e5e5e5)
- **Monospace font** (Geist Mono or JetBrains Mono) for: project names, paths, commands, stack tags
- **Sans-serif font** (Geist Sans or Inter) for: descriptions, labels, intro text
- **No colors** - white text, gray labels/borders, subtle hover states in slightly lighter gray
- **Dense spacing** - compact rows, tight padding, information-rich
- **No icons, no badges, no decorations** - just text and structure
- **Subtle borders** between rows (dark gray, nearly invisible)
- **Smooth expand/collapse animation** - just height transition, nothing fancy

## Tech Stack

- Next.js 16, App Router, server components, static generation
- TypeScript strict
- shadcn/ui (Collapsible) + Tailwind CSS
- Geist font family (ships with Next.js)
- Data from config/data.json read at build time
- Deployed on Vercel free tier

## Security

- `robots.txt` blocks all crawlers
- `<meta name="robots" content="noindex, nofollow">` in layout
- No auth (obscure subdomain + no secrets stored)
- No actual passwords or API keys anywhere - at most, hints about which account to look up

## What's NOT in scope

- Edit UI (edit CLEAN-SLATE.md files directly or ask Claude Code)
- Authentication
- Database
- Multiple pages or routing

## Maintenance

- **Adding a new project:** Create CLEAN-SLATE.md in the project folder. Sync picks it up automatically.
- **Updating a project:** Edit its CLEAN-SLATE.md. Sync picks up changes.
- **Removing a project:** Delete the folder (or remove its CLEAN-SLATE.md). Sync removes it from data.json.
- **Global CLAUDE.md reminder:** Add a note to always create CLEAN-SLATE.md for new projects.
- **Memory:** Add a memory to check that CLEAN-SLATE.md files are up-to-date periodically.
