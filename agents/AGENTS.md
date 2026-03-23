# Agent Subdirectory Entry Point

This file is intentionally short.
It defines how to navigate and maintain the rule documents under `agents/`.

## Directory Structure

1. `agents/*.md`
   - root-level entrypoint and shared architecture reference documents such as project profiles and frontend architecture blueprints
2. `agents/policies/`
   - repository-level policies for engineering, delivery, governance, prototype alignment, and language constraints
3. `agents/standards/`
   - executable standards for agent-rule design, backend/frontend architecture, components, naming, styling, patterns, design, and delivery
4. `agents/standards/frameworks/`
   - framework-specific chapters such as React and Next.js
5. `agents/standards/checklists/`
   - intake, review, and delivery checklists
6. `agents/plans/`
   - implementation plans and optimization plans
7. `agents/records/`
   - historical audits and execution records

## Ownership Model

1. Keep policy documents stable and concise.
2. Keep standards implementation-oriented and source-linked.
3. Keep root-level shared architecture references descriptive rather than normative.
4. Keep framework chapters scoped to one stack and aligned with repository-wide rules.
5. Keep records immutable except for path/reference maintenance.

## Update Protocol

1. If a rule changes, update the corresponding policy or standard file and this index when structure changes.
2. If the agent rule system changes, update the root `AGENTS.md`, this file, and any impacted policy or standard references in the same change set.
3. If a backend rule changes, update any impacted backend governance or backend standards chapter in the same change set.
4. If style tokens or theme contracts change, update both:
   - `agents/standards/tokens.md`
   - `agents/standards/style-system-theme-integration.md`
5. If a frontend rule changes, update any impacted framework chapter or checklist in the same change set.
6. If project architecture context changes, update `agents/project-architecture-profile.md` instead of inflating the root entrypoint.
7. For new record files, place them under the appropriate `agents/records/*` category.

## Usage Notes

1. Read the root `AGENTS.md` first for global read order and mandatory operating rules.
2. Use this file as the navigation map for where detailed rules live under `agents/`.
3. Read `agents/project-architecture-profile.md` when task context requires current system shape or development direction.
4. Read `agents/frontend-architecture-blueprint.md` when task context requires the concrete frontend system blueprint for `frontend-next/`.
5. Treat `agents/records/` as evidence and history, not as the active source of policy.
