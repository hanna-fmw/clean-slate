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

- `pnpm dev` - start dev server on localhost:3300
- `pnpm build` - build for production (static export)
- `pnpm sync` - scan ~/Documents/ and regenerate config/data.json
- `pnpm test` - run tests
- `pnpm lint` - lint

## Services

Vercel

## Notes

No database. Fully static. Data comes exclusively from CLEAN-SLATE.md files in project folders.
To add a new project to the dashboard, create a CLEAN-SLATE.md in that project's root.
