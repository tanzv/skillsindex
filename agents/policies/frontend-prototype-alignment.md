# Frontend Prototype Alignment Policy

## Baseline Rules

1. Any page mapped to a prototype route must keep structure and interaction flow aligned to the baseline.
2. For prototype-aligned changes, include visual verification with current route captures from `frontend-next/`, using Playwright artifacts under `frontend-next/test-results/` or curated task screenshots under `frontend-next/tmp-screens/`.

## Source-of-Truth Order

1. Active `.pen` file: `prototypes/skillsindex_framework/skillsindex_framework.pen`.
2. Prototype support material under `prototypes/skillsindex_framework/`.
3. Admin parity references in `docs/superpowers/migration/admin-layout-baseline.md` and `docs/superpowers/migration/admin-route-map.md`.
4. Fresh screenshots captured from the active `frontend-next/` implementation.

## Required Frontend Verification

Every frontend behavior change must include one-to-one test coverage:

1. Unit tests for pure logic/helpers.
2. UI interaction tests for critical flows.

Completion requires fresh evidence from:

- `cd frontend-next && npm run lint`
- `cd frontend-next && npm run test:unit`
- `cd frontend-next && npm run test:e2e`
- `cd frontend-next && npm run build`

If Playwright verification fails, report failed specs and artifact paths under `frontend-next/test-results/`.
If any command is skipped or flaky, record scope, reason, and residual risk.
