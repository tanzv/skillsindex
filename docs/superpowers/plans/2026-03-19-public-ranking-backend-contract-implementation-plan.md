# Public Ranking Backend Contract Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the public rankings page consume a backend-owned ranking contract instead of deriving ranking business logic from the generic marketplace payload.

**Architecture:** Add a dedicated public rankings endpoint backed by service-level ranking aggregation. Return ordered items, highlight slices, summary metrics, and category leaders from the backend, then thread that contract through the frontend rankings route with degraded fallback support only.

**Tech Stack:** Go, Chi, Gorm, Next.js, React, TypeScript, Vitest, Playwright.

---

## File Structure

### Create
- `backend/internal/web/app_public_rankings_api.go`
  - Public rankings handler and API payload mapping.

### Modify
- `backend/internal/services/skill_service.go`
  - Add ranking response/domain types.
- `backend/internal/services/skill_service_public_search.go`
  - Add public rankings aggregation logic on top of marketplace-visible imported skills.
- `backend/internal/services/skill_service_test.go`
  - Add service-level ranking aggregation coverage.
- `backend/internal/web/app_routing_api_routes.go`
  - Register the new public rankings endpoint.
- `backend/internal/web/openapi_paths_public_auth.go`
  - Add the public rankings path.
- `backend/internal/web/openapi_schemas_core.go`
  - Add ranking schemas.
- `backend/internal/web/openapi_test.go`
  - Assert the new path exists.
- `backend/internal/web/app_public_marketplace_api_test.go`
  - Add API coverage for the new rankings payload.
- `frontend-next/src/lib/schemas/public.ts`
  - Add `PublicRankingResponse` and related types.
- `frontend-next/src/lib/api/public.ts`
  - Add `fetchRanking`.
- `frontend-next/app/(public)/rankings/page.tsx`
  - Fetch ranking contract instead of generic marketplace payload for page rendering.
- `frontend-next/src/features/public/PublicRankingPage.tsx`
  - Render API-provided ranking sections directly.
- `frontend-next/src/features/public/publicRankingModel.ts`
  - Replace local ranking derivation helpers with fallback payload construction helpers or narrow adapter logic.
- `frontend-next/src/features/public/publicMarketplaceFallback.ts`
  - Expose a ranking fallback builder backed by bundled skills.
- `frontend-next/src/features/public/publicCompareModel.ts`
  - Resolve compare defaults from a skill list for rankings.
- `frontend-next/scripts/mock-backend-public.mjs`
  - Add mock rankings endpoint for e2e.
- `frontend-next/tests/unit/public-ranking-model.test.ts`
  - Convert to ranking payload/fallback coverage.
- `frontend-next/tests/unit/public-ranking-page.test.ts`
  - Verify the page renders API-owned ranking sections and canonical links.

## Chunk 1: Backend ranking contract

### Task 1: Add failing backend API coverage
- [ ] Add a new rankings API test in `backend/internal/web/app_public_marketplace_api_test.go`.
- [ ] Seed imported public skills that make stars order and quality order differ.
- [ ] Assert the rankings payload includes `sort`, `ranked_items`, `highlights`, `list_items`, `summary`, and `category_leaders`.
- [ ] Run `cd backend && go test ./internal/web -run TestHandleAPIPublicRankings -count=1 -v` and confirm failure.

### Task 2: Implement service-level ranking aggregation
- [ ] Add ranking domain structs in `backend/internal/services/skill_service.go`.
- [ ] Implement deterministic public ranking aggregation in `backend/internal/services/skill_service_public_search.go`.
- [ ] Reuse marketplace public imported scope and deterministic tie-break rules.
- [ ] Add service coverage in `backend/internal/services/skill_service_test.go`.
- [ ] Run `cd backend && go test ./internal/services -run TestBuildPublicRanking -count=1 -v`.

### Task 3: Expose public rankings API
- [ ] Create `backend/internal/web/app_public_rankings_api.go`.
- [ ] Register `GET /api/v1/public/rankings` in `backend/internal/web/app_routing_api_routes.go`.
- [ ] Update OpenAPI path/schema files and the OpenAPI path test.
- [ ] Run `cd backend && go test ./internal/web -run 'TestHandleAPIPublicRankings|TestBuildOpenAPISpec' -count=1 -v`.

## Chunk 2: Frontend rankings real-data wiring

### Task 4: Add failing frontend ranking tests
- [ ] Update `frontend-next/tests/unit/public-ranking-page.test.ts` to render from a `PublicRankingResponse`.
- [ ] Update `frontend-next/tests/unit/public-ranking-model.test.ts` to validate fallback ranking payload shape instead of frontend-owned ranking derivation.
- [ ] Run `cd frontend-next && ./node_modules/.bin/vitest run tests/unit/public-ranking-page.test.ts tests/unit/public-ranking-model.test.ts` and confirm failure.

### Task 5: Add ranking schema, fetcher, and fallback
- [ ] Extend `frontend-next/src/lib/schemas/public.ts` with ranking response types.
- [ ] Add `fetchRanking` to `frontend-next/src/lib/api/public.ts`.
- [ ] Adapt `frontend-next/src/features/public/publicRankingModel.ts` for fallback ranking payload generation or a narrow adapter only.
- [ ] Add ranking fallback support in `frontend-next/src/features/public/publicMarketplaceFallback.ts`.

### Task 6: Switch rankings route to real API
- [ ] Update `frontend-next/app/(public)/rankings/page.tsx` to fetch the ranking contract and only use fallback on request failure.
- [ ] Update `frontend-next/src/features/public/PublicRankingPage.tsx` to consume `PublicRankingResponse`.
- [ ] Update `frontend-next/src/features/public/publicCompareModel.ts` to resolve compare defaults from ranking items.
- [ ] Update `frontend-next/scripts/mock-backend-public.mjs` to serve `/api/v1/public/rankings`.
- [ ] Re-run `cd frontend-next && ./node_modules/.bin/vitest run tests/unit/public-ranking-page.test.ts tests/unit/public-ranking-model.test.ts`.

## Chunk 3: Verification

### Task 7: Verify backend scope
- [ ] Run `cd backend && go test ./internal/services -run 'TestBuildPublicRanking|TestListMarketplaceRelatedSkills' -count=1 -v`.
- [ ] Run `cd backend && go test ./internal/web -run 'TestHandleAPIPublicRankings|TestHandleAPIPublicMarketplace|TestBuildOpenAPISpec' -count=1 -v`.

### Task 8: Verify frontend scope
- [ ] Run `cd frontend-next && ./node_modules/.bin/eslint src/lib/schemas/public.ts src/lib/api/public.ts src/features/public/PublicRankingPage.tsx src/features/public/publicRankingModel.ts src/features/public/publicMarketplaceFallback.ts tests/unit/public-ranking-page.test.ts tests/unit/public-ranking-model.test.ts`.
- [ ] Run `cd frontend-next && ./node_modules/.bin/vitest run tests/unit/public-ranking-page.test.ts tests/unit/public-ranking-model.test.ts tests/unit/public-compare-model.test.ts`.
- [ ] Run `cd frontend-next && npm run build`.
- [ ] Run `cd frontend-next && npm run test:e2e -- tests/e2e/public-routes.spec.ts --grep 'renders the rankings compatibility route|keeps the rankings page visible when semantic tags are present in the URL'`.

### Task 9: Record follow-up
- [ ] Note that homepage hero metrics and public listing fallback cleanup remain later slices.
