# Engineering Principles Policy

## Mandatory Quality Standard

All implementation work must keep production-grade quality, readability, and maintainability.

## Architecture and Design Rules

1. Apply SOLID with explicit module boundaries and single-responsibility design.
2. Prefer dependency injection over hidden state to improve testability and predictability.
3. Keep business logic framework-agnostic where practical.
4. Use DRY, KISS, and YAGNI as default decision criteria.
5. Preserve backward compatibility unless a breaking change is explicitly approved.
6. Define clear contracts between layers (input/output, errors, side effects).
7. Prefer composition and interfaces over duplicated concrete implementations.

## Shared Component Generality Rules

1. Build reusable components around stable interfaces instead of page-specific assumptions.
2. Separate presentation concerns from business behavior.
3. Support composition via slots/props/children and avoid hardcoded workflow content.
4. Keep state ownership explicit; use controlled patterns where external state exists.
5. Keep accessibility and i18n compatibility at component level.
6. Expose only necessary extension points (variants, tokens, callbacks).
7. Require contract-level tests and consumer impact validation for shared API changes.

## Code Quality and Readability Rules

1. Keep modules cohesive and avoid multi-purpose functions.
2. Use explicit, meaningful names.
3. Keep control flow simple and predictable.
4. Handle expected errors explicitly with actionable messages.
5. Remove duplication by extracting reusable helpers.
6. Favor maintainable code over clever shortcuts.
7. Use consistent formatting and import ordering.
8. Add comments only when logic is non-obvious.

## File Size and Maintainability Rules

1. Preferred source file size: `<= 400` lines.
2. Hard cap source file size: `<= 600` lines.
3. If a change crosses the cap, split immediately by domain responsibility.
4. Mandatory verification before completion: `./scripts/check_max_lines.sh`.
