# Backend Governance Policy

Version: 1.0
Last Updated: 2026-03-20
Owner: Backend Architecture

## Objective

Define the repository-wide governance model for all backend code under `backend/`.

## Scope

This policy applies to:

1. command entrypoints under `backend/cmd/**`
2. runtime composition under `backend/internal/bootstrap/**`
3. HTTP delivery under `backend/internal/web/**`
4. application services under `backend/internal/services/**`
5. persistence and schema code under `backend/internal/db/**`
6. shared backend domain models and backend-owned contracts

## Backend Responsibility Model

1. The backend is the system of record for business rules, persistence, auth/session semantics, audit behavior, and public or admin API contracts.
2. Frontend or BFF layers may adapt backend contracts, but they must not become the hidden owner of backend business truth.
3. Business invariants must remain enforceable without requiring a specific web page, route, or client runtime.

## Runtime Governance

1. Command entrypoints must stay thin and delegate runtime assembly to bootstrap code.
2. Normal server startup must primarily compose dependencies, start transport servers, and register lifecycle-managed background work.
3. Long-running schedulers, pollers, and background coordinators must be explicitly owned by runtime lifecycle code and must stop when the root context is canceled.
4. Environment-based runtime defaults must be validated before side effects begin.

## Data Mutation On Startup

1. Normal server startup must not silently mutate business data beyond explicitly approved initialization tasks.
2. Schema migrations must be idempotent and safe to run repeatedly.
3. Seed, showcase, or demo data must be opt-in and must be disabled by default in production.
4. Bootstrap account flows must not overwrite an existing account's password, role, or active status during ordinary startup unless an explicit maintenance mode approves it.
5. Configuration-derived policy bootstrap must preserve existing operator-managed state unless the command explicitly performs reconciliation.

## Layer Ownership Rules

1. Transport code owns HTTP parsing, authorization entry checks, response mapping, and protocol details.
2. Application services own workflows, validation, transactions, and cross-entity coordination.
3. Persistence code owns schema, query implementation, and storage-specific details.
4. External integrations own protocol-specific adapters, request shaping, retry policy, and boundary errors.
5. Shared models must not become a dumping ground for transport-only or UI-only fields.

## Contract Governance

1. Public and admin APIs must expose stable contracts with explicit ownership.
2. Handler responses should return backend-owned DTOs or response models instead of leaking internal persistence shape by accident.
3. Any contract change with user-visible impact must include compatibility notes and verification evidence.
4. New endpoints must map to an identified backend owner in transport and service layers.

## Safety And Observability

1. Expected failures must return actionable errors without exposing secrets.
2. Security-sensitive flows must preserve auditability, rate-limiting intent, and permission checks.
3. Background jobs and external sync flows must emit enough structured evidence to diagnose failures after the fact.
4. Destructive operations require explicit authorization and traceable audit behavior.

## Delivery Rules

1. Backend changes must include tests that cover the changed workflow or invariant.
2. `go test ./...` and `go vet ./...` are minimum local quality gates for backend changes.
3. When backend architecture changes, update the corresponding standards chapter in the same change set.
4. Temporary compatibility shims must include clear scope, removal intent, and bounded ownership.
