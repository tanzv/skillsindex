# Admin Layout Baseline

## Purpose

This file records the current layout contracts that `frontend-next/` must preserve for `Admin`.
It does not require visual identity parity, but it does require operator workflow parity.

## Global Shell Contract

Current admin pages render inside the protected backend shell.

### Shell Structure

1. Top backend header
   - brand/title area
   - primary navigation sections
   - marketplace link
   - user control dropdown
2. Secondary navigation column
   - section-scoped route list
   - optional collapse behavior
3. Main panel
   - optional quick-jump row
   - page content

## Layout Patterns By Route Family

### `/admin/overview`

Primary pattern:

1. dedicated dashboard canvas
2. KPI and module summary blocks
3. no left-side data table as dominant structure
4. overview cards dominate the page

Preservation rule:

1. keep it as a dashboard-style landing page, not a list/detail CRUD page

### `/admin/ingestion/manual`
### `/admin/ingestion/repository`
### `/admin/records/imports`

Primary pattern:

1. left/main execution workspace
2. structured form or operations area
3. right/context summary and guidance area
4. actions placed near the working surface

Preservation rule:

1. maintain the relationship between main operation area and contextual summary panel

### `/admin/skills`
### `/admin/jobs`
### `/admin/sync-jobs`
### `/admin/sync-policy/repository`

Primary pattern:

1. list-first admin surface
2. top summary/header block
3. table or structured list in the main body
4. detail, summary, or policy information adjacent to the list

Preservation rule:

1. preserve list-first orientation and filter/action placement above or alongside the list

### `/admin/ops/*`
### `/admin/integrations`

Primary pattern:

1. operational dashboard or control surface
2. summary signals first
3. logs, records, or control forms below or adjacent
4. actions remain close to the relevant operational block

Preservation rule:

1. do not convert operations pages into generic flat CRUD tables

### `/admin/accounts`
### `/admin/accounts/new`
### `/admin/roles`
### `/admin/roles/new`
### `/admin/access`
### `/admin/organizations`

Primary pattern:

1. governance-first information hierarchy
2. account, role, permission, or organization control in the main region
3. supporting context, policy, or detail information in secondary regions

Preservation rule:

1. keep governance controls in the primary region and policy/context in secondary regions

### `/admin/apikeys`
### `/admin/moderation`

Primary pattern:

1. case or key inventory surface
2. status/action-heavy controls
3. contextual summary panel or evidence structure

Preservation rule:

1. keep action placement and status visibility strong and local to the controlled entities

## Action Placement Rules

1. Quick-jump actions remain in the shell-level main panel header area.
2. Page-specific primary actions stay inside the page content, close to the data or form they affect.
3. Admin destructive or governance-sensitive actions must remain isolated from passive metadata.

## Filter And Detail Placement Rules

1. List-oriented admin routes must keep filters above or adjacent to the list.
2. Detail and policy context must remain visually subordinate to the primary working region.
3. Admin pages that already use two-region compositions must keep that left/main + right/context structure.
