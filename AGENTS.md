# Development Constraints

## Mandatory Quality Standard

All implementation work in this repository must follow a high standard for code quality, readability, and maintainability.

## Quality Rules

1. Keep modules focused and cohesive. Avoid large multi-purpose functions.
2. Prefer explicit names for variables, functions, and types. Avoid ambiguous abbreviations.
3. Keep control flow simple and predictable. Reduce nested branching where possible.
4. Handle errors explicitly and return actionable error messages.
5. Avoid duplicated logic. Extract shared behavior into reusable helpers.
6. Preserve backward-compatible behavior unless a change is explicitly required.
7. Add or update tests for every behavior change.
8. Do not merge partially validated code. Run relevant tests before completion claims.
9. Keep API contracts stable and documented (request/response shape, status codes, error models).
10. Favor maintainable code over clever shortcuts.

## Readability Rules

1. Use consistent formatting and import ordering.
2. Keep files organized by domain responsibility.
3. Add concise comments only where logic is not immediately obvious.
4. Use small, composable functions instead of monolithic handlers.
5. Strictly avoid large files:
   - Preferred target: <= 400 lines per source file.
   - Hard cap: <= 600 lines per source file.
   - If a change would exceed the cap, split by domain immediately (routing, handlers, schemas, helpers).
   - Mandatory verification command before completion: `./scripts/check_max_lines.sh`.

## Maintainability Rules

1. Prefer clear interfaces between layers (routing, handler, service, persistence).
2. Keep side effects localized and testable.
3. Isolate parsing/validation from business behavior where practical.
4. Avoid hidden coupling between frontend and backend internals.
5. For any existing oversized file, treat each new change as a mandatory opportunity to extract logic into new files.

## Implementation Process Rules

1. Before writing code, provide a brief implementation outline that includes architecture, assumptions, and extension points.
2. During implementation, keep changes incremental and domain-focused to reduce coupling and review risk.
3. If duplicated logic appears in touched code, extract shared helpers before completion.
4. Validate every behavior change with relevant build/tests and report command evidence before claiming completion.
5. If verification cannot be executed, explicitly document what was skipped, why, and the residual risk.
6. When modifying oversized files, perform at least one maintainability extraction unless a concrete blocker is documented.

## Prototype Alignment and Frontend Test Rules

1. Any page explicitly mapped to a prototype route must keep structure and interaction flow aligned with the prototype baseline.
2. For prototype-aligned page changes, include a visual verification step using current page screenshots and the corresponding baseline image in `frontend/public/prototypes/previews/`.
3. Prototype source-of-truth resolution order is mandatory:
   - First: route-mapped baseline image in `frontend/public/prototypes/previews/`.
   - Second: active `.pen` file (`prototypes/skillsindex_framework/skillsindex_framework.pen`).
   - Never use backup `.pen.bak*` files as implementation baselines unless explicitly requested.
4. Every frontend behavior change must include one-to-one automated test coverage:
   - Unit tests for pure logic/helpers.
   - UI interaction tests for critical user flows.
5. Frontend completion claims require fresh verification evidence from:
   - `cd frontend && npm run test:unit`
   - `cd frontend && npm run test:e2e`
   - `cd frontend && npm run test:visual`
   - `cd frontend && npm run build`
6. If visual diff fails, completion output must include the exact mismatch ratio and the generated artifacts under `frontend/test-results/visual/`.
7. If any frontend verification command is skipped or flaky, explicitly record scope, reason, and residual risk before completion.

## Language Rules

1. All code and code comments must be written in English.
2. Chinese must not appear in source code files.
