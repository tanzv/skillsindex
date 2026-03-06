# Frontend Prototype Alignment Policy

## Baseline Rules

1. Any page mapped to a prototype route must keep structure and interaction flow aligned to the baseline.
2. For prototype-aligned changes, include visual verification with current screenshots and the baseline image in `frontend/public/prototypes/previews/`.

## Source-of-Truth Order

1. Route-mapped baseline image in `frontend/public/prototypes/previews/`.
2. Active `.pen` file: `prototypes/skillsindex_framework/skillsindex_framework.pen`.
3. Do not use backup `.pen.bak*` files as baselines unless explicitly requested.

## Required Frontend Verification

Every frontend behavior change must include one-to-one test coverage:

1. Unit tests for pure logic/helpers.
2. UI interaction tests for critical flows.

Completion requires fresh evidence from:

- `cd frontend && npm run test:unit`
- `cd frontend && npm run test:e2e`
- `cd frontend && npm run test:visual`
- `cd frontend && npm run build`

If visual diff fails, report mismatch ratio and artifact paths under `frontend/test-results/visual/`.
If any command is skipped or flaky, record scope, reason, and residual risk.
