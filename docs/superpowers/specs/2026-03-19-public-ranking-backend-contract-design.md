# Public Ranking Backend Contract Design

Date: 2026-03-19

## Background

The public rankings route currently fetches the generic marketplace payload and then computes ranking order, highlight cards, summary chips, and category leaders in the frontend.

That keeps the page visually working, but it means the ranking business contract is still split across two layers:

1. The backend returns a generic card list.
2. The frontend decides what "top", "highlight", and "leader" mean.

This makes the ranking page harder to evolve consistently and prevents reuse for homepage hero metrics or other leaderboard-like surfaces.

## Goal

Make the rankings route consume a backend-owned ranking contract.

Core goals:

1. The backend owns ranking ordering for `stars` and `quality`.
2. The backend owns the derived ranking sections used by the page.
3. The frontend stops building ranking business logic from the generic marketplace payload on the success path.
4. The existing route structure, compare flow, and degraded fallback behavior remain compatible.

## Non-Goals

1. No redesign of the rankings UI.
2. No homepage hero or top-metrics work in this slice.
3. No compare-page contract rewrite in this slice.
4. No taxonomy remapping migration from frontend to backend in this slice.

## Scope

This slice adds a dedicated public ranking endpoint and connects the rankings page to it.

Included:

1. New public rankings API contract.
2. Backend ranking aggregation service logic.
3. Frontend rankings fetch path and degraded fallback.
4. Focused backend, frontend, build, and e2e verification.

Excluded:

1. Landing page metrics.
2. Ranking pagination beyond the current visible deck needs.
3. Public marketplace listing fallback cleanup.

## Architecture

### Backend ownership

The backend `SkillService` will expose a dedicated ranking query that:

1. Applies the marketplace public visibility rules.
2. Restricts data to imported marketplace records.
3. Orders records deterministically by the requested ranking sort.
4. Produces a response payload with:
   - ordered ranking items
   - top highlight items
   - summary metrics
   - category leader aggregates

### API contract

A new endpoint will be added:

- `GET /api/v1/public/rankings`

It will accept:

1. `sort=stars|quality`

It will return:

1. `sort`
2. `ranked_items`
3. `highlights`
4. `list_items`
5. `summary`
6. `category_leaders`

`ranked_items` gives the frontend a stable list for compare defaults and future extensions, while `highlights` and `list_items` let the page render without rebuilding ranking slices locally.

### Frontend ownership

The rankings page becomes a consumer of `PublicRankingResponse`.

On the normal success path:

1. The page fetches the ranking contract.
2. The page renders the returned sections directly.
3. Compare defaults resolve from `ranked_items` instead of `marketplace.items`.

Fallback remains explicit and local for degraded states only.

## Data Rules

1. Only public imported skills participate in ranking.
2. Ranking order must be deterministic.
3. `stars` sort orders by stars, then quality, then update time, then id.
4. `quality` sort orders by quality, then stars, then update time, then id.
5. Category leaders aggregate from the ranking dataset, not from frontend heuristics.
6. Query noise such as legacy `tags` on the rankings URL must not break the route.

## Extension Points

1. Additional ranking windows such as weekly or trending can extend the same endpoint.
2. Summary metrics can be reused by homepage hero and deck surfaces later.
3. Ranking reason metadata can be appended without changing the core item arrays.
4. Category leaders can later expose richer taxonomy metadata if backend taxonomy ownership is introduced.

## Assumptions

1. Imported public marketplace records remain the source of truth for rankings.
2. Frontend taxonomy presentation mapping remains acceptable for skill labels.
3. The current page only needs a bounded top ranking dataset instead of unbounded pagination.

## Testing Strategy

1. Add backend service coverage for deterministic ranking order and category leader aggregation.
2. Add backend API coverage for the new public rankings payload.
3. Add frontend coverage showing the rankings page uses API-owned ranking sections.
4. Run targeted backend tests, frontend unit tests, frontend build, and rankings e2e coverage.
