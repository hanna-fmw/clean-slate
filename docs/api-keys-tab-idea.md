# API Keys Tab — Feature Idea

**Status:** Idea, not yet implemented. Build after `browse-me` project is done.

## Problem

API keys are scattered across many projects. No single place to answer:
- Which providers do I have a key for?
- Which projects use which key?
- Where do I manage billing / spend limits for each provider?
- Have I set spend limits to avoid surprise charges?
- Is the key safely stored, or rotting in a forgotten `.env`?

Result: when starting a new project, I dig through old `.env` files hunting for a reusable key, or worse, create a new one and forget about it.

## Non-goal: do NOT store the actual keys in Clean Slate

Clean Slate is a Next.js app on Vercel — a public-ish surface. Storing keys here, even encrypted, is a bad pattern:
- Decryption key has to live somewhere; if that leaks, the vault leaks
- One misconfigured route, one accidental commit, one bug = total breach
- Would be building a worse version of 1Password from scratch

**The actual secret keys belong in 1Password.** Clean Slate stores only non-secret metadata.

## Concept: Clean Slate as the *map*, 1Password as the *vault*

A new sidebar tab "API Keys" listing every provider I have a key for, with:

| Field | Example |
|---|---|
| Provider | Anthropic |
| 1Password reference | `Private / Anthropic – Personal` |
| Projects using it | signalstack, browse-me, ranksmile |
| Billing / usage URL | https://console.anthropic.com/settings/billing |
| API keys management URL | https://console.anthropic.com/settings/keys |
| Spend limit set? | Yes — $20/mo |
| Last rotated | 2026-03-15 |
| Notes | Free tier, hard cap at $20 |

Click the 1Password reference → opens 1Password to that entry (deep link: `onepassword://...` or just text I copy).

Click billing URL → opens provider's billing page in a new tab.

## Data shape

Same flat-file pattern as the rest of Clean Slate. New file:

```
~/_system/clean-slate/data/api-keys.md
```

Or per-provider files in `data/api-keys/anthropic.md`, `data/api-keys/openai.md`, etc.

Markdown with frontmatter, parsed at sync time:

```markdown
---
provider: Anthropic
onePasswordRef: "Private / Anthropic – Personal"
billingUrl: https://console.anthropic.com/settings/billing
keysUrl: https://console.anthropic.com/settings/keys
spendLimit: "$20/mo"
spendLimitSet: true
lastRotated: 2026-03-15
projects:
  - signalstack
  - browse-me
  - ranksmile
---

Free tier with hard cap. Reused across all personal projects.
```

## UI sketch

Sidebar gets a new section "API Keys" alongside Projects. List view:

```
Anthropic          3 projects    $20/mo cap ✓    [billing] [keys] [1P]
OpenAI             1 project     No limit ⚠      [billing] [keys] [1P]
OpenRouter         2 projects    $10/mo cap ✓    [billing] [keys] [1P]
Resend             4 projects    Free tier ✓     [billing] [keys] [1P]
Supabase           5 projects    Free tier ✓     [billing] [keys] [1P]
```

Warning indicator (⚠) when `spendLimitSet: false` — visual nudge to go set one.

Click a row → detail view with all metadata, projects using it, notes.

## Bonus features (later)

- **Cross-reference with project pages** — each project's CLEAN-SLATE.md already lists Services it uses. The API Keys tab could read both directions: from key to projects, and from project to keys.
- **Rotation reminders** — `lastRotated` older than N months → flag it.
- **Unused key detection** — key has zero projects listed → flag for deletion.
- **Provider catalog** — small library of common providers with billing URLs pre-filled, so adding a new key is just "pick provider, paste 1Password ref."

## Prerequisite: one-time audit

Before this tab is useful, run a one-time audit script across `~/Documents/projects/` that:
1. Greps all `.env*` files
2. Identifies which providers each project uses (by env var name patterns: `ANTHROPIC_*`, `OPENAI_*`, `SUPABASE_*`, etc.)
3. Outputs a redacted inventory (provider, project, last 4 chars of key, file path) to a local audit file
4. From that audit, I populate Clean Slate's `data/api-keys/` files and move real keys into 1Password

Audit script is a one-off — not part of Clean Slate itself.

## Why this matters

- **Single source of truth for "what do I have"** without ever holding a secret
- **Faster project bootstrap** — new project needs Anthropic? Open Clean Slate, see I have a key, open 1Password ref, paste into `.env`. Done in 30 seconds.
- **Safer** — no more creating duplicate keys because I lost the old one. No more forgetting to set spend limits.
- **Auditable** — at a glance, which providers don't have spend limits? Which keys are old?

## Order of work

1. Finish `browse-me` project first
2. Run the one-time audit script across all projects
3. Set up 1Password vault structure for keys (one entry per provider)
4. Add `data/api-keys/` schema + sync script to Clean Slate
5. Add API Keys sidebar tab and list/detail views
6. Iterate: rotation reminders, unused detection, etc.
