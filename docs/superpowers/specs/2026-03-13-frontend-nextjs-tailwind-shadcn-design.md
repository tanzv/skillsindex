# SkillsIndex Frontend Next.js Migration Design

> Scope: full frontend migration to `Next.js + Tailwind CSS + shadcn/ui`, with `Public` and `Workspace` redesigned, while `Admin` preserves the current functional layout.

## 1. Goal

Rebuild the previous React/Vite frontend into the current `frontend-next/` application based on `Next.js App Router`, `Tailwind CSS`, and `shadcn/ui`, while keeping the Go backend as the system of record.

The new frontend should:

1. Establish a unified design system across `Public`, `Workspace`, and `Admin`.
2. Allow product-level redesign for `Public` and `Workspace`.
3. Keep `Admin` function layout, menu grouping, and core page structure aligned with the current frontend.
4. Remove Ant Design completely.
5. Add a Next.js BFF layer while preserving the existing backend session, cookie, and CSRF model.

## 2. Confirmed Constraints

### 2.1 Product Direction

1. Full frontend migration, not partial adoption.
2. Three first-class product surfaces:
   - `Public`
   - `Workspace`
   - `Admin`
3. Weak visual separation:
   - one shared visual language
   - differences expressed mainly through density, layout, and navigation depth

### 2.2 Framework and Styling

1. Use `Next.js App Router`.
2. Use `Tailwind CSS`.
3. Use `shadcn/ui` as the component baseline.
4. Use `Radix UI` primitives where needed.
5. Remove `Ant Design` entirely.

### 2.3 Backend Integration

1. Keep the Go backend.
2. Add a `Next.js BFF` layer.
3. Preserve current session, cookie, and CSRF mechanics.
4. Do not redesign authentication around JWT or a new auth provider in this migration.

### 2.4 Surface-Specific Migration Rules

1. `Public` may be fully redesigned.
2. `Workspace` may be fully redesigned.
3. `Admin` must preserve the current functional layout:
   - menu grouping remains aligned
   - page entry structure remains aligned
   - primary list/detail/form/context relationships remain aligned
   - implementation and visual system may change

## 3. Recommended Migration Strategy

## 3.1 Chosen Strategy

Use a dual-track rebuild:

1. Keep the previous React/Vite frontend as the reference baseline during migration.
2. Build the new system in `frontend-next/`.
3. Migrate by product surface and shared system milestones.
4. Switch traffic only after the new frontend reaches functional parity for the approved scope.

## 3.2 Why This Strategy

This project is not a low-risk framework swap.

The current frontend is deeply tied to:

1. Vite build and preview flows
2. custom route resolution
3. direct browser runtime access
4. layout-specific page contracts
5. visual baseline scripts

An in-place rewrite inside the previous React/Vite frontend would mix old and new assumptions and make review, rollback, and parity validation harder.

## 4. Target Architecture

## 4.1 High-Level Structure

Create a new application under `frontend-next/`:

```text
frontend-next/
  app/
    (public)/
    (workspace)/
    (admin)/
    api/
    layout.tsx
    globals.css
  src/
    features/
      public/
      workspace/
      admin/
    components/
      ui/
      shared/
      navigation/
      data-display/
      feedback/
    design-system/
      tokens/
      recipes/
      density/
      icons/
    lib/
      auth/
      bff/
      http/
      routing/
      schemas/
      utils/
  tests/
```

## 4.2 Architectural Boundaries

1. `app/`
   - route entries
   - nested layouts
   - route-level loading and error boundaries
   - server/client composition boundaries
2. `features/`
   - page-family business composition
   - feature-local view models and API adapters
3. `components/ui/`
   - governed shadcn-based primitives
4. `components/shared/`
   - cross-surface composition blocks
5. `design-system/`
   - tokens, density rules, recipes, and semantic contracts
6. `lib/`
   - infrastructure concerns only

## 5. Information Architecture

## 5.1 Public

`Public` is the discovery and brand surface.

Primary route families:

1. homepage
2. discover/search
3. categories
4. skill detail
5. docs/about/API entry

Characteristics:

1. stronger editorial rhythm
2. clearer narrative and trust signals
3. server-first rendering where practical

## 5.2 Workspace

`Workspace` is the logged-in operational surface.

Primary route families:

1. overview
2. activity
3. queue and runs
4. policy and runbook
5. quick actions

Characteristics:

1. denser information than `Public`
2. stronger context and operational flow
3. server layout with client-heavy interactive islands

## 5.3 Admin

`Admin` is the governance and operations surface.

Primary route families remain aligned with the current frontend:

1. overview
2. ingestion
3. records
4. accounts
5. roles
6. integrations
7. ops
8. access
9. organizations
10. moderation

Characteristics:

1. preserve current functional layout and mental model
2. replace implementation stack and styling system
3. keep the interface structurally familiar to current operators

## 6. Design System Strategy

## 6.1 Design Principles

The design system must serve all three surfaces without turning into three disconnected themes.

Core principles:

1. one foundation, multiple density profiles
2. semantic tokens before component recipes
3. shared visual language across all surfaces
4. structure, not branding, creates most of the differentiation

## 6.2 Layers

Use four design-system layers:

1. `Foundation`
   - color primitives
   - type scale
   - spacing
   - radius
   - shadows
   - motion
2. `Semantic`
   - text, surface, border, action, status, overlay
3. `Recipe`
   - component variants and size rules
4. `Density`
   - `public`
   - `workspace`
   - `admin`

## 6.3 Tailwind and Tokens

1. Tailwind consumes CSS variables.
2. Raw brand values are not scattered across components.
3. Route surfaces may override density and layout tokens only.
4. Future dark mode or tenant themes must slot into the same token pipeline.

## 6.4 shadcn/ui Governance

shadcn/ui is a baseline, not the final design system.

Rules:

1. every adopted shadcn component is governed inside `components/ui/`
2. default example styling is not shipped as-is
3. component APIs are normalized around the project design system
4. accessibility guarantees from Radix and shadcn are preserved

## 7. Rendering and Data Strategy

## 7.1 Rendering Model

Use `App Router` with mixed rendering based on surface and page type:

1. `Public`
   - server-first by default
   - use server components where beneficial
2. `Workspace`
   - server layout, client-heavy content islands
3. `Admin`
   - server layout, client-heavy operational modules

Avoid turning entire route trees into client-only shells unless technically required.

## 7.2 BFF Layer

Use Next.js route handlers as the frontend backend-for-frontend layer.

BFF responsibilities:

1. request forwarding to Go backend
2. session/cookie forwarding
3. CSRF handling abstraction
4. response shaping for frontend consumption
5. localized error normalization

BFF non-responsibilities:

1. domain reimplementation
2. replacing Go business logic
3. becoming a second backend

## 7.3 Authentication Model

Preserve the existing session model:

1. Go backend remains the auth authority
2. Next.js uses BFF to integrate with current cookie/session flows
3. page components do not directly manage CSRF logic
4. route protection is split across:
   - middleware
   - protected layouts
   - BFF access boundaries

## 7.4 Data Access

Standardize data access into:

1. server data access helpers
2. client query helpers
3. mutation abstractions
4. shared schema normalization

Recommendation:

1. prefer server data loading for stable public content
2. use client-side query orchestration for `Workspace` and `Admin`
3. adopt `TanStack Query` for mutation-heavy and data-refresh-heavy surfaces

## 8. Core Page and Component Blueprint

## 8.1 Core Shared Shells

Build these shared structural layers first:

1. app shell
2. top navigation
3. sidebar navigation
4. page header
5. section header
6. card and surface primitives
7. feedback states
8. command palette

## 8.2 Priority Component System

### Tier 1

1. button
2. input
3. textarea
4. select
5. card
6. badge
7. tabs
8. dropdown menu
9. dialog
10. sheet
11. table shell
12. breadcrumb
13. topbar
14. sidebar
15. command

### Tier 2

1. filter toolbar
2. metric card
3. detail panel
4. entity header
5. empty state
6. error state
7. activity feed
8. timeline

### Tier 3

1. bulk action patterns
2. advanced admin forms
3. preview panels
4. audit and evidence viewers
5. charts

## 8.3 Template Patterns

Standardize route composition through a small set of page templates:

1. discover template
2. detail template
3. workbench template
4. governance table template
5. configuration template

This is especially important so `Admin` can preserve structure while still moving onto the new stack.

## 9. Admin Preservation Contract

This migration explicitly distinguishes between redesign zones and preservation zones.

`Admin` is a preservation zone.

That means:

1. route families remain recognizable
2. menu grouping remains aligned with the current frontend
3. primary page composition remains aligned
4. the migration may modernize visuals and implementation
5. the migration must not force operators to relearn the product map

For `Admin`, parity review should explicitly validate:

1. entry points
2. menu hierarchy
3. list/detail/form/context layout
4. action placement
5. operator-critical flow continuity

## 10. Migration Phases

## 10.1 Phase 0: Baseline Freeze

Artifacts:

1. admin route inventory
2. admin layout inventory
3. key user flows
4. API dependency map
5. current UI evidence for parity checks

## 10.2 Phase 1: New Frontend Foundation

Deliverables:

1. `frontend-next/` scaffold
2. Next.js App Router
3. Tailwind integration
4. shadcn initialization
5. BFF/auth/http foundation
6. root layouts

## 10.3 Phase 2: Design System and Shared Components

Deliverables:

1. token system
2. density system
3. foundational UI kit
4. navigation shells
5. feedback primitives

## 10.4 Phase 3: Public Migration

Suggested order:

1. home
2. discover/search
3. categories
4. skill detail
5. docs/API entry

## 10.5 Phase 4: Workspace Migration

Suggested order:

1. workspace overview
2. activity
3. queue/runs
4. policy/runbook
5. quick actions

## 10.6 Phase 5: Admin Migration

Suggested order:

1. overview
2. ingestion and records
3. accounts, roles, access
4. integrations
5. ops
6. organizations and moderation

Every admin page migration must compare against the existing frontend before acceptance.

## 10.7 Phase 6: Cutover and Retirement

Deliverables:

1. full regression evidence
2. cutover checklist
3. production switch plan
4. old frontend retirement plan

## 11. Testing and Verification Strategy

Verification must be layered.

1. unit tests
   - helpers
   - schemas
   - BFF adapters
   - design-system recipes
2. component tests
   - shared navigation
   - table shell
   - filter and detail patterns
3. integration tests
   - route-level data and auth boundaries
4. end-to-end tests
   - login
   - discover
   - detail flows
   - admin governance flows
5. parity tests
   - especially for `Admin`

## 12. Major Risks

1. admin parity drift during redesign-heavy phases
2. mixed server/client boundary mistakes in App Router
3. BFF growing beyond a frontend adapter role
4. underestimating replacement cost of Ant Design table/form-heavy pages
5. carrying over old route assumptions into the new architecture

## 13. Extension Points

1. multi-tenant theming
2. dark mode and theme variations
3. edge caching for public routes
4. analytics and audit instrumentation
5. future admin redesign after parity migration is complete

## 14. Assumptions

1. the Go backend remains authoritative for auth and business logic
2. the migration is allowed to introduce `frontend-next/` as a parallel application
3. the previous React/Vite frontend stays in place until cutover
4. `Public` and `Workspace` may be restructured substantially
5. `Admin` remains structurally aligned with the current frontend

## 15. Immediate Next Step

The next artifact should be an implementation plan that converts this design into:

1. foundation tasks
2. design-system tasks
3. BFF/auth tasks
4. `Public` migration tasks
5. `Workspace` migration tasks
6. `Admin` parity migration tasks
