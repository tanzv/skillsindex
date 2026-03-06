# Agents Documentation Map

## Folder Structure

- `agents/policies/`: engineering, delivery, prototype alignment, and language policies.
- `agents/standards/`: design standards, tokens, review checklist, and style-system/theme integration rules.
- `agents/plans/`: implementation plans and optimization plans.
- `agents/records/`: historical audits and execution records.

## Ownership Model

1. Keep policy documents stable and concise.
2. Keep standards implementation-oriented and source-linked.
3. Keep records immutable except for path/reference maintenance.

## Update Protocol

1. If a rule changes, update the corresponding policy/standard file and this index when structure changes.
2. If style tokens or theme contracts change, update both:
   - `agents/standards/tokens.md`
   - `agents/standards/style-system-theme-integration.md`
3. For new record files, place them under the appropriate `agents/records/*` category.
