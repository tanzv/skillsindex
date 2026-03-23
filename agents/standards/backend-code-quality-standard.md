# Backend Code Quality Standard

Version: 1.0
Last Updated: 2026-03-20
Owner: Backend Engineering

## Objective

Define backend-specific code quality rules for readability, safety, maintainability, and testability.

## Design And Readability Rules

1. Keep backend files cohesive around one domain responsibility.
2. Prefer explicit input and output structs for multi-field workflows.
3. Names must describe domain intent, not temporary implementation shortcuts.
4. Avoid unbounded aggregator structs for handlers, view data, or runtime dependencies.
5. Extract helpers only when they clarify ownership or remove real duplication.

## Function Design Rules

1. Functions should do one meaningful thing and return predictable results.
2. Keep control flow straightforward and exit early on invalid states.
3. Do not hide side effects behind harmless-sounding helper names.
4. Pass `context.Context` through side-effectful workflows and external boundaries.
5. Time, randomness, and external process execution should be explicit when they affect behavior or tests.

## Error Handling Rules

1. Wrap errors with actionable backend context.
2. Normalize storage, network, and integration errors before returning transport responses.
3. Use sentinel errors only for stable decision points, not as a substitute for context-rich failures.
4. Do not silently ignore expected failures that affect correctness, security, or auditability.
5. User-facing error payloads must stay safe and must not leak secrets, SQL text, or internal tokens.

## Runtime And State Rules

1. Normal request handling must not depend on hidden mutable global state.
2. Startup behavior that mutates persistent records must be explicit and reviewable.
3. Background workers must have bounded ownership, shutdown behavior, and retry intent.
4. Configuration-derived defaults must be validated before they affect durable state.

## Persistence Rules

1. Keep GORM or SQL usage isolated to persistence-oriented code as the target direction for new work.
2. Query helpers should be named after business intent instead of raw filter fragments.
3. Transaction scopes must be small, explicit, and owned by workflow code.
4. Reconciliation migrations and data backfills require clear comments and idempotent behavior.
5. Persistence code must not silently mix demo-data concerns with production-data invariants.

## Transport Quality Rules

1. Handlers should validate input, enforce boundary permissions, call services, and map outputs.
2. Duplicate HTTP behavior across route families should be extracted into shared helpers or domain route groups.
3. Route-specific view or response shaping should not leak into unrelated handlers.
4. HTTP-only concerns such as cookies, redirects, and headers must stay outside pure business helpers.

## Testability Rules

1. New backend behavior must be verifiable without requiring the full application runtime when practical.
2. Regressions must be captured by focused tests at the service, transport, or adapter boundary where the bug lives.
3. Introduce narrow interfaces when they materially improve isolation for complex workflows or unstable boundaries.
4. Tests must cover security-sensitive edge cases, startup safety behavior, and permission branches when those flows change.
5. Avoid tests that only prove a file compiles while missing the underlying invariant.

## Review Triggers

Call for refactor or deeper review when any of the following become true:

1. one handler aggregate owns too many domain dependencies
2. startup code mixes server lifecycle with business reconciliation
3. a service directly coordinates too many storage and integration details
4. a DTO or view struct becomes the dumping ground for unrelated route families
5. tests require excessive database setup because boundaries are too implicit

## Preferred Verification

For backend changes, verify at least:

1. `go test ./...`
2. `go vet ./...`
3. focused regression coverage for the changed workflow
