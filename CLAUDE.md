# CLAUDE.md

This file applies to the whole repository unless a deeper `CLAUDE.md` overrides it.

## Project Identity

**Mizu** (水, "water") is a self-hosting platform for macOS home labs. Think Coolify, Railway, or
Heroku — but running on Mac Minis and MacBooks.

- **Visual-first**: the canvas/flowchart editor is the product's identity — nodes are
  services/resources, edges are connections/dependencies, drag-and-drop everything.
- **macOS-native**: built specifically for Apple hardware home labs.
- **Local-first**: your machine, your data, your rules.
- **Personality**: hobby project with heart — geek/anime-inspired without being cringe. Simple
  things stay simple; complex things remain possible. If it's not delightful to use, it's not done.

## Conventions

Portable code-style and folder-structure rules live in a reusable file imported here:

@docs/conventions.md

That file covers **Vocabulary**, **Modules & Scope** (the `lib/` + `shared/` model), **Backend
Layering**, **Component Authoring**, **State & Wiring**, **Code Style**, and **Workflow** (working
principles, task management, and the commit convention). The sections below describe this repo's
specific topology, scaffolding, and commands.

## Repository Overview

- Runtime and package manager: `bun@1.2.23`; monorepo tooling: Turborepo; type checks: **tsgo**
  (`@typescript/native-preview`); formatter/linter: Biome.
- Two apps:
  - `apps/minato` (港, "harbor") — TanStack Start (React 19, Tailwind, shadcn/ui) frontend + an
    **auth-only** Elysia backend (better-auth: email/password + optional social providers, with
    `jwt`/`jwks`). The web UI + identity provider.
  - `apps/nagare` (流れ, "flow") — a **headless** Bun/Elysia daemon (own port, `:3001`) that owns
    all business operations: workspaces, projects, services, databases, connections,
    instance settings, Docker orchestration, deployments, and a WebSocket log stream. Verifies
    minato JWTs via JWKS — no shared secret.
- Minato packages: `packages/minato/{domain,repository,service,api}` (auth only) +
  `packages/configs/minato-config`.
- Nagare packages: `packages/nagare/{domain,repository,service,api}` +
  `packages/configs/nagare-config`.
- **One shared Postgres database**: minato's repository owns the auth tables; nagare's repository
  owns the business tables. Each keeps its own drizzle migration history in a distinct journal
  table (`drizzle_minato_migrations` / `drizzle_nagare_migrations`). No cross-domain foreign keys —
  business rows store `userId` as a plain column and nagare trusts the JWT `sub` claim.
- Shared tooling lives under `packages/shared/*` (`cli`, `logger`, `typescript-config`).

When adding apps, colocate app-specific packages under `packages/{app-name}/*` and config under
`packages/configs/{app-name}-config`. Keep cross-cutting concerns in `packages/shared/*`.

## Backend Layering

The generic layering pattern (`domain → repository → service → api → ui`, plus `lib/`/`shared/`)
lives in **Backend Layering** in `@docs/conventions.md`. Mizu-stack specifics:

- `apps/minato`'s backend is **auth only**: better-auth is mounted at `/api/auth` (with `jwt` +
  `jwks` plugins; `GET /api/auth/token` mints the JWT nagare accepts). `packages/minato/api` is an
  Elysia app (prefix `/api`) mounted into TanStack Start via the `/api/$` catch-all route calling
  `app.handle(request)` — it exposes `/api/health`, `/api/me`, `/api/auth-methods`,
  `/api/has-users`.
- `apps/nagare` is a **standalone** Elysia server started with `.listen()` (NOT `.handle()`), so
  native WebSocket upgrades work. All routes live in `packages/nagare/api/src/routes/{entity}.ts`
  (HTTP **and** the `.ws()` log stream), composed into the one exported `app`; the app entry just
  `.listen()`s it. Docker access (dockerode) and `~/.mizu` filesystem operations run in nagare.
- **Cross-service auth**: minato mints a JWT (`GET /api/auth/token`); nagare verifies it against
  minato's JWKS (`/api/auth/jwks`) with `jose`. The frontend attaches a Bearer JWT to nagare HTTP
  calls (Eden Treaty `headers` callback) and passes `?token=` + a client-generated `?cid=` on
  WebSockets.
- **Elysia 2 (experimental, `2.0.0-exp.25`)** quirks: `@elysiajs/cors` has no Elysia-2 build, so
  nagare CORS is hand-rolled in `packages/nagare/api/src/app.ts` (a `request` hook + an `OPTIONS`
  preflight route); a `.ws()` route only populates `ws.query` when a **schema is declared**;
  `ws.id` is unreliable, so clients supply `?cid=` and the server keys on it; `ws.send` takes a
  **string** (events are JSON).
- **Validation schemas come from `domain`, as zod — never inline, never TypeBox `t.*`.** Reuse a
  `drizzle-zod` entity from `domain/entities/`, or define the shape in
  `domain/schemas/{entity}/{name}-schema.ts` and import it.
- Frontend data access goes through `apps/minato/src/shared/api/` (per-entity `queryOptions`
  factories + key factories over the Eden Treaty client) — components never import the treaty
  client directly and never hand-write query keys. Dates arrive as ISO strings (no superjson);
  the api layer types them honestly via its `Serialized<T>` mapped type.

## Domain Concepts

- **Workspace** → **Project** → **Service / Database / Network / Volume / External service /
  Env group**, wired by **Connections** — all drawn on the canvas
  (`apps/minato/src/components/canvas/`).
- Deployments run through nagare: generators (docker-compose, env, mizu-yml) → Docker
  (containers/images/networks/volumes) → status + logs back to the canvas.

## Commands

- Minato (frontend + auth) dev: `bun run repo dev --app minato` (localhost:3000)
- Nagare (daemon) dev: `bun run repo dev --app nagare` (localhost:3001)
- Production build: `bun run repo build --app minato` / `--app nagare`
- Docker up/down: `bun run repo docker:up --app minato` (shared Postgres; nagare profile reuses it)
- Repo typecheck: `bun run check-types` · lint: `bun run fmt-lint` (fix: `fmt-lint:fix`) · tests:
  `bun run test`
- DB (per app): `bun run repo db:generate|db:migrate|db:push|db:seed --app minato|nagare`
- Drizzle Studio: `bun run repo db:studio --app <name>`
- Scaffolding: `bun run gen:app`, `bun run gen:lib`

## Verification

- Start with the smallest relevant check for the code you changed, then broaden.
- Before handing work off, run the relevant subset of `bun run check-types`, `bun run fmt-lint`,
  `bun run test`.
- If database code changes, run the appropriate `db:*` command or explain why not.
- For user-facing changes, the bar is "UX feels right", not just "types pass".
- **Stop-the-line rule**: on unexpected failures, stop adding features, preserve evidence, return
  to diagnosis.

## Handoff Notes

- Reference concrete files and commands when summarizing work.
- Call out follow-up steps when contracts or shared packages change (especially the
  `@mizu/nagare-api` `App` type — the frontend's Eden client is typed against it).
- If asked to commit, follow the **Commit Convention** in `@docs/conventions.md`.
