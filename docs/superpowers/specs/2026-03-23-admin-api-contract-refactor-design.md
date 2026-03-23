# Admin API Contract Refactor Design

Date: 2026-03-23

## Background

The current backend already exposes a broad `Admin` API surface, but the contract shape reflects multiple implementation eras:

1. resource-style endpoints and command-style endpoints are mixed in one transport root
2. current JSON APIs and legacy form-oriented dashboard routes coexist
3. compatibility aliases such as `sync-jobs` and `sync-runs` are both active
4. some endpoints are named after page buttons instead of stable domain concepts

This is workable for the current product, but it makes long-term API ownership harder:

1. frontend route contracts are easier to drift away from backend truth
2. adding new admin features risks growing one large routing aggregate
3. permissions, observability, and DTO reuse become harder to govern by domain
4. future external or BFF consumers have to learn inconsistent resource semantics

## Goal

Define a target `Admin` API contract that is domain-oriented, transport-friendly, and migration-safe.

Core goals:

1. split the admin API into clear bounded domains instead of one broad dashboard route family
2. distinguish read resources from write commands without losing current behavior coverage
3. establish one canonical endpoint family per workflow and relegate aliases to explicit compatibility status
4. preserve backward compatibility by default during migration
5. give the frontend and BFF a stable backend-owned contract map for future work

## Non-Goals

1. no immediate handler rewrite in this design slice
2. no breaking removal of existing endpoints in this slice
3. no frontend route redesign in this slice
4. no introduction of a new API version prefix beyond the current `/api/v1`
5. no change to auth/session authority ownership

## Scope

This design covers the `Admin` JSON API under `/api/v1/admin/**`.

Included:

1. target domain split
2. canonical resource tree
3. command endpoint rules
4. compatibility and deprecation policy
5. migration phases
6. verification strategy

Excluded:

1. legacy HTML form routes under `/admin/**`
2. public marketplace contract redesign
3. account self-service contract redesign
4. service-layer internal refactors beyond what is necessary to support the target contract

## Design Principles

1. Backend owns admin business truth; frontend and BFF only adapt it.
2. One domain should expose one coherent contract family.
3. Read models should be resource-oriented.
4. Mutations may stay command-oriented when the action is not a natural CRUD update, but command naming must be explicit and consistent.
5. Compatibility aliases must be documented as aliases, not left as accidental duplicates.
6. Route registration should mirror domain ownership.

## Current Pain Points

### 1. One oversized admin transport aggregate

The current `registerDashboardRoutes` function registers admin pages, admin JSON APIs, skill-owner version APIs, and legacy dashboard form handlers together. This makes the web layer a hidden owner of multiple unrelated domains.

### 2. Mixed contract styles

The current API mixes these patterns:

1. resource queries
   - `/api/v1/admin/accounts`
   - `/api/v1/admin/organizations`
2. command endpoints
   - `/api/v1/admin/jobs/{jobID}/retry`
   - `/api/v1/admin/ops/release-gates/run`
3. compatibility aliases
   - `/api/v1/admin/sync-jobs`
   - `/api/v1/admin/sync-runs`

The issue is not that commands exist. The issue is that there is no explicit contract rule for when to model a write as a resource update versus a domain command.

### 3. Dashboard-page naming leaking into the API

Some endpoint groupings reflect page structure more than durable domain structure. This makes growth easy in the short term but weakens long-term API semantics.

## Target Domain Split

The admin API should be organized into these bounded domains:

1. `Admin Overview`
   - capability and aggregate summary reads
2. `Admin Ingestion`
   - skill intake workflows and ingestion jobs
3. `Admin Sync Governance`
   - scheduler policy and sync run records
4. `Admin Access Governance`
   - accounts, roles, auth provider policy, registration posture, directory sync
5. `Admin Organization Governance`
   - organizations and memberships
6. `Admin Security`
   - admin API keys and moderation
7. `Admin Operations`
   - metrics, alerts, release gates, audit export, backup, drill, and release records

This split should exist in three places:

1. route registration modules
2. handler group structs
3. service-facing contract DTO ownership

## Target Resource Tree

### 1. Admin Overview

Canonical read:

- `GET /api/v1/admin/overview`

This remains a thin aggregate endpoint because it is inherently a dashboard summary contract.

### 2. Admin Ingestion

Canonical contract family:

- `POST /api/v1/admin/ingestion/manual`
- `POST /api/v1/admin/ingestion/upload`
- `POST /api/v1/admin/ingestion/repository`
- `POST /api/v1/admin/ingestion/skillmp`
- `GET /api/v1/admin/skills`
- `GET /api/v1/admin/jobs`
- `GET /api/v1/admin/jobs/{jobID}`
- `POST /api/v1/admin/jobs/{jobID}/retry`
- `POST /api/v1/admin/jobs/{jobID}/cancel`

Design intent:

1. keep skill intake endpoints command-style because they start workflows rather than mutate one natural resource representation
2. keep `jobs` as the canonical asynchronous workflow resource
3. avoid introducing `/api/v1/admin/records/imports` as a backend canonical endpoint unless a dedicated import-record aggregate truly exists

### 3. Admin Sync Governance

Canonical contract family:

- `GET /api/v1/admin/sync-policies`
- `GET /api/v1/admin/sync-policies/{policyID}`
- `POST /api/v1/admin/sync-policies/create`
- `POST /api/v1/admin/sync-policies/{policyID}/update`
- `POST /api/v1/admin/sync-policies/{policyID}/toggle`
- `POST /api/v1/admin/sync-policies/{policyID}/delete`
- `GET /api/v1/admin/sync-policy/repository`
- `POST /api/v1/admin/sync-policy/repository`
- `GET /api/v1/admin/sync-jobs`
- `GET /api/v1/admin/sync-jobs/{runID}`

Compatibility alias:

- `GET /api/v1/admin/sync-runs`
- `GET /api/v1/admin/sync-runs/{runID}`

Design intent:

1. `sync-jobs` is the canonical read family because that is already the stronger shared contract in the product
2. `sync-runs` stays as a compatibility alias only
3. all new frontend and BFF consumers should target `sync-jobs`

### 4. Admin Access Governance

Canonical contract family:

- `GET /api/v1/admin/accounts`
- `POST /api/v1/admin/accounts/{userID}/status`
- `POST /api/v1/admin/accounts/{userID}/force-signout`
- `POST /api/v1/admin/accounts/{userID}/password-reset`
- `POST /api/v1/admin/users/{userID}/role`
- `GET /api/v1/admin/settings/registration`
- `POST /api/v1/admin/settings/registration`
- `GET /api/v1/admin/settings/auth-providers`
- `POST /api/v1/admin/settings/auth-providers`
- `GET /api/v1/admin/user-center/accounts`
- `POST /api/v1/admin/user-center/sync`
- `GET /api/v1/admin/user-center/permissions/{userID}`
- `POST /api/v1/admin/user-center/permissions/{userID}`

Design intent:

1. keep policy endpoints under `settings`
2. keep account operational controls under `accounts/{userID}/...`
3. keep enterprise-directory-style workflows under `user-center`
4. do not create a synthetic `/api/v1/admin/access` aggregate endpoint unless the backend intentionally owns a stable aggregate DTO for that view

### 5. Admin Organization Governance

Canonical contract family:

- `GET /api/v1/admin/organizations`
- `POST /api/v1/admin/organizations`
- `GET /api/v1/admin/organizations/{orgID}/members`
- `POST /api/v1/admin/organizations/{orgID}/members`
- `POST /api/v1/admin/organizations/{orgID}/members/{userID}/role`
- `POST /api/v1/admin/organizations/{orgID}/members/{userID}/remove`

Design intent:

This family is already close to a coherent domain contract. It should remain separate from account policy endpoints.

### 6. Admin Security

Canonical contract family:

- `GET /api/v1/admin/apikeys`
- `POST /api/v1/admin/apikeys`
- `GET /api/v1/admin/apikeys/{keyID}`
- `POST /api/v1/admin/apikeys/{keyID}/revoke`
- `POST /api/v1/admin/apikeys/{keyID}/rotate`
- `POST /api/v1/admin/apikeys/{keyID}/scopes`
- `GET /api/v1/admin/moderation`
- `POST /api/v1/admin/moderation`
- `POST /api/v1/admin/moderation/{caseID}/resolve`
- `POST /api/v1/admin/moderation/{caseID}/reject`

Design intent:

1. `apikeys` is a manageable lifecycle resource family
2. `moderation` is a queue-and-decision family
3. both should remain separate from `access` because they serve different operators and permissions

### 7. Admin Operations

Canonical contract family:

- `GET /api/v1/admin/ops/metrics`
- `GET /api/v1/admin/ops/alerts`
- `GET /api/v1/admin/ops/audit-export`
- `GET /api/v1/admin/ops/release-gates`
- `POST /api/v1/admin/ops/release-gates/run`
- `GET /api/v1/admin/ops/recovery-drills`
- `POST /api/v1/admin/ops/recovery-drills/run`
- `GET /api/v1/admin/ops/releases`
- `POST /api/v1/admin/ops/releases`
- `GET /api/v1/admin/ops/change-approvals`
- `POST /api/v1/admin/ops/change-approvals`
- `GET /api/v1/admin/ops/backup/plans`
- `POST /api/v1/admin/ops/backup/plans`
- `GET /api/v1/admin/ops/backup/runs`
- `POST /api/v1/admin/ops/backup/runs`

Design intent:

1. `ops` is explicitly an operational-record and operational-signal family
2. reads remain resource-oriented
3. writes remain command-like or record-create-like, depending on the workflow
4. `run` suffixes are acceptable when the action is clearly an execution command rather than a CRUD update

## Command Modeling Rules

Use these rules for future admin mutations.

### Use resource-style writes when:

1. the operation is a normal create of a durable record
2. the update replaces or amends a stable resource representation
3. the result is naturally understood as the latest state of one resource

Examples:

1. `POST /api/v1/admin/organizations`
2. `POST /api/v1/admin/ops/releases`
3. `POST /api/v1/admin/ops/change-approvals`

### Use command-style writes when:

1. the operation starts a workflow
2. the action is not well represented as a standard resource update
3. the business meaning is operational execution rather than record replacement

Examples:

1. `POST /api/v1/admin/jobs/{jobID}/retry`
2. `POST /api/v1/admin/jobs/{jobID}/cancel`
3. `POST /api/v1/admin/ops/release-gates/run`
4. `POST /api/v1/admin/accounts/{userID}/force-signout`

### Rules to avoid:

1. do not create aggregate endpoints just because one page wants multiple payloads
2. do not invent route families named after UI tabs unless the backend owns that aggregate as a stable contract
3. do not add aliases without explicitly marking one canonical path

## Transport Layer Refactor Shape

The backend web layer should move toward these registration modules:

1. `registerAdminOverviewRoutes`
2. `registerAdminIngestionRoutes`
3. `registerAdminSyncGovernanceRoutes`
4. `registerAdminAccessRoutes`
5. `registerAdminOrganizationRoutes`
6. `registerAdminSecurityRoutes`
7. `registerAdminOperationsRoutes`

This does not require changing URL paths first. It changes code ownership first so the transport layer reflects the intended contract boundaries.

## Compatibility Strategy

### Canonical vs Alias

Each duplicated endpoint family must explicitly define:

1. canonical path
2. alias path
3. new-consumer rule
4. removal condition

For the current state:

1. canonical: `/api/v1/admin/sync-jobs`
2. alias: `/api/v1/admin/sync-runs`
3. rule: new consumers must use `sync-jobs`
4. removal condition: once all known consumers and docs migrate

### Legacy dashboard form routes

Legacy `/admin/**` form routes may continue during migration, but:

1. no new consumers should depend on them
2. all new integrations should bind to `/api/v1/admin/**`
3. they should be tracked as compatibility shims, not equal peers of JSON APIs

## Migration Plan

### Phase 1: Contract governance

1. declare canonical endpoint families in docs and OpenAPI
2. label aliases explicitly in docs and tests
3. remove phantom or page-invented endpoint declarations from frontend shared route contracts

### Phase 2: Transport split

1. split route registration by admin domain
2. split handler aggregates by admin domain
3. keep paths stable while changing code ownership

### Phase 3: Consumer convergence

1. update BFF and frontend shared contracts to canonical paths only
2. reduce alias usage in tests and internal clients
3. record remaining compatibility consumers

### Phase 4: Alias retirement

1. remove deprecated aliases after all known consumers are migrated
2. update OpenAPI and compatibility notes in the same change set

## Extension Points

1. the same domain-split rule can later be applied to `Account` and `Interaction`
2. command endpoints can later evolve into explicit command resources if audit or retry semantics need richer modeling
3. the admin API can later add stronger versioning or deprecation metadata once the contract surface stabilizes

## Assumptions

1. backward compatibility remains the default policy
2. the product still needs both JSON APIs and some legacy dashboard form flows during migration
3. the frontend does not require a single synthetic backend endpoint for every admin page
4. admin domains are the correct unit of route ownership in the backend web layer

## Testing Strategy

1. keep OpenAPI coverage for every canonical endpoint family
2. add tests that encode canonical-vs-alias expectations where aliases exist
3. add frontend shared-contract tests to prevent phantom admin endpoint declarations
4. when route registration is split, keep transport tests proving all existing paths still resolve
5. verify backend changes with:
   - `cd backend && go test ./...`
   - `cd backend && go vet ./...`
   - `./scripts/check_max_lines.sh`

## Recommended Next Slice

The next implementation slice should be:

1. split `registerDashboardRoutes` into domain-specific admin route registration modules
2. keep URL paths unchanged
3. mark `sync-jobs` as canonical and `sync-runs` as compatibility alias in code comments and tests
4. leave handler behavior unchanged except where required to align module ownership
