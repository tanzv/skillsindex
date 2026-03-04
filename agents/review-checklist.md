# SkillsIndex Prototype Review Checklist

Version: 1.0
Last Updated: 2026-02-27
Source: `agents/prototype-design-standards.md`, `agents/tokens.md`

## 1. Review Method

Use this checklist for design review before claiming a prototype page is complete.
Each item is scored as:

- `2` = pass
- `1` = partially pass
- `0` = fail

Total score levels:

- `90-100%` Ready
- `75-89%` Needs minor fixes
- `<75%` Needs redesign pass

## 2. Quick Gate (must pass all)

1. Main task area is identifiable within 1 second.
2. No overlap, clipping, or broken card boundaries.
3. Primary actions are clearly distinguishable from static text.
4. Semantic colors match semantic meaning.
5. Dark and light variants preserve equivalent hierarchy.

If any quick gate fails, stop and fix before full scoring.

## 3. Full Scoring Matrix

### A. Hierarchy and Focus (20)

1. L1/L2/L3/L4 hierarchy is clearly visible. (0/1/2)
2. L2 (primary work area) dominates L3 (context panel). (0/1/2)
3. Context panel does not steal first visual focus. (0/1/2)
4. Page title and route context are clear at top level. (0/1/2)
5. Scan path supports task flow (filter -> list/form -> details). (0/1/2)
6. No excessive visual noise from decorative elements. (0/1/2)
7. Important status can be identified in under 3 seconds. (0/1/2)
8. Primary CTA is visible and unambiguous. (0/1/2)
9. Danger actions are isolated and intentionally emphasized. (0/1/2)
10. Secondary metadata remains subordinate. (0/1/2)

### B. Layout and Structure (20)

1. Content width and column ratio follow standard tokens. (0/1/2)
2. Spacing rhythm uses approved spacing scale. (0/1/2)
3. Card padding and gap are consistent in a module. (0/1/2)
4. Header height and top rhythm are consistent. (0/1/2)
5. No oversized empty area inside primary cards. (0/1/2)
6. Card boundaries are visually clear. (0/1/2)
7. Multi-card sections are grouped logically. (0/1/2)
8. Dense information is split into digestible blocks. (0/1/2)
9. List/table rows align correctly. (0/1/2)
10. Responsive stacking order is correct (desktop/tablet/mobile). (0/1/2)

### C. Color and Contrast (20)

1. Background colors follow token definitions. (0/1/2)
2. High-saturation blue is not overused on large surfaces. (0/1/2)
3. Light theme text contrast is readable in all cards. (0/1/2)
4. Dark theme text contrast is readable in all cards. (0/1/2)
5. Semantic chips use semantic color mapping correctly. (0/1/2)
6. Warning and error visuals are distinguishable. (0/1/2)
7. Success visuals do not conflict with action color. (0/1/2)
8. CTA color stands out from neutral surfaces. (0/1/2)
9. Context panel color is muted relative to primary area. (0/1/2)
10. Dark/light variants keep equivalent semantic emphasis. (0/1/2)

### D. Typography and Content Density (20)

1. Title, card title, body, and meta text follow scale. (0/1/2)
2. Logs/IDs use monospace where appropriate. (0/1/2)
3. Line length remains scannable in dense cards. (0/1/2)
4. Paragraph blocks are not overly long in operational cards. (0/1/2)
5. Label and value pairing is clear. (0/1/2)
6. Section headers are concise and informative. (0/1/2)
7. Repetitive content is grouped or collapsed logically. (0/1/2)
8. Status lines are short and actionable. (0/1/2)
9. Instructional text is near relevant controls. (0/1/2)
10. No card exceeds practical scan density. (0/1/2)

### E. Module-specific Fitness (20)

1. Ingestion pages: input, validation, and result flow is clear. (0/1/2)
2. Sync policy vs run ledger vs orchestration pages are distinguishable. (0/1/2)
3. Account and role pages prioritize status and permission data. (0/1/2)
4. SSO pages separate provider, mapping, callback/log blocks. (0/1/2)
5. Moderation pages prioritize case summary before actions. (0/1/2)
6. Ops pages balance metrics, controls, and evidence context. (0/1/2)
7. API key governance emphasizes scope and risk controls. (0/1/2)
8. Release/backup pages expose critical switches clearly. (0/1/2)
9. Auth entry pages clearly separate user vs admin journeys. (0/1/2)
10. Cross-page navigation cues are persistent and predictable. (0/1/2)

## 4. Defect Severity Rules

- `P0`: broken layout, unreadable critical info, impossible primary task.
- `P1`: strong hierarchy conflict, severe contrast issue, frequent misfocus.
- `P2`: consistency gaps, moderate density issues, local interaction ambiguity.
- `P3`: polish improvements and style fine-tuning.

## 5. Review Output Template

Use this template for every page audit:

```
Page: <name / node id>
Score: <xx/100>
Quick Gate: Pass/Fail
Top Findings:
1. [P?] ...
2. [P?] ...
3. [P?] ...
Required Fixes Before Accept:
1. ...
2. ...
Optional Improvements:
1. ...
```

## 6. Exit Criteria

A module is approved only when:

1. Every page in the module passes quick gate.
2. Average score is `>= 85`.
3. No `P0` or unresolved `P1` findings remain.
4. Dark/light parity screenshots are verified.

