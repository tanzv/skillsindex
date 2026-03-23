# Backend Web Aggregation Reduction Design

## Goal

Reduce coupling in the backend web layer without changing route contracts, templates, or response behavior.

## Scope

This slice focuses on two hotspots:

1. Replace the long `web.NewApp(...)` parameter list with a named dependency struct.
2. Extract admin page aggregation from `handleAdmin` into a dedicated builder.

## Chosen Approach

### 1. Structured app construction

Introduce `AppDependencies` so call sites pass named fields instead of a long ordered argument list. This reduces constructor fragility and makes future dependency grouping easier.

### 2. Admin view builder extraction

Move admin page data aggregation into a dedicated builder module that:

- owns optional admin page loading behavior
- keeps strict failures for critical data (`dashboard counts`, `records skill list`)
- logs optional load failures instead of silently swallowing them
- returns final `ViewData` to the handler

`handleAdmin` remains responsible for:

- user presence check
- route context resolution
- access control
- rendering response from built view data

## Compatibility

- No route path changes
- No template contract changes
- No API contract changes
- Existing behavior remains intact except optional load failures become observable in logs

## Extension Points

- Split `ViewData` into admin/public/account-specific view models
- Group `App` dependencies by domain (`auth`, `admin`, `public`, `ops`)
- Reuse the builder pattern for public and account page aggregation

## Verification

- `cd backend && go test ./...`
- `cd backend && go vet ./...`
- `./scripts/check_max_lines.sh`
