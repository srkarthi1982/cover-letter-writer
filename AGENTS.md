⚠️ Mandatory: AI agents must read this file before writing or modifying any code.

# AGENTS.md

This file complements the workspace-level Ansiversa-workspace/AGENTS.md (source of truth). Read workspace first.

MANDATORY: After completing each task, update this repo’s AGENTS.md Task Log (newest-first) before marking the task done.

## Scope
- Mini-app repository for 'cover-letter-writer' within Ansiversa.
- Follow the parent-app contract from workspace AGENTS; do not invent architecture.

## Phase Status
- Freeze phase active: no new features unless explicitly approved.
- Allowed: verification, bug fixes, cleanup, behavior locking, and documentation/process hardening.

## Architecture & Workflow Reminders
- Prefer consistency over speed; match existing naming, spacing, and patterns.
- Keep Astro/Alpine patterns aligned with ecosystem standards (one global store pattern per app, actions via astro:actions, SSR-first behavior).
- Do not refactor or change established patterns without explicit approval.
- If unclear, stop and ask Karthikeyan/Astra before proceeding.

## Where To Look First
- Start with src/, src/actions/, src/stores/, and local docs/ if present.
- Review this repo's existing AGENTS.md Task Log history before making changes.

## Task Log (Recent)
- 2026-04-08 Rolled out Landing Page Standard V1.1: replaced the minimal landing with the approved Ansiversa product-storytelling landing, kept the protected DB-backed cover-letter drafting positioning aligned to app-spec reality, and revalidated `npm run typecheck`, `npm run build`, `/`, and CTA sign-in flow.
- 2026-03-30 Populated app-spec.md with implementation-aligned V1 documentation based on freeze verification.
- 2026-03-30 Initialized app-spec.md using standard V1 template from web repo.
- 2026-03-29 Repaired freeze-blocking cover letter workspace issues after browser verification: fixed Alpine store bootstrap on `/app`, replaced invalid detail-record 500s with safe `/app` redirect behavior, cleared stale empty Turso schema state and re-pushed the current Astro DB schema, then revalidated with `npm run db:push`, `npm run typecheck`, `npm run build`, and authenticated browser flow (create/edit/favorite/archive/restore + invalid route safety).
- 2026-03-29 Completed readiness tooling alignment: installed local typecheck dependencies, standardized `db:push` support, preserved app-specific production DB isolation config, and prepared repo for freeze-safe commit/push without app logic changes.
- 2026-03-29 Synced local repo to `origin/main` after stale local seed commit divergence blocked pull; preserved prior local state on `backup/pre-pull-sync-2026-03-29`.
- Keep newest first; include date and short summary.
- 2026-03-25 Implemented full V1 manual workspace (Astro DB schema + ownership-safe CRUD/actions + /app and /app/letters/[id] UX + middleware scoping + dashboard/notification webhooks). Validation: `npm run build` passed; `npm run typecheck` blocked by restricted install of `@astrojs/check`.
- 2026-02-09 Added repo-level AGENTS.md enforcement contract (workspace reference + mandatory task-log update rule).
- 2026-02-09 Initialized repo AGENTS baseline for single-repo Codex/AI safety.
