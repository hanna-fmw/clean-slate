# Personal Ops Dashboard - Design Spec

**Date:** 2026-04-06
**Status:** Approved

## Overview

A personal reference dashboard for tracking active projects, service accounts, and infrastructure. The goal is a single URL you can open and immediately orient yourself - which accounts, which logins, which services, where passwords live. Not a password manager. Not a task tracker. A fast, scannable reference sheet deployed as a web app.

## Core Principle

The most important information is always visible without expanding. Expanding adds detail, not essential info. Dense and scannable beats beautiful.

---

## Architecture & Stack

- **Framework:** Next.js 16, App Router, server components, static generation (data read at build time)
- **UI:** shadcn/ui + Tailwind CSS
- **Language:** TypeScript
- **Data source:** `config/data.json` in the repo root - single file, human-editable, versioned in git
- **Deployment:** Vercel free tier, auto-deploys on push to main
- **Domain:** subdomain of hosk.app (e.g. `ops.hosk.app`)
- **Repo:** private GitHub repo
- **Indexing:** `robots.txt` blocking all crawlers
- **Auth:** none in v1 - obscure subdomain + no actual secrets stored is sufficient
- **Database:** none - fully static

---

## Data Model

All data lives in `config/data.json`. Structure below.

### Projects

```json
{
  "projects": [
    {
      "name": "string",
      "status": "active | paused | archived",
      "description": "1-2 sentences: what this project does",
      "local_path": "~/Documents/projects/example",
      "github_alias": "github.com-personal",
      "github_account": "hanna-fmw",
      "chrome_profile": "Personal",
      "supabase_account": "email used for Supabase account",
      "services": ["Supabase-personal", "OpenRouter", "Railway", "Home server"],
      "roles": [
        {
          "name": "Admin",
          "email": "login email",
          "nordpass_hint": "NordPass private - ProjectName folder"
        }
      ],
      "links": [
        { "label": "Live app", "url": "https://..." },
        { "label": "Vercel", "url": "https://..." },
        { "label": "Repo", "url": "https://..." }
      ],
      "last_reviewed": "2026-04-06"
    }
  ]
}
```

### Services & Accounts

```json
{
  "services": [
    {
      "name": "GitHub",
      "category": "Development",
      "subscription": false,
      "receipt_email": null,
      "accounts": [
        {
          "alias": "personal",
          "username": "hanna-fmw",
          "email": "login email",
          "use_for": "Personal projects",
          "nordpass_hint": "NordPass private - GitHub"
        }
      ],
      "last_reviewed": "2026-04-06"
    }
  ]
}
```

Categories: Development / Hosting / AI & APIs / Storage / Design / Communication / Finance

### Infrastructure

```json
{
  "infrastructure": [
    {
      "name": "Proxmox",
      "access_url": "https://...",
      "login_email": "email",
      "nordpass_hint": "NordPass private - Proxmox",
      "notes": "Home server. Access via Netbird if remote.",
      "sub_resources": [
        { "name": "VM name", "purpose": "what it runs" }
      ],
      "last_reviewed": "2026-04-06"
    },
    {
      "name": "Domains",
      "access_url": "https://...",
      "login_email": "email",
      "nordpass_hint": "NordPass private - Cloudflare",
      "notes": "Managed via Cloudflare",
      "sub_resources": [
        { "name": "hosk.app", "purpose": "personal projects and tools" }
      ],
      "last_reviewed": "2026-04-06"
    }
  ]
}
```

---

## UI Layout

### Navigation

Three tabs at the top of the page: **Projects** / **Services & Accounts** / **Infrastructure**. Client-side tab switching, no page loads.

### Projects Tab

List view. Each row visible without expanding:
- Project name
- Status badge (active / paused / archived)
- 1-line description
- Service tags (e.g. `Supabase-personal` `OpenRouter` `Railway`)
- Staleness dot (orange) if last_reviewed > 90 days ago

Expanding a row (inline, no modal) reveals:
- Local path (plain text, not a link)
- GitHub alias + account
- Chrome profile
- Supabase account
- Roles: each with email + NordPass hint
- Links as clickable buttons

### Services & Accounts Tab

List view. Each row visible without expanding:
- Service name
- Category badge
- Number of accounts
- Subscription indicator + receipt email if paid
- Staleness dot if stale

Expanding reveals:
- Each account: alias, username/email, use_for, NordPass hint

### Infrastructure Tab

List view. Each system shows **without expanding**:
- Name
- Access URL (always visible and clickable - this is what you need in a hurry)
- Login email
- Staleness dot if stale

Expanding reveals:
- NordPass hint
- Notes
- Sub-resources (VMs, domains) as a compact nested list

---

## Staleness

- `last_reviewed` date on every entry
- Orange dot shown on entries not reviewed in 90+ days
- No banners or noise - just the dot
- Updated by editing `data.json` and pushing

---

## Maintenance Workflow

- **Adding/updating entries:** Edit `config/data.json`, push to main, Vercel deploys in ~30 seconds
- **Assisted updates:** Ask Claude Code to add or update entries - it knows where the file is
- **Subscription audit:** One-time Gmail scan (via Gmail MCP) to surface all receipt emails and discover forgotten subscriptions
- **Staleness check:** Orange dots surface what needs attention

---

## What Is NOT Stored

- Actual passwords
- Actual API keys
- Any secrets in plaintext

All sensitive values are replaced with NordPass hints pointing to the correct vault and folder.

---

## Future Considerations (not in scope for v1)

- Edit UI in the dashboard (form-based, backed by Supabase)
- Master password + client-side AES-256 encryption for storing actual secrets
- GitHub Actions to check for new projects in a watched folder
