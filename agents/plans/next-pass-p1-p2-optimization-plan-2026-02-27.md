# Next Pass Optimization Plan (P1/P2)

Date: 2026-02-27
Input scorecard: `agents/records/audit/prototype-page-scorecard-2026-02-27.md`
Prototype target: `prototypes/skillsindex_framework/skillsindex_framework.pen`

## 1. Objective

Resolve all P1 and P2 issues from the scorecard while preserving functional structure and route semantics.

Exit criteria:

1. `P1 = 0`
2. `P2 <= 2`
3. Average score `>= 95`
4. Quick Gate still `100% pass`

## 2. P1 Backlog (Must Fix First)

### P1-A Accent Density Reduction in Sync Family

Pages:
- `sNW38` SkillsIndex / Sync and Export Command Center
- `Onzo0` SkillsIndex / Sync Policy Management
- `LCu0c` SkillsIndex / Sync Run Ledger
- `ReuoM` SkillsIndex / Job Orchestration Center

Problem:
- High concentration of bright accent tokens in the primary workflow area creates focus competition.

Actions:
1. Replace non-CTA bright blue backgrounds with muted panel token (`#1F3B62` or equivalent neutralized variant).
2. Keep bright accent only for primary CTA, active tab, and critical selected state.
3. Convert secondary action chips to tonal styles.
4. Ensure right panel emphasis is below left primary workflow cards.

Verification:
1. Bright accent count reduced by at least 40% per page.
2. First visual focus lands on left workflow within 1 second.

### P1-B Accent Density Reduction in Records Governance

Page:
- `phuBz` SkillsIndex / Records Governance

Problem:
- Dense accent usage across records/visibility/sync/delete related card groups.

Actions:
1. Normalize status chip background intensity.
2. De-escalate non-critical action backgrounds.
3. Keep destructive actions visually isolated and sparse.

Verification:
1. Status scan remains clear while overall visual noise drops.

## 3. P2 Backlog (Second Priority)

### P2-A Focus Balance in Ingestion and Account Hub

Pages:
- `9sq0k` SkillsIndex / Ingestion Center
- `7WR7g` SkillsIndex / Ingestion SkillMP
- `8fERA` SkillsIndex / Account Center Target

Problem:
- Moderate focus competition from accent clusters and dense contextual signals.

Actions:
1. Reduce accent token usage in non-critical badges.
2. Increase spacing between status lines and action clusters.
3. Keep one clear primary action region per card.

### P2-B Auth and DingTalk Light Journey

Page:
- `4M0zx` SkillsIndex / Auth and DingTalk Journey Light

Problem:
- Accent competition in route journey nodes and weaker hierarchy in light context blocks.

Actions:
1. Convert journey node secondary states to softer surfaces.
2. Reserve bright accent for current step and final CTA only.
3. Increase hierarchy contrast for step metadata.

## 4. Token-level Rules for This Pass

1. Bright accents (`#2563EB`, `#1D4ED8`) must not be used as default large-surface fills.
2. Context panels should prefer muted token family (`#1F3B62` for dark, soft neutral for light).
3. Semantic colors remain semantic-only and must not be repurposed for generic emphasis.

## 5. Execution Order

1. Sync family P1 (`sNW38`, `Onzo0`, `LCu0c`, `ReuoM`)
2. Records governance P1 (`phuBz`)
3. P2 ingestion/account (`9sq0k`, `7WR7g`, `8fERA`)
4. P2 auth journey light (`4M0zx`)
5. Re-score all nine pages and update scorecard delta

## 6. Validation Steps

1. Capture dark/light screenshots for all touched pages.
2. Run layout snapshot problems check (`problemsOnly=true`).
3. Recompute score table using same scoring method.
4. Record before/after score delta for each page.

## 7. Expected Delta

- `sNW38`, `Onzo0`, `LCu0c`, `ReuoM`, `phuBz`: +4 to +8
- `9sq0k`, `7WR7g`, `8fERA`, `4M0zx`: +2 to +5

