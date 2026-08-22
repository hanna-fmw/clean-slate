# Architecture

How Clean Slate is hosted, how its data pipeline works, and why it needs no database.

## Hosting

Hosted on **Vercel**, production at https://ops.hosk.app. Deployed via the `vercel --prod` CLI, **not** GitHub auto-deploy (the private repo isn't wired to Vercel's git integration, so pushing to `main` does not deploy on its own). DNS for `hosk.app` is managed at Cloudflare; the `ops.hosk.app` record is currently DNS-only (not proxied), so traffic goes straight to Vercel.

## Data pipeline (the launchd sync job)

`launchd` is macOS's built-in task scheduler (the Mac equivalent of cron). A job registered as `com.hosk.clean-slate-sync` runs `scripts/auto-sync.sh` every **6 hours** (`StartInterval` 21600s). That script regenerates `config/data.json` from the `CLEAN-SLATE.md` files across `~/Documents/`. It runs locally on the Mac - nothing in the cloud.

The flow:

1. Every 6 hours, the launchd job reads all `CLEAN-SLATE.md` files and bakes them into a single file: `config/data.json`.
2. `data.json` is committed and ships with the deployment.
3. At render time, the app just imports that one JSON file. The data is "frozen" into the deployment.

You can also run it manually: `pnpm sync` (or `pnpm sync:all` for tools/toolbox too).

## Why no database

The website never reads the `.md` files live - it only reads the `data.json` snapshot baked in at deploy time. A database is for data that changes from user actions (logins, form submits, in-app edits). Clean Slate has none of that: it's read-only, and content changes only when a `CLEAN-SLATE.md` file is edited and re-synced. A static JSON file is the right fit; a database would be overkill.

**Trade-off:** edits only appear live after a sync + redeploy, not instantly. For a personal dashboard, that's acceptable.

## Access control

The dashboard is gated by **Cloudflare Access** (part of Cloudflare Zero Trust) - free, no code. The `ops.hosk.app` DNS record is proxied (orange cloud) so traffic flows through Cloudflare, and an Access application protects the hostname with an "Owner only" policy: ALLOW, Include Emails = the owner's address. Login is via email one-time code. Zone SSL/TLS mode is Full (strict), which is required for Vercel behind the Cloudflare proxy.

Manage it at: Cloudflare dashboard → **Zero Trust → Access control → Applications / Access policies**. Cloudflare **Tunnel** is a different, unrelated tool and is not used here.
