# Public Marketplace Real Data Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the public skill detail page consume backend-owned related skill recommendations instead of frontend fallback data.

**Architecture:** Extend the backend public-detail service contract with deterministic related-skill selection derived from imported marketplace records, then thread that contract through the public detail API and frontend detail model. Keep route structure intact and limit fallback usage to compatibility/degraded-state handling.

**Tech Stack:** Go, Chi, Gorm, Next.js, React, TypeScript, Vitest, Go test.

---

## File Structure

### Modify
- `backend/internal/services/skill_service_public_detail_extensions.go`
  - Add marketplace related-skill query logic and deterministic scoring helpers.
- `backend/internal/web/app_public_skill_detail_api.go`
  - Include `related_skills` in the public skill detail payload.
- `backend/internal/web/openapi_schemas_core.go`
  - Document the new response field.
- `backend/internal/web/app_public_skill_detail_api_test.go`
  - Add API coverage for related skill payload behavior.
- `frontend-next/src/lib/schemas/public.ts`
  - Extend the frontend detail schema with `related_skills`.
- `frontend-next/src/features/public/publicSkillDetailModel.ts`
  - Consume API-provided related skills before any compatibility fallback.
- `frontend-next/src/features/public/publicSkillDetailFallback.ts`
  - Mirror the new shape for degraded states and tests.
- `frontend-next/tests/unit/public-skill-detail-model.test.ts`
  - Verify the model prefers API related skills.

## Chunk 1: Backend related skill contract

### Task 1: Add a failing backend detail API test for related skills
- [ ] Write a test in `backend/internal/web/app_public_skill_detail_api_test.go` that seeds one current public imported skill, multiple candidate imported skills, and one unrelated candidate.
- [ ] Assert the detail response includes `related_skills`, excludes the current skill, and returns the most related candidate first.
- [ ] Run `cd backend && go test ./internal/web -run TestHandleAPIPublicSkillDetailIncludesRelatedSkills -v` and confirm failure.

### Task 2: Implement backend related skill selection
- [ ] Add `ListMarketplaceRelatedSkills` to `backend/internal/services/skill_service_public_detail_extensions.go`.
- [ ] Reuse marketplace visibility rules and imported-record filtering.
- [ ] Score candidates by subcategory, category, shared tags, quality, stars, and update time.
- [ ] Return a deterministic limited list.
- [ ] Run the focused Go test and confirm pass.

### Task 3: Thread the field through the public detail API
- [ ] Update `backend/internal/web/app_public_skill_detail_api.go` to include `related_skills` in the JSON response.
- [ ] Update `backend/internal/web/openapi_schemas_core.go` with the new field.
- [ ] Re-run `cd backend && go test ./internal/web -run 'TestHandleAPIPublicSkillDetail' -v`.

## Chunk 2: Frontend related skill consumption

### Task 4: Add a failing frontend detail-model test
- [ ] Update `frontend-next/tests/unit/public-skill-detail-model.test.ts` so the detail payload contains explicit `related_skills` and the expectation verifies the model uses them.
- [ ] Run `cd frontend-next && npm run test:unit -- tests/unit/public-skill-detail-model.test.ts` and confirm failure.

### Task 5: Implement frontend schema and model support
- [ ] Extend `frontend-next/src/lib/schemas/public.ts` with `related_skills`.
- [ ] Update `frontend-next/src/features/public/publicSkillDetailModel.ts` to prefer `detail.related_skills` and only use bundled fallback as a compatibility fallback.
- [ ] Update `frontend-next/src/features/public/publicSkillDetailFallback.ts` to provide `related_skills` in degraded mode.
- [ ] Re-run the focused frontend test and confirm pass.

## Chunk 3: Focused verification

### Task 6: Verify changed backend scope
- [ ] Run `cd backend && go test ./internal/web -run 'TestHandleAPIPublicSkillDetail|TestHandleAPIPublicSkillResources|TestHandleAPIPublicSkillVersions' -v`.

### Task 7: Verify changed frontend scope
- [ ] Run `cd frontend-next && npm run test:unit -- tests/unit/public-skill-detail-model.test.ts tests/unit/skill-detail-workbench.test.ts tests/unit/load-initial-skill-detail-page-data.test.ts`.

### Task 8: Record residual follow-up
- [ ] Document that ranking, homepage hero metrics, and silent listing fallbacks remain for later slices.
