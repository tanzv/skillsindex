# Prototype Page Scorecard (Admin Scope)

Date: 2026-02-27
Target file: `prototypes/skillsindex_framework/skillsindex_framework.pen`
Standards reference:
- `agents/prototype-design-standards.md`
- `agents/tokens.md`
- `agents/review-checklist.md`

## 1. Summary

- Total pages reviewed: `64`
- Dark pages: `32`
- Light pages: `32`
- Quick Gate pass: `64/64`
- Average score: `94.44/100`
- Severity split:
  - `P1`: `5`
  - `P2`: `4`
  - `P3`: `55`

## 2. Layout Integrity Check

`mcp snapshot_layout (problemsOnly=true)` shows clipping only on homepage containers:
- `j0pbU`, `EbJ9a`, `ZrkVN`, `o4GwB`

No clipping/overlap findings were detected in the admin page scope covered by this scorecard.

## 3. Scoring Method

Composite score combines:

1. Top/Main structure completeness.
2. Valid layout mode:
- `main/context` mode (`932/412`) or
- `router dual-column` mode (`673/673`).
3. Accent density pressure (`#2563EB`, `#1D4ED8`) penalty.
4. Muted context panel adoption (`#1F3B62`).
5. Theme parity (dark/light pair existence).
6. Information density penalty for very high frame-fill count.

Severity mapping used in this report:

- `P1`: bright accent density `>= 18` on page.
- `P2`: score `< 90` and not `P1`.
- `P3`: remaining pages.

## 4. Page-by-page Results

| Node ID | Page | Theme | Score | Quick Gate | Severity | Risk Focus | Bright Accent Count | Muted Panel Count | Main/Context | RouterCols |
|---|---|---|---:|---|---|---|---:|---:|---|---:|
| sNW38 | SkillsIndex / Sync and Export Command Center | dark | 84 | PASS | P1 | High accent density in main workflow | 22 | 16 | 1/1 | 0 |
| ReuoM | SkillsIndex / Job Orchestration Center | dark | 85 | PASS | P1 | High accent density in main workflow | 18 | 3 | 1/1 | 0 |
| Onzo0 | SkillsIndex / Sync Policy Management | dark | 85 | PASS | P1 | High accent density in main workflow | 19 | 3 | 1/1 | 0 |
| LCu0c | SkillsIndex / Sync Run Ledger | dark | 85 | PASS | P1 | High accent density in main workflow | 18 | 3 | 1/1 | 0 |
| 4M0zx | SkillsIndex / Auth and DingTalk Journey Light | light | 86 | PASS | P2 | Accent density and focus competition | 15 | 0 | 0/0 | 2 |
| 9sq0k | SkillsIndex / Ingestion Center | dark | 86 | PASS | P2 | Accent density and focus competition | 15 | 3 | 1/1 | 0 |
| phuBz | SkillsIndex / Records Governance | dark | 86 | PASS | P1 | High accent density in main workflow | 19 | 3 | 1/1 | 0 |
| 7WR7g | SkillsIndex / Ingestion SkillMP | dark | 87 | PASS | P2 | Accent density and focus competition | 16 | 3 | 1/1 | 0 |
| 8fERA | SkillsIndex / Account Center Target | dark | 89 | PASS | P2 | Accent density and focus competition | 15 | 7 | 1/1 | 0 |
| K943K | SkillsIndex / Enterprise Identity SSO Gateway | dark | 92 | PASS | P3 | Stable | 13 | 5 | 1/1 | 0 |
| GBDSq | SkillsIndex / Sync and Export Command Center Light | light | 92 | PASS | P3 | Stable | 0 | 31 | 1/1 | 0 |
| Z0Xx0 | SkillsIndex / Auth and DingTalk Journey | dark | 93 | PASS | P3 | Stable | 3 | 0 | 0/0 | 2 |
| jCKys | SkillsIndex / Ingestion Center Light | light | 93 | PASS | P3 | Stable | 0 | 40 | 1/1 | 0 |
| mgMT2 | SkillsIndex / SSO Provider Configuration | dark | 93 | PASS | P3 | Stable | 10 | 3 | 1/1 | 0 |
| 3JYyI | SkillsIndex / Sync Operation Records | dark | 93 | PASS | P3 | Stable | 6 | 1 | 1/1 | 0 |
| nzHmQ | SkillsIndex / Ingestion Manual | dark | 94 | PASS | P3 | Stable | 8 | 4 | 1/1 | 0 |
| T1LsV | SkillsIndex / Ingestion Repository | dark | 94 | PASS | P3 | Stable | 8 | 4 | 1/1 | 0 |
| D9L7Q | SkillsIndex / Ingestion Zip | dark | 94 | PASS | P3 | Stable | 8 | 4 | 1/1 | 0 |
| DqDxJ | SkillsIndex / Job Orchestration Center Light | light | 94 | PASS | P3 | Stable | 0 | 30 | 1/1 | 0 |
| lSWwe | SkillsIndex / Moderation Case List | dark | 94 | PASS | P3 | Stable | 8 | 10 | 1/1 | 0 |
| hahZ8 | SkillsIndex / Moderation Governance Hub | dark | 94 | PASS | P3 | Stable | 10 | 5 | 1/1 | 0 |
| oCpV4 | SkillsIndex / Moderation Postmortem Detail | dark | 94 | PASS | P3 | Stable | 9 | 4 | 1/1 | 0 |
| QNq52 | SkillsIndex / Moderation Response Console | dark | 94 | PASS | P3 | Stable | 9 | 4 | 1/1 | 0 |
| SIIOt | SkillsIndex / Organization Governance List | dark | 94 | PASS | P3 | Stable | 8 | 5 | 1/1 | 0 |
| EC25R | SkillsIndex / SSO Provider List | dark | 94 | PASS | P3 | Stable | 8 | 10 | 1/1 | 0 |
| iTgm0 | SkillsIndex / Sync Policy Management Light | light | 94 | PASS | P3 | Stable | 0 | 31 | 1/1 | 0 |
| r0yUw | SkillsIndex / Sync Run Ledger Light | light | 94 | PASS | P3 | Stable | 0 | 30 | 1/1 | 0 |
| IOoGJ | SkillsIndex / Account Center Target Light | light | 95 | PASS | P3 | Stable | 0 | 27 | 1/1 | 0 |
| TjCgh | SkillsIndex / Account Configuration Form | dark | 95 | PASS | P3 | Stable | 4 | 3 | 1/1 | 0 |
| 1AHaM | SkillsIndex / Account Management List | dark | 95 | PASS | P3 | Stable | 4 | 3 | 1/1 | 0 |
| 95uPl | SkillsIndex / Admin Navigation Dashboard | dark | 95 | PASS | P3 | Stable | 4 | 3 | 1/1 | 0 |
| mbfPP | SkillsIndex / Records Governance Light | light | 95 | PASS | P3 | Stable | 0 | 19 | 1/1 | 0 |
| B5hwC | SkillsIndex / Role Configuration Form | dark | 95 | PASS | P3 | Stable | 4 | 3 | 1/1 | 0 |
| SibVw | SkillsIndex / Role Configuration Form Light | light | 95 | PASS | P3 | Light hierarchy may flatten in dense blocks | 0 | 9 | 1/1 | 0 |
| 4sVDF | SkillsIndex / Import Operation Records | dark | 96 | PASS | P3 | Stable | 6 | 4 | 1/1 | 0 |
| 5m0sj | SkillsIndex / Ingestion Manual Light | light | 96 | PASS | P3 | Stable | 0 | 23 | 1/1 | 0 |
| GTYH2 | SkillsIndex / Ingestion Repository Light | light | 96 | PASS | P3 | Stable | 0 | 23 | 1/1 | 0 |
| gR5Q5 | SkillsIndex / Ingestion SkillMP Light | light | 96 | PASS | P3 | Stable | 0 | 25 | 1/1 | 0 |
| N5JDq | SkillsIndex / Ingestion Zip Light | light | 96 | PASS | P3 | Stable | 0 | 23 | 1/1 | 0 |
| nyHEe | SkillsIndex / Organization Workspace Governance Hub | dark | 96 | PASS | P3 | Stable | 5 | 5 | 1/1 | 0 |
| QPMwn | SkillsIndex / Role Management List | dark | 96 | PASS | P3 | Stable | 5 | 5 | 1/1 | 0 |
| UDipb | SkillsIndex / API Key Scope Governance | dark | 97 | PASS | P3 | Stable | 1 | 2 | 0/0 | 2 |
| n9jqt | SkillsIndex / Backup Recovery Drill | dark | 97 | PASS | P3 | Stable | 1 | 2 | 0/0 | 2 |
| vzkFw | SkillsIndex / Ops Compliance Observatory | dark | 97 | PASS | P3 | Stable | 1 | 2 | 0/0 | 2 |
| MqiFK | SkillsIndex / Release Gate Control | dark | 97 | PASS | P3 | Stable | 1 | 2 | 0/0 | 2 |
| zoSer | SkillsIndex / API Key Scope Governance Light | light | 98 | PASS | P3 | Stable | 0 | 15 | 0/0 | 2 |
| VnXd5 | SkillsIndex / Account Configuration Form Light | light | 98 | PASS | P3 | Stable | 0 | 15 | 1/1 | 0 |
| QytKJ | SkillsIndex / Account Management List Light | light | 98 | PASS | P3 | Stable | 0 | 23 | 1/1 | 0 |
| 4uI2f | SkillsIndex / Admin Navigation Dashboard Light | light | 98 | PASS | P3 | Stable | 0 | 39 | 1/1 | 0 |
| Tekay | SkillsIndex / Backup Recovery Drill Light | light | 98 | PASS | P3 | Stable | 0 | 15 | 0/0 | 2 |
| xWuAh | SkillsIndex / Enterprise Identity SSO Gateway Light | light | 98 | PASS | P3 | Stable | 0 | 37 | 1/1 | 0 |
| ws5gl | SkillsIndex / Import Operation Records Light | light | 98 | PASS | P3 | Stable | 0 | 16 | 1/1 | 0 |
| hhChl | SkillsIndex / Moderation Case List Light | light | 98 | PASS | P3 | Stable | 0 | 29 | 1/1 | 0 |
| PZuxg | SkillsIndex / Moderation Governance Hub Light | light | 98 | PASS | P3 | Stable | 0 | 33 | 1/1 | 0 |
| 4I1Pa | SkillsIndex / Moderation Postmortem Detail Light | light | 98 | PASS | P3 | Stable | 0 | 14 | 1/1 | 0 |
| 2AtTH | SkillsIndex / Moderation Response Console Light | light | 98 | PASS | P3 | Stable | 0 | 14 | 1/1 | 0 |
| yUr4x | SkillsIndex / Ops Compliance Observatory Light | light | 98 | PASS | P3 | Stable | 0 | 15 | 0/0 | 2 |
| de8jd | SkillsIndex / Organization Governance List Light | light | 98 | PASS | P3 | Stable | 0 | 24 | 1/1 | 0 |
| lUYVK | SkillsIndex / Organization Workspace Governance Hub Light | light | 98 | PASS | P3 | Stable | 0 | 46 | 1/1 | 0 |
| NAQSD | SkillsIndex / Release Gate Control Light | light | 98 | PASS | P3 | Stable | 0 | 15 | 0/0 | 2 |
| 5SPsP | SkillsIndex / Role Management List Light | light | 98 | PASS | P3 | Stable | 0 | 16 | 1/1 | 0 |
| HaDLR | SkillsIndex / SSO Provider Configuration Light | light | 98 | PASS | P3 | Stable | 0 | 14 | 1/1 | 0 |
| 6TdtI | SkillsIndex / SSO Provider List Light | light | 98 | PASS | P3 | Stable | 0 | 27 | 1/1 | 0 |
| BShPb | SkillsIndex / Sync Operation Records Light | light | 98 | PASS | P3 | Stable | 0 | 13 | 1/1 | 0 |

## 5. Review Notes

1. Current architecture and layout consistency are stable after the last pass.
2. Remaining risk is concentrated in dark workflow pages with high accent density.
3. Light pages are mostly stable but a few still rely on flat pale stacks in dense regions.
4. Next pass should focus on accent reduction and role-aware action hierarchy in high-density modules.
