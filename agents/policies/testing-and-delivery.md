# Testing and Delivery Policy

## TDD Rules

1. Follow Red-Green-Refactor whenever feasible.
2. Every bug fix must include a regression test.
3. Encode behavior contracts and edge cases in tests before implementation changes.
4. Keep tests deterministic and isolated.
5. Balance coverage across unit, integration, and end-to-end levels based on risk.
6. Keep tests readable and actionable.

## Quality Gates

1. All changed code must pass lint, type-check, and relevant tests.
2. Avoid monolithic changes; keep patches focused and reviewable.
3. Handle expected failures explicitly; avoid silent failures.
4. Remove temporary debug code and dead logic before completion.
5. Any TODO/FIXME must include scope and tracking reference.
6. Evaluate security, performance, and data integrity impact for behavior changes.
7. Keep public contracts stable; if changed, include compatibility notes and migration steps.

## Implementation Process

1. Before coding, provide a brief implementation outline including assumptions and extension points.
2. Keep implementation incremental and domain-focused.
3. Extract shared helpers when duplicated logic appears.
4. Report command-based verification evidence for behavior changes.
5. If verification cannot run, document what was skipped, why, and residual risk.

## Completion Rule

Do not claim the task is complete without test/build evidence that matches the changed scope.
