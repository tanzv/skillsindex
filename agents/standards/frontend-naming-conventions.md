# Frontend Naming Conventions

Version: 1.0
Last Updated: 2026-03-20
Owner: Frontend Architecture

## Objective

Define naming rules that make ownership, intent, and reuse scope obvious from paths and identifiers.

## General Rules

1. Names must reveal responsibility, not implementation trivia.
2. Prefer stable domain names over temporary workflow labels.
3. Avoid vague names such as `utils2`, `temp`, `misc`, `data`, or `handler` without a domain qualifier.
4. Use one naming pattern consistently inside the same boundary.

## Directory Naming

1. Framework chapters may refine directory naming to fit framework conventions.
2. Domain folders should use stable domain terms.
3. Shared folders must communicate shared responsibility explicitly, such as `components`, `features`, `lib`, `adapters`, `themes`.
4. Do not encode ephemeral ticket or experiment names into long-lived directories.

## Component Naming

1. Visual component files must use PascalCase names.
2. A shared component name must describe the abstraction, not one consumer.
3. A feature component name may include its feature context when that improves clarity.
4. Names ending in `Page`, `Shell`, `Panel`, `Card`, `List`, `Form`, `Dialog`, or `Section` should match the actual role of the component.

## Hook And Behavior Naming

1. Hooks must start with `use`.
2. Behavior modules should describe what they resolve or build, such as `buildX`, `resolveX`, `normalizeX`, `mapX`, `createX`.
3. Adapter names should communicate the boundary they represent, such as `Http`, `Bff`, `Storage`, `Session`, `Router`.

## Data Contract Naming

1. Types should distinguish raw payloads from normalized or view-model shapes.
2. Use explicit suffixes where that distinction matters, such as `Payload`, `Response`, `Schema`, `ViewModel`, `Snapshot`, `Descriptor`, `Registration`.
3. Avoid naming multiple different shapes with the same base noun.

## Test Naming

1. Test files must mirror the primary module name and end in `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` according to project convention.
2. Test descriptions must state user-visible behavior or domain intent, not implementation internals only.

## Style File Naming

1. Local component or feature styles must use `ComponentName.module.scss` or an equivalent framework-local module naming pattern.
2. Global style files must communicate scope and purpose explicitly.
3. Theme, token, and route-entry styles must not use ambiguous names.

## Naming Smells

Rename a module when:

1. the name only makes sense if the reader already knows the implementation
2. multiple unrelated responsibilities hide behind one generic noun
3. the name is tied to a temporary rollout label
4. the same noun means different things in neighboring folders
