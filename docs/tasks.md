# Clean Slate - Tasks

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

## Add Chrome profile as a field in data model

Each service entry should include which Chrome profile to open. This is the main pain point - knowing which browser profile to use for which service.

## Add "Sign in with Google" indicator

For services where the user uses Google sign-in (no separate password), flag this so it's clear no Nordpass lookup is needed. Use myaccount.google.com/permissions per Google account to populate this.
