# Backend Architecture Layering Standard

Version: 1.0
Last Updated: 2026-03-20
Owner: Backend Architecture

## Objective

Define the mandatory backend layer model, dependency direction, and module boundaries for backend implementations in this repository.

## Layer Model

Every backend implementation must map code into the following layers:

1. **Command Entry Layer**
   - process entrypoints
   - signal wiring
   - command-specific runtime flags
2. **Bootstrap Composition Layer**
   - dependency graph assembly
   - runtime validation
   - lifecycle registration
   - transport startup and shutdown orchestration
3. **Transport Layer**
   - HTTP routing
   - request parsing
   - auth and permission entry checks
   - response serialization
4. **Application Service Layer**
   - workflows
   - transactions
   - business validation
   - orchestration across repositories and integrations
5. **Domain Contract Layer**
   - domain entities
   - enums
   - backend-owned service DTOs
   - stable contract types
6. **Infrastructure Adapter Layer**
   - repositories
   - ORM or SQL code
   - filesystem and process execution
   - external HTTP or OAuth adapters
   - scheduler and queue bindings

## Dependency Direction

1. Higher layers may depend on lower layers.
2. Lower layers must not import higher layers.
3. Domain contract code must stay independent from HTTP transport code.
4. Infrastructure adapters must not import transport packages.
5. Application services should depend on ports or narrow collaborators where practical instead of wide concrete runtime structs.

## Package Mapping

Map the current repository packages like this:

1. `backend/cmd/**`
   - Command Entry Layer
2. `backend/internal/bootstrap/**`
   - Bootstrap Composition Layer
3. `backend/internal/web/**`
   - Transport Layer
4. `backend/internal/services/**`
   - Application Service Layer
5. `backend/internal/models/**`, `backend/internal/catalog/**`
   - Domain Contract Layer
6. `backend/internal/db/**`
   - Infrastructure Adapter Layer

## Entry And Bootstrap Rules

1. Command entry files must stay trivial and must not embed business logic.
2. Bootstrap code may assemble concrete implementations, but it must not become a business workflow owner.
3. Startup-time data mutation must remain explicit, bounded, and policy-governed.
4. Runtime composition must avoid hidden duplicate assembly of the same workflow object in multiple layers.
5. Background components must be injected once and owned by a clear lifecycle boundary.

## Transport Rules

1. Transport code must parse input, call application services, and map outputs; it must not become the owner of domain workflows.
2. Route registration should be grouped by bounded area such as auth, account, admin, marketplace, or operations.
3. A single transport root object must not grow without bound; split domain handler groups before one aggregate becomes the hidden owner of every service.
4. Shared middleware should stay protocol-focused and must not embed page-family business logic.
5. Transport-specific response models should be explicit when service DTOs are not safe to expose directly.

## Application Service Rules

1. Each service should own a coherent workflow family, not an arbitrary mix of unrelated features.
2. Service methods should define explicit inputs and outputs instead of relying on transport-only state.
3. Transaction boundaries belong in application services or dedicated workflow coordinators, not in handlers.
4. Services should coordinate repositories, integrations, and audit behavior through explicit collaborators.
5. New service logic should prefer narrow ports or repository collaborators over direct package-wide infrastructure reach-through.

## Persistence And Adapter Rules

1. ORM-specific queries, migrations, and schema reconciliation belong in infrastructure adapters.
2. Transport code must never import GORM or persistence packages directly.
3. New persistence-heavy logic should move behind repository helpers or interfaces instead of expanding raw ORM access across service files.
4. External process execution, filesystem access, and outbound HTTP calls should live behind explicit adapters that can be validated in tests.
5. Storage-specific error handling must be normalized before it leaks into transport contracts.

## Domain Model Rules

1. Domain models must represent backend-owned concepts, not temporary page payloads.
2. Domain contracts must preserve invariants and semantic naming.
3. View-only aggregation types that exist only for one route family should not be promoted into shared domain packages without reuse evidence.

## Startup Safety Rules

1. Migrations, seeding, account bootstrap, and policy reconciliation are separate responsibilities and should not be fused into opaque startup behavior.
2. Seed and showcase content must be gated by explicit runtime mode or command intent.
3. Account bootstrap should create missing records or validate posture, but it must not silently reset operator-managed credentials in normal runtime.

## Refactor Triggers

Refactor a backend module when any of the following become true:

1. a handler aggregate depends on too many unrelated services
2. one service owns unrelated workflows or unrelated data lifecycles
3. a transport file embeds direct query building or persistence-specific logic
4. bootstrap code starts deciding business outcomes instead of composing collaborators
5. the same workflow is assembled in multiple places without a single owner
