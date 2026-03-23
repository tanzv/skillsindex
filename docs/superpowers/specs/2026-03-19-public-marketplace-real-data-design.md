# Public Marketplace Real Data Design

Date: 2026-03-19

## Background

The public marketplace routes already call backend APIs, but the product is still only partially data-realized:

1. Public pages silently fall back to bundled data when backend requests fail.
2. Ranking is derived in the frontend from a generic marketplace payload instead of a stable backend business contract.
3. Skill detail still synthesizes related skills from frontend fallback data.
4. Some hero and narrative surfaces are static shells that do not reflect marketplace runtime state.

This creates a mismatch between interface expectations and actual business behavior.

## Goal

Turn the public marketplace into a backend-owned product surface where core user decisions are driven by real service data.

Core goals:

1. Backend owns marketplace listing, taxonomy counts, ranking-ready payloads, skill detail, related skills, resources, versions, and interaction aggregates.
2. Frontend consumes the backend contract directly for all primary marketplace journeys.
3. Fallback remains limited to explicit failure states or development-only fixtures, not silent production behavior.
4. The implementation preserves current route structure and shell composition.

## Non-Goals

1. No route redesign for the public marketplace.
2. No full admin workflow rebuild in this change.
3. No external search engine or vector database introduction.
4. No large-scale visual redesign.

## Scope

This execution is split into incremental slices.

### Slice 1

1. Replace fake related skills on the public skill detail page with backend-owned related skill recommendations.
2. Extend the public skill detail API contract to return related skills.
3. Update the frontend detail model to consume real related skill data.

### Later slices

1. Backend-owned ranking payloads.
2. Marketplace hero/runtime metrics.
3. Removal of silent public-page fallback for listing pages.
4. Dedicated timeline/runtime summary endpoints where narrative pages require real signals.

## Architecture

### Backend ownership

The backend `SkillService` remains the business owner for marketplace-visible skills. We extend the public-detail domain with a related-skill query that:

1. Validates viewer access through the existing marketplace visibility rules.
2. Restricts candidates to imported marketplace records.
3. Scores candidates by subcategory match, category match, shared tags, quality, stars, and freshness.
4. Returns a bounded list for frontend rendering.

### API contract

The public detail API remains the aggregation point for detail page data. It will now return:

1. `skill`
2. `stats`
3. `viewer_state`
4. `comments`
5. `related_skills`

This keeps the detail page on one fetch path for its above-the-fold and supplementary content.

### Frontend ownership

The frontend detail model stops deriving related skills from `fallbackSkills`. Instead it consumes `detail.related_skills`, with fallback retained only as a compatibility safety net for tests and temporary degraded states.

## Data Rules

1. Seed records stay excluded from public marketplace contracts.
2. The current skill must never appear in `related_skills`.
3. Related skill ordering must be deterministic.
4. Empty related results are valid and must not be replaced with misleading fake recommendations in the normal success path.

## Extension Points

1. The backend scoring helper can later be replaced by curated rules, organization-aware recommendations, or semantic similarity.
2. The API field can later expose recommendation reasons without breaking the array contract.
3. Ranking and homepage metrics can reuse the same service-level scoring and aggregation patterns.

## Assumptions

1. Existing imported marketplace records are the current source of truth.
2. Public taxonomy remapping in the frontend remains acceptable for now.
3. This slice optimizes business truthfulness before broadening into richer recommendation systems.

## Testing Strategy

1. Add backend API coverage proving `related_skills` is populated from real imported records and excludes the current skill.
2. Add frontend model coverage proving related skill rendering comes from API payloads, not fallback-only derivation.
3. Run focused backend and frontend test commands for the changed scope before broader verification.
