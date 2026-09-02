# AI Hub Project

## Description

A two-part workspace for building AI learning and training material. The parent folder contains two subprojects that serve different purposes but share the same goal: helping people learn to use AI well.

**ai-hub/** is a private content workspace for preparing and developing AI training material, standards, and workshops. It is organized by audience skill tier (beginner, intermediate, advanced) and covers learning material creation, standards and protocols, workshop planning, skill development, and tooling resources. It is a document/markdown workspace, not a deployable application.

**ai-hub-platform/** is a **Next.js 16 web application** for creating, managing, and presenting AI training material. It provides a dashboard view and a presentation mode. The app uses server components by default, Tailwind CSS v4, shadcn/ui, Zod for validation, Framer Motion for animations, and next-themes for dark/light mode toggling. A Prisma-backed Postgres database is planned but not yet connected.

## Stack

Next.js 16, React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui, Zod, Framer Motion, next-themes, Lucide React, pnpm, Playwright, Prettier

## Hosting

App (ai-hub-platform): Vercel Hobby plan. Deploy via CLI only - `vercel --prod` from the `ai-hub-platform/` directory (no GitHub auto-deploy on free plan with private repo). Database: Postgres on Hetzner via Coolify - planned but not yet set up.

## GitHub

Account: personal (hanna-fmw)
SSH alias: github.com-personal
Repo: https://github.com/hanna-fmw/ai-hub-platform (private) - git is initialized inside `ai-hub-platform/`, not at the project root

## Run Commands

From `ai-hub-platform/`:
- `pnpm dev` - start local dev server
- `pnpm build` - production build
- `pnpm start` - run production build locally
- `pnpm lint` - run ESLint
- `vercel --prod` - deploy to Vercel production

## Services

Vercel, Coolify, Hugging Face (planned for LLM features)

## Skills, Agents & Plugins

### Skills

**Content & Research:**
- `/yt-transcript` - Transcribe a YouTube video into structured near-transcript prose and save to the knowledge base
- `/yt-research-pipeline` - End-to-end research: find YouTube videos on a topic, feed into NotebookLM, analyze, and generate deliverables (podcasts, flashcards, quizzes)
- `/youtube-search` - Search YouTube for videos with structured results, metadata, and engagement metrics
- `/research-write-article` - Research a topic (web or from provided docs/PDFs/URLs) and write a long-form article saved to `ai-hub/`
- `/notebooklm` - Full programmatic access to Google NotebookLM: create notebooks, add sources, generate artifacts, download results

**Design & Presentations:**
- `/frontend-slides` - Create animation-rich HTML presentations from scratch or by converting PowerPoint files
- `/frontend-design` - UI/frontend design skill (via compound-engineering plugin)
- `/compound-engineering:gemini-imagegen` - Generate images using Gemini

**Other:**
- `/create-pdf` - Generate PDF documents

### Agents

**Design:** Brand Guardian, Image Prompt Engineer, Inclusive Visuals Specialist, UI Designer, UX Architect, UX Researcher, Visual Storyteller, Whimsy Injector

**Marketing & Content:** Content Creator, Social Media Strategist, Growth Hacker, Instagram Curator, TikTok Strategist, Twitter Engager, Reddit Community Builder, App Store Optimizer, Feedback Synthesizer, Trend Researcher

### Plugins

- **frontend-slides** - HTML presentation builder

### MCP Servers

Google Drive, NotebookLM (nano-banana)

## Notes

The `ai-hub/` content workspace has no git repo or deployable code - it is a local markdown workspace only. The `ai-hub-platform/` app is the deployable product. The two are separate: `ai-hub/` holds source material and standards that the platform may eventually surface. Content in `ai-hub/` is organized by skill tier - always consider which tier content targets (beginner / intermediate / advanced) when creating material.

## Key Documents

- **Leadfront Dev Architecture v5** (May 22, 2026) — full architecture guide reconciling v4 walkthrough notes with the live internal infrastructure portal and the walkthrough 3 recording: `ai-hub/personal-development/research/infrastructure-architecture/infrastructure-architecture-article-v5-may-2026.html`
