# Agent Rules Entry Point

This file is intentionally short.
Detailed operational rules are split into `agents/` subfolders.

## Required Read Order

1. `agents/policies/engineering-principles.md`
2. `agents/policies/testing-and-delivery.md`
3. `agents/standards/agent-rules-design-standard.md`
4. `agents/policies/language-rules.md`

## Task-Specific Required Reads

Read the following documents after the global read order based on the task category.

### Backend Tasks

1. `agents/policies/backend-governance.md`
2. `agents/standards/backend-architecture-layering.md`
3. `agents/standards/backend-code-quality-standard.md`

### Frontend Tasks

1. `agents/policies/frontend-governance.md`
2. `agents/standards/frontend-architecture-layering.md`
3. `agents/standards/frontend-component-standard.md`
4. `agents/standards/frontend-naming-conventions.md`
5. `agents/standards/frontend-styling-standard.md`
6. `agents/standards/style-system-theme-integration.md`
7. `agents/standards/tokens.md`
8. `agents/standards/frontend-pages-and-visual-baselines.md`
9. `agents/standards/frontend-patterns-and-anti-patterns.md`
10. `agents/standards/frameworks/react-nextjs-standards.md`
11. `agents/standards/checklists/frontend-component-intake-checklist.md`
12. `agents/standards/prototype-design-standards.md`
13. `agents/standards/review-checklist.md`
14. `agents/policies/frontend-prototype-alignment.md`

### Agent Rule Maintenance Tasks

1. `agents/AGENTS.md`
2. `agents/standards/agent-rules-design-standard.md`

## Mandatory Operating Rules

1. Use project skills when the task matches a skill description.
2. When adding or changing repository agent rules, follow `agents/standards/agent-rules-design-standard.md` and update the relevant entrypoint index in the same change set.
3. For any backend work, follow the repository-wide backend governance and standards before package-level or framework-level decisions.
4. For any frontend work, follow the repository-wide frontend governance and standards before applying framework-specific rules.
5. SCSS is the default style format for new local frontend styles; any non-SCSS exception must be minimal and documented in the owning standard.
6. New shared frontend components must satisfy the intake checklist in `agents/standards/checklists/frontend-component-intake-checklist.md`.
7. A new frontend framework or runtime may not be introduced without a dedicated standards chapter under `agents/standards/frameworks/`.
8. For frontend style work in `frontend-next/`, apply `skillsindex-system-style-design` and follow token-first implementation.
9. Keep backward compatibility by default unless a breaking change is explicitly approved.
10. Do not claim completion without verifiable test/build evidence for the changed scope.
11. Treat `agents/records/` as historical evidence, not active policy source.
12. For frontend routing work, keep path families, route metadata, and render dispatch in shared routing contracts under `frontend-next/src/lib/routing/**`; do not recreate route truth inside feature folders.
13. Feature-level route branching is allowed only for rendering, local interaction, or feature-local view-model selection within one page family.
14. Temporary compatibility wrappers may exist during migration, but new imports must target the shared contract directly and stale wrappers should be removed in the next safe refactor.
15. Repository local frontend and backend long-running services must be started, restarted, inspected, and stopped through `lcode` profiles or `make dev*` wrappers that delegate to `lcode`.
16. Do not keep repository runtime services alive through ad hoc terminal processes such as bare `npm run dev`, `next start`, `go run`, or long-lived `exec_command` sessions unless the user explicitly approves a temporary diagnostic exception.

## Project Context

For current system shape, route families, module model, and source-of-truth architecture references, read:

1. `agents/project-architecture-profile.md`
2. `agents/frontend-architecture-blueprint.md`

## Directory Guide

See `agents/AGENTS.md` for the full folder map and document responsibilities.
