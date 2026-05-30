# Clean Slate

## Description

A personal **project dashboard** that auto-syncs from ~/Documents/. Shows every project you work on in a compact, expandable list with everything you need to orient yourself: what the project does, its tech stack, how to run it, where it's hosted, and which accounts it uses.

The dashboard reads from **CLEAN-SLATE.md** files placed in each project's root folder. A **sync script** scans ~/Documents/, parses these files along with package.json and git config, and writes the combined data to config/data.json. The Next.js app reads this at build time and renders a **dense, monospace UI** with dark/light mode - no fluff, just information.

A **tools inventory** section tracks all Claude Code agents, plugins, MCP servers, and skills installed locally, with source tagging (official/3rd-party/custom). A separate sync script scans ~/.claude/ for this data.

A **My Toolbox** view aggregates the per-project "Skills, Agents & Plugins" sections from each CLEAN-SLATE.md into a single, glanceable reference grouped by purpose - showing only the tools actually used across projects (not everything installed), with frequency counts, project lists, and origin tags. A manual overrides file (`toolbox-overrides.md`) pins favorites, normalizes categories, and supplies custom one-liners.

A **macOS launchd job** runs both syncs automatically every 6 hours. When data.json changes, it auto-commits and pushes, and **Vercel deploys** the update. You never have to remember to sync manually.

A **scheduled remote agent** (Claude Code routine) runs weekly to check if CLEAN-SLATE.md files across projects have become stale relative to their git history, and flags what needs updating.

## Stack

Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, next-themes

## Hosting

Vercel free tier. Domain: ops.hosk.app.

## GitHub

Account: personal (hanna-fmw)
SSH alias: github.com-personal
Repo: https://github.com/hanna-fmw/clean-slate

## Run Commands

- `pnpm dev` - start dev server on localhost:3300
- `pnpm build` - build for production (static export)
- `pnpm sync` - scan ~/Documents/ and regenerate project data in config/data.json
- `pnpm sync:tools` - scan ~/.claude/ and regenerate tools inventory in config/data.json
- `pnpm sync:toolbox` - aggregate per-project Skills/Agents/Plugins mentions into the toolbox view
- `pnpm sync:all` - run all three syncs in order
- `pnpm test` - run tests
- `pnpm lint` - lint

## Services

Vercel, Claude Code Routines (scheduled remote agent for staleness checks)

## Notes

No database. Fully static. Data comes from CLEAN-SLATE.md files in project folders and ~/.claude/ config files.
To add a new project to the dashboard, create a CLEAN-SLATE.md in that project's root.
Launchd plist: ~/Library/LaunchAgents/com.hosk.clean-slate-sync.plist
