# Frontend Governance Policy

Version: 1.0
Last Updated: 2026-03-20
Owner: Frontend Architecture

## Objective

Define the repository-wide governance model for all current and future frontend implementations.
This policy applies across frameworks, runtimes, and delivery surfaces unless a more specific policy explicitly states otherwise.

## Scope

This policy applies to:

1. Every user-facing web frontend in the repository.
2. Shared frontend packages, shells, design systems, and UI primitives.
3. Supporting frontend route handlers, browser-side adapters, and frontend-facing BFF layers.
4. Any new frontend stack introduced after this policy is adopted.

## Rule Hierarchy

Follow frontend rules in this order:

1. Repository policies under `agents/policies/`
2. Repository frontend standards under `agents/standards/`
3. Framework-specific chapters under `agents/standards/frameworks/`
4. Project-specific theme, prototype, or product standards
5. Checklists and review aids

Lower-level documents may refine a higher-level rule but may not weaken it without an explicit exception record.

## Core Governance Rules

1. New frontend work must fit an explicit architecture layer and ownership boundary.
2. New frontend code must prefer extension of existing primitives, shells, and domain modules before introducing new abstractions.
3. Every new shared component, style primitive, or framework adapter must define its consumer scope and extension points.
4. Cross-feature imports are forbidden unless they target an explicitly shared contract.
5. Frontend code must remain testable with deterministic unit coverage for pure logic and interaction coverage for user-critical flows.
6. Frontend delivery must preserve accessibility, responsive behavior, and stable public contracts by default.

## Styling Governance

1. SCSS is the default styling language for component, feature, and page-local styles across the repository.
2. Plain CSS is allowed only for approved exception categories:
   - global reset or browser-normalization entry files
   - theme-token composition roots
   - framework-mandated global entry stylesheets
   - generated or vendor-managed styles that should not be hand-maintained
3. Every non-SCSS exception must stay minimal and be justified in the owning project standard.
4. Style decisions must stay token-first and must not introduce isolated visual systems.

## Framework Extension Rules

1. Every framework used in the repository must have a dedicated standards chapter before major feature work begins.
2. Framework chapters must map the repository-wide rules into concrete file placement, rendering, state, routing, and testing rules.
3. A new framework may add stricter requirements but may not bypass repository-wide governance.

## Exception Process

1. Exceptions must be documented in the most specific owning standard.
2. Every exception must state:
   - why the default rule does not fit
   - what scope the exception covers
   - what would allow the exception to be removed later
3. Silent or undocumented exceptions are policy violations.

## Required Evidence

Frontend work is not complete unless the changed scope includes:

1. architecture and placement consistency with the relevant standard
2. verification evidence appropriate to the risk level
3. updated documentation when introducing a new shared pattern, token, or exception

## Enforcement Summary

The following are considered governance violations:

1. introducing a new frontend stack without a framework chapter
2. adding shared UI without a clear owner or consumer scope
3. introducing local styling systems that bypass the repository token and theme contracts
4. duplicating route, navigation, or state definitions without an explicit reason
5. shipping frontend changes without matching verification evidence
