# Clean Slate

A personal project dashboard that auto-syncs from `~/Documents/`. Reads `CLEAN-SLATE.md` files from each project, plus `~/.claude/` for the Claude Code tools inventory, and renders a dense, monospace UI.

Live at [ops.hosk.app](https://ops.hosk.app).

## Local development

```bash
pnpm install
pnpm dev          # http://localhost:3300
pnpm sync:all     # regenerate config/data.json
pnpm test         # vitest
pnpm build        # production build
```

## Sync pipeline

`scripts/sync.ts` → `scripts/sync-tools.ts` → `scripts/build-toolbox.ts`, run sequentially by `pnpm sync:all` and by the launchd job (`~/Library/LaunchAgents/com.hosk.clean-slate-sync.plist`) every 6 hours. All three write to `config/data.json`.

| Step | Input | Output key |
|------|-------|------------|
| `sync.ts` | `~/Documents/*/CLEAN-SLATE.md` | `projects` |
| `sync-tools.ts` | `~/.claude/` (agents, plugins, MCP servers, skills) | `tools` |
| `build-toolbox.ts` | `projects` + `tools` + `toolbox-overrides.md` | `toolbox` |

## Tabs

- **Projects** — every project that has a `CLEAN-SLATE.md`
- **Services** — accounts and login info per service
- **Tools** — full inventory of installed Claude Code agents/plugins/MCP servers/skills
- **My Toolbox** — aggregated view of tools actually mentioned in projects' `CLEAN-SLATE.md` files (signal vs. noise)

## My Toolbox

Each project's `CLEAN-SLATE.md` should include a `## Skills, Agents & Plugins` section listing only the tools relevant to that project, grouped by H3 type and (optionally) H4 category:

```markdown
## Skills, Agents & Plugins

### Skills

#### Content & Research
- deep-research - multi-source fact-checked research
- content-write-article

### Agents
- Frontend Developer - React/Next.js implementation

### Plugins
- compound-engineering

### MCP Servers
- context7
```

`build-toolbox.ts` aggregates these mentions across all projects, joins each entry with the installed-tool inventory (so `origin` and `one_liner` come from frontmatter when available), and writes the result to `data.json#toolbox`. Frequency = how many projects list the tool. Sort order in the UI: pinned first, then `usage_count` desc, then name.

### Overrides

Create `~/system/clean-slate/toolbox-overrides.md` (gitignored) to:

- **Pin** tools you want surfaced regardless of usage count
- **Override one-liners** with your own phrasing
- **Normalize categories** so `Content/Research`, `content & research`, and `Content & Research` all merge

```markdown
## Pinned
- deep-research (skill)
- Frontend Developer (agent)

## One-liners
- deep-research: When you need a fact-checked multi-source report.

## Category map
- Content/Research -> Content & Research
- ui -> Frontend

## Defaults
- compound-engineering: Engineering Workflow
```

After editing the overrides file, run `pnpm sync:toolbox` (or wait for the next launchd run).
