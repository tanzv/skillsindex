# Project Architecture Profile

Version: 1.0
Last Updated: 2026-03-20
Owner: Repository Architecture

## Objective

Capture the current project architecture and development direction without overloading the root `AGENTS.md` entrypoint.

## System Shape

1. This repository is a full-stack SkillsIndex system with a Go backend and a Next.js frontend.
2. The Go backend under `backend/` remains the system of record for business logic, persistence, auth/session behavior, and public or admin API contracts.
3. The active web frontend lives under `frontend-next/` and is built on `Next.js App Router`, `React`, `TypeScript`, and a repository-governed design system.
4. The Next.js application includes a BFF boundary for frontend-safe auth, cookie, CSRF, and proxy integration with the backend.

## Backend Surface Model

The current backend is organized into these major package families:

1. `backend/cmd/**`
   - process entrypoints
2. `backend/internal/bootstrap/**`
   - runtime assembly and lifecycle coordination
3. `backend/internal/web/**`
   - HTTP transport, routing, middleware, and response mapping
4. `backend/internal/services/**`
   - workflow orchestration and application services
5. `backend/internal/models/**`, `backend/internal/catalog/**`
   - backend-owned domain and contract types
6. `backend/internal/db/**`
   - schema, migration, and persistence-oriented helpers

## Frontend Surface Model

The current frontend is organized into four first-class route families:

1. `Public`
   - marketplace discovery, categories, rankings, skill detail, and docs-like narrative routes
2. `Workspace`
   - logged-in operational surface for queues, activity, policy, runbook, and actions
3. `Admin`
   - governance and operations surface for ingestion, records, accounts, organizations, moderation, and platform controls
4. `Account`
   - user account and credential management surface

## Frontend Module Model

The intended frontend structure is:

1. `frontend-next/app/**`
   - route registration, layouts, and route-family entry orchestration
2. `frontend-next/src/features/**`
   - page-family composition and feature-local view models
3. `frontend-next/src/components/**`
   - shared UI, shells, navigation, and reusable primitives
4. `frontend-next/src/lib/**`
   - adapters, schemas, routing helpers, auth/session helpers, and pure support logic
5. `frontend-next/app/*.css` and co-located `*.module.scss`
   - theme foundations, shell foundations, and local style modules under repository styling rules

## Design Philosophy

1. Backend-owned business truth, frontend-owned interaction and presentation.
2. One product, multiple surfaces: `Public`, `Workspace`, `Admin`, and `Account` should feel related, not like separate applications.
3. Thin route entries, rich feature modules, and stable shared shells.
4. Token-first visual design with explicit exceptions instead of ad-hoc styling.
5. Composition over inheritance and explicit contracts over hidden coupling.
6. Incremental modernization: improve toward the target architecture without requiring full rewrites for every touched area.

## Current Development Direction

1. Continue consolidating the active web product in `frontend-next/`.
2. Reduce duplicated route, navigation, and page-model truth across frontend modules.
3. Push client pages toward thin rendering layers by moving view-model logic into pure model builders.
4. Standardize local styling on `*.module.scss` while preserving approved global theme entry points.
5. Strengthen shell, navigation, and feature boundaries so shared modules do not absorb page-specific behavior.
6. Reduce hidden backend aggregation in startup, transport, and service layers.

## Expected Medium-Term Evolution

1. Increase backend ownership for public marketplace, ranking, and detail contracts.
2. Keep the Next.js BFF as the frontend integration boundary rather than leaking backend mechanics into UI modules.
3. Expand repository-wide rules through stable policy and standards chapters instead of one-off local decisions.
4. Treat new shared components, tokens, route registries, and backend contracts as governed assets that require documentation and tests.

## Source-Of-Truth References

Use these documents for deeper architecture intent:

1. `agents/frontend-architecture-blueprint.md`
2. `docs/superpowers/specs/2026-03-13-frontend-nextjs-tailwind-shadcn-design.md`
3. `docs/superpowers/specs/2026-03-19-public-marketplace-real-data-design.md`
4. `docs/superpowers/specs/2026-03-19-public-ranking-backend-contract-design.md`
5. `docs/superpowers/specs/2026-03-20-backend-web-aggregation-reduction-design.md`
