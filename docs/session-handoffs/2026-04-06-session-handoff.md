Continue building the Personal Ops Dashboard. This is a new Next.js 16 static app (no framework scaffolded yet) that serves as a personal reference dashboard - all projects, service accounts, and infrastructure in one private URL at ops.hosk.app.

**Current state:** main branch, clean, not pushed to GitHub yet (no repo created - ask user which GitHub account to use before creating).

**Where we left off:**
Design is fully approved. We have a draft config/data.json with all known projects and services (many fields marked TODO for the user to fill in over time). The next step is to scaffold the Next.js app and build the dashboard UI.

**Key files to read first:**
- `docs/superpowers/specs/2026-04-06-personal-ops-dashboard-design.md` - approved design spec (read this first)
- `config/data.json` - all data for the dashboard (projects, services, infrastructure)
- `CLAUDE.md` - project instructions

**Next step:** Invoke the writing-plans skill to create a detailed implementation plan before writing any code.

**Context the agent won't find in files:**
- User wants zero friction - the dashboard is read-only, data edited via JSON + push to deploy
- "Dense and scannable beats beautiful" is the core UI principle - most info visible without expanding
- No actual secrets are ever stored - only NordPass hints like "NordPass private - GitHub personal"
- Infrastructure tab is special: access URL must always be visible without expanding (that's what you need in a hurry)
- GitHub repo must be private, robots.txt must block all crawlers
- Domain will be a subdomain of hosk.app (e.g. ops.hosk.app), connected after Vercel deploy
- User will keep feeding more services/projects to add to data.json as they remember them - this is expected and ongoing
- Stormfors (not "stormforce") is the company where user works
- Z Project = recruiting agency website, keep name generic, never mention real client
- RankSmile is a subscription SaaS product (not specifically for Swedish businesses)
- SignalStack is the one targeting small Swedish businesses
