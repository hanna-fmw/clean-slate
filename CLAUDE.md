# Personal Ops Dashboard - Claude Code Instructions

## Project
A personal reference dashboard deployed on Vercel. Single URL to look up all projects, service accounts, and infrastructure. Not a password manager - stores hints/pointers to NordPass, never actual secrets.

## GitHub Account
Ask user which account to use when creating the repo (likely personal: hanna-fmw via github.com-personal).

## Tech Stack
- Next.js 16, App Router, server components, static generation
- shadcn/ui + Tailwind CSS
- TypeScript strict
- Data: config/data.json (read at build time)
- Deployment: Vercel free tier
- Domain: ops.hosk.app (or similar subdomain)

## Key Files
- `config/data.json` - ALL data lives here. Edit this to add/update projects, services, infrastructure.
- `docs/superpowers/specs/2026-04-06-personal-ops-dashboard-design.md` - approved design spec
- `docs/superpowers/plans/` - implementation plan (to be created next session)

## Data Model
Three sections: projects, services, infrastructure. See spec for full schema.
Many fields are marked TODO - user will fill these in as they remember them.

## Design Principles
- Most important info always visible without expanding
- Expanding adds detail, never essential info
- Dense and scannable, not beautiful
- No actual passwords or API keys ever stored - NordPass hints only

## robots.txt
Must block all crawlers - dashboard is private.

## .gitignore
Must include: .env, .env.local, CLAUDE.md, .claude/
