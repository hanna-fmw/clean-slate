# Clean Slate - Tasks

## Next up (start here tomorrow)

1. **Cloudflare Access (Zero Trust)** on ops.hosk.app - gates dashboard behind your Google accounts. Required before committing any real PII (chrome_profile values, emails, etc).
2. **Fill in data**: once Access is live, populate chrome_profile + account emails per project's CLEAN-SLATE.md. Hanna does this manually or asks Claude to help cross-reference docs/tasks.md.
3. **"Sign in with Google" indicator** on services that don't need a Nordpass lookup.
4. **Replace wordmark logos** (Vercel, Supabase, OpenRouter, Railway, Sanity) with official colored icon-marks - Hanna needs to source the official files from each brand's press page first.
5. **Data Completeness Audit** - sweep every card for TODO values.

Completed items (chrome_profile field, deployed_url chip) are kept below for reference.

---

## Add account/service mapping data

The dashboard should show which Chrome profile and login email to use for each project's services. Data collected 2026-05-01:

### Moiwak
- Vercel: admin@moiwak.com (Moiwak Chrome profile)
- Cloudflare: private Gmail (Personal Chrome profile)
- GitHub: hanna-fmw / github.com-personal (Personal Chrome profile)
- Google Admin: admin@moiwak.com at admin.google.com (Moiwak Chrome profile)
- Google Workspace email aliases: info@moiwak.com and support@moiwak.com route to admin@moiwak.com

### Stormfors (work)
- GitHub: StormforsAdmin (Work Chrome profile)

### Rookie (client project)
- Cloudflare: rookiework.dev@gmail.com (Hakan Chrome profile)
- Vercel: rookiework.dev@gmail.com (Hakan Chrome profile)
- GitHub: rookieworkdev (Hakan Chrome profile)
- Supabase: rookiework.dev@gmail.com (Hakan Chrome profile) - may be linked to Stormfors Supabase org

### SignalStack
- Google Cloud Console: private Gmail (Personal Chrome profile) - GCC project name: `signal-hub`
- GitHub: hanna-fmw / github.com-personal (Personal Chrome profile)
- Supabase: private Gmail (Personal Chrome profile) - project has MCP server `supabase-signalstack`
- DataForSEO: hanna@hosk.app
- Domain: hosk.app on Cloudflare (planned subdomains: seo.hosk.app, social.hosk.app)
- Google Ads MCC: "Hosk Digital" (ID 308-563-2115), private Gmail (Personal Chrome profile)
- Google Ads Developer Token: APPLIED 2026-05-02 (test token active, Basic Access pending - expect ~3 business days)

### RankSmile (paused)
- GitHub: adminranksmile-design (Chrome profile TBD)

## Data Completeness Audit

Many service and infrastructure cards have incomplete data. Examples:
- Supabase: projects listed but not linked to which account they belong to
- Multiple services still have "TODO" values for login_email, nordpass_hint
- Account details (emails, chrome profiles, use_for) missing across many cards
- Infrastructure items (Proxmox, Hetzner, NetBird) missing login credentials

Action: Go through every card in the dashboard, compare against actual account info, and fill in the gaps. Use the account mapping data above as a starting point.

## Add Chrome profile as a field in data model

DONE (2026-05-30):
- Service-level `chrome_profile` field already existed on `ServiceAccount` and is shown on service cards.
- Project-level `chrome_profile` added on `Project` (PR feat/chrome-profile). Declare in CLEAN-SLATE.md via either a `## Chrome Profile` H2 section, or a `Chrome Profile:` line inside the GitHub section. Shows as a chip next to the project name.

Follow-up: actually populate `chrome_profile` in each project's CLEAN-SLATE.md once Cloudflare Access is in place.

## Add "Sign in with Google" indicator

For services where the user uses Google sign-in (no separate password), flag this so it's clear no Nordpass lookup is needed. Use myaccount.google.com/permissions per Google account to populate this.

## Protect the dashboard with Cloudflare Zero Trust (Access)

The dashboard exposes personal account info, Chrome profile hints, and infrastructure details. Before sharing the deployed URL with anything, put it behind Cloudflare Access (Zero Trust) with an email-based identity policy so only allowed Google accounts can load the page. Steps:
- Add the domain to a Cloudflare Zero Trust team
- Create an Access application pointing at the Vercel deployment URL / custom domain
- Policy: allow only specific email addresses
- Verify the login wall appears in an incognito window before considering it done

## Surface deployed app URLs on project cards

DONE (2026-05-30, PR #5): `deployed_url` field added, auto-extracted from the Hosting section with explicit-label override. 3 of 12 projects matched; others correctly skipped as undeployed or VPN-only.

## Replace wordmark logos with official colored icon-mark variants

Several service cards (Vercel, Supabase, OpenRouter, Railway, Sanity) currently use wordmark SVGs that render as small/muted text on dark backgrounds. Find the official colored icon-mark variants from each brand's press / brand assets page and replace the files in `public/logos/`. Do not use third-party CDN mirrors or generated icons - download directly from the official brand site for each.
