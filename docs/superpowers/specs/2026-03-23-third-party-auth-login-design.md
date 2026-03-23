# Third-Party Auth Login Design

## 1. Summary

This design adds configurable third-party authentication to the SkillsIndex login surface with an initial provider set of `dingtalk` and `feishu`, while keeping password login available by default. The backend remains the source of truth for enabled login methods, provider configuration, callback handling, identity mapping, and session creation. The frontend login page becomes provider-driven and renders only the methods that are both enabled by admin policy and currently available.

The implementation extends the existing authentication provider and SSO foundations instead of introducing a second parallel auth stack. This keeps the current `/api/v1/auth/providers` contract, admin access settings workflow, and session bootstrap path aligned with the new provider set.

## 2. Goals

1. Support third-party login for `dingtalk` and `feishu`.
2. Allow administrators to configure which login methods are visible and usable.
3. Keep password login as an independently configurable login method.
4. Provide a complete login flow:
   - start authorization
   - callback handling
   - external identity resolution
   - local user resolution or provisioning
   - local session creation
   - redirect back to requested route
5. Reuse the current backend auth ownership model and avoid frontend-owned auth truth.
6. Keep the provider model extensible for future providers.

## 3. Non-Goals

1. No full rewrite of the existing auth or SSO subsystem.
2. No migration of all historical provider logic into a brand new framework.
3. No frontend-owned provider secrets or protocol handling.
4. No breaking removal of existing password login by default.
5. No new framework or runtime introduction.

## 4. Current State

### 4.1 Frontend

The current `/login` route in `frontend-next/` renders:

1. password credential form
2. static informational copy that says provider strategy is controlled by backend
3. no dynamic provider button list

The current login page already supports:

1. redirect target handling
2. locale handling
3. theme switching
4. password login via `/api/bff/auth/login`

### 4.2 Backend

The backend already has:

1. password login session APIs under `/api/v1/auth/*`
2. `authProviderOrder` and helper functions for enabled providers
3. DingTalk-specific start and callback routes
4. generic SSO start and callback routes for connector-backed providers
5. admin APIs to configure enabled auth providers
6. enterprise SSO provider management APIs based on integration connectors

The current gaps are:

1. `feishu` is not part of the frontend/backend public auth provider registry
2. password login is not treated as a first-class configurable method in the same provider list
3. the frontend login route does not fetch and render provider buttons
4. provider availability and provider configuration concepts are split across multiple backend paths
5. provider-specific identity resolution policies are not expressed as one explicit backend contract for the login page

## 5. Proposed Architecture

### 5.1 High-Level Approach

Extend the existing auth provider registry and SSO connector model with a unified login-method contract.

The solution keeps one backend-owned provider registry that describes:

1. provider key
2. login method type
3. display metadata
4. start path
5. configuration availability
6. enabled-by-policy state

The frontend login page consumes this contract and renders the resulting login actions.

### 5.2 Ownership Boundaries

#### Backend owns

1. provider registry
2. provider configuration loading
3. enabled login method policy
4. provider start and callback endpoints
5. external identity mapping
6. local user provisioning or binding
7. session creation
8. audit events

#### Frontend owns

1. rendering login methods on `/login`
2. password form interaction
3. provider button interaction
4. post-login redirect initiation from user-visible login screen

#### BFF owns

1. secure proxying for frontend-safe session APIs
2. optional pass-through endpoint for provider listing if frontend chooses same-origin consumption

## 6. Login Method Model

### 6.1 Login Method Taxonomy

Introduce an explicit distinction between:

1. `password`
   - local credential login
2. `dingtalk`
   - provider login
3. `feishu`
   - provider login

Future providers such as `github`, `google`, `wecom`, and `microsoft` stay compatible with the same model.

### 6.2 Normalized Login Method Descriptor

Backend login page responses should expose a normalized descriptor similar to:

```json
{
  "key": "feishu",
  "kind": "oauth",
  "label": "Feishu",
  "icon_path": "/static/icons/auth/feishu.svg",
  "start_path": "/auth/sso/start/feishu",
  "enabled": true,
  "available": true
}
```

`password` should also be represented as a login method descriptor, but the frontend can still render the password form in its dedicated section instead of a button-only treatment.

## 7. Backend Design

### 7.1 Provider Registry Extension

Extend the current auth provider registry in `backend/internal/web/app_auth_provider_config.go` and helpers to:

1. add `password`
2. add `feishu`
3. keep `dingtalk`
4. preserve existing supported providers where they still apply

The registry should define:

1. display order
2. label key
3. short label key
4. icon path
5. provider kind
6. provider start path resolver
7. availability check policy

This avoids scattering provider truth across multiple switch statements.

### 7.2 Enabled Login Methods Setting

The current `auth_providers` setting should evolve into a list of enabled login methods, including `password`.

Default enabled set:

1. `password`
2. `dingtalk`
3. `feishu` only when configured, or included as disabled-by-availability until configured

Behavior:

1. admin policy controls visibility and allowed use
2. missing provider credentials force `available=false`
3. disabled policy hides the method from `/api/v1/auth/providers`

### 7.3 Provider Configuration Resolution

#### DingTalk

Keep the existing dedicated DingTalk flow where necessary, but normalize its public login contract so that the provider registry exposes it like all other providers.

#### Feishu

Add Feishu provider support through one of these approaches:

1. if Feishu is implemented through OIDC-compatible configuration, use the generic SSO route path
2. if Feishu requires provider-specific OAuth behavior, add a Feishu adapter that still plugs into the same registry and login flow contract

Recommended default:

- prefer the generic SSO connector path when Feishu Open Platform configuration fits the existing OIDC contract
- fall back to a provider-specific adapter only if protocol mismatches require it

### 7.4 External Identity Resolution

For third-party callback flows, resolve local users by this priority:

1. existing bound external identity for `(provider, external_user_id)`
2. trusted verified email match when policy allows
3. normalized username claim match only if explicitly allowed by policy
4. auto-provision new local user when policy allows

Default policy for initial implementation:

1. external identity binding is authoritative
2. verified email may attach to existing local user
3. auto-provision is allowed for first login
4. username-only implicit binding is not the default safety path

### 7.5 Local User Provisioning

Provisioned users should be created with explicit defaults:

1. role: repository-approved default member role unless provider config overrides it
2. status: active
3. display name: derived from provider claims when available
4. username: generated from email or provider username with collision-safe normalization

Provisioning logic must be kept in service-level workflow code, not in handlers.

### 7.6 Session Creation

All successful login methods must converge on the existing session bootstrap path:

1. start local app session
2. create persistent user session record when enabled
3. record audit trail
4. redirect to sanitized requested path

### 7.7 Redirect Handling

The current login route already supports a `redirect` query parameter. Third-party login start flows should preserve the requested redirect target across:

1. login page render
2. provider start route
3. state payload or signed cookie
4. provider callback
5. final redirect after session creation

Do not trust arbitrary external redirect targets. Reuse the existing internal-path-only sanitization rule.

### 7.8 Admin Configuration APIs

The current admin access settings APIs should remain the primary owner for enabled login methods.

Needed changes:

1. include `password` in available methods
2. include `feishu` in available methods
3. return richer descriptors when needed by frontend admin screens
4. keep backward compatibility for the existing string-array update payload where practical

The enterprise SSO provider management APIs remain responsible for provider connector creation and secret storage.

Recommended split:

1. `admin settings auth-providers`
   - controls which methods are enabled
2. `admin sso providers`
   - controls provider connector definitions and secrets

This keeps policy separate from secret configuration.

## 8. Frontend Design

### 8.1 Login Page Behavior

The `/login` page should become provider-driven while preserving the current visual structure.

It should:

1. load password-login capability and third-party methods from the backend
2. render provider buttons for methods with `enabled=true` and `available=true`
3. keep password form visible only when `password` is enabled
4. show provider section only when at least one third-party method is available

### 8.2 Rendering Structure

Recommended feature split under `frontend-next/src/features/auth/`:

1. `renderLoginRoute.tsx`
   - route orchestration
2. `loadLoginMethods.server.ts`
   - backend/BFF login method loading
3. `LoginForm.tsx`
   - page composition
4. `LoginCredentialsCard.tsx`
   - password form only
5. `LoginProviderList.tsx`
   - third-party provider button list
6. `loginMethodModel.ts`
   - normalization for login method response

This preserves single responsibility and keeps feature logic cohesive.

### 8.3 Frontend Data Source

Preferred source:

1. frontend server component calls backend-auth provider listing through existing server fetch or a small BFF pass-through

Recommended default:

- use a server-side fetch path aligned with existing frontend auth/session infrastructure
- avoid client-side first paint fetch for provider buttons because login methods are route-critical content

### 8.4 UX Rules

1. password form remains the primary local-login surface
2. third-party buttons appear above or near the divider as explicit alternative sign-in options
3. button order follows backend provider order
4. unavailable methods are not rendered as interactive controls on the public login page
5. admin-controlled method changes should take effect without frontend redeploy

## 9. Admin Experience

### 9.1 Admin Access Page

The existing admin access pages already render enabled provider toggles. They should be updated to:

1. include `password`
2. include `feishu`
3. optionally render friendlier labels and icons instead of raw provider keys

### 9.2 Admin SSO Provider Configuration

The existing SSO provider configuration surface should support configuring Feishu as a provider.

If Feishu uses the generic connector path, the admin should create one Feishu connector with:

1. issuer or base URL
2. authorization URL
3. token URL
4. userinfo URL
5. client ID
6. client secret
7. scope
8. mapping policy
9. default organization and role policy

If DingTalk remains a dedicated path, its configuration stays where it is, but the admin login-method policy still controls whether it is shown to end users.

## 10. Data Flow

### 10.1 Password Login

1. user opens `/login`
2. frontend route loads enabled login methods
3. password form renders if enabled
4. user submits credentials to `/api/bff/auth/login`
5. backend authenticates and creates session
6. frontend redirects to sanitized target

### 10.2 Third-Party Login

1. user opens `/login`
2. frontend route loads enabled and available provider methods
3. user clicks provider button
4. browser navigates to provider `start_path`
5. backend resolves provider config and generates state
6. provider authenticates user
7. callback reaches backend
8. backend resolves or provisions local user
9. backend starts local session
10. backend redirects to sanitized requested path

## 11. Security and Safety Rules

1. redirect targets must remain internal-only
2. provider callback state must be signed or stored in secure cookies
3. provider secrets must never enter frontend code
4. local user auto-binding by email requires verified email trust
5. every successful third-party login must emit audit evidence
6. failed callback and mapping paths must return safe, actionable error states
7. availability checks must fail closed when provider configuration is incomplete

## 12. Testing Strategy

### 12.1 Backend

Add focused tests for:

1. auth provider registry normalization including `password`, `dingtalk`, `feishu`
2. enabled login-method settings parsing
3. `/api/v1/auth/providers` response filtering by enabled + available
4. Feishu provider config parsing and start-path exposure
5. callback mapping precedence
6. redirect target preservation and sanitization
7. session creation after successful third-party login

### 12.2 Frontend

Add or update tests for:

1. login route model with provider-driven rendering
2. provider list rendering order and visibility
3. password form hidden when `password` is disabled
4. login page rendering when only third-party login exists
5. login page rendering when only password login exists

### 12.3 End-to-End

At minimum, verify:

1. login page shows configured provider buttons
2. admin toggling a login method changes login page behavior
3. password login still works when enabled
4. third-party callback happy path establishes session

## 13. Rollout Plan

### Phase 1

1. normalize provider registry
2. add `password` and `feishu` to admin-configurable methods
3. expose provider-driven auth listing API
4. update login page UI to render provider methods

### Phase 2

1. complete Feishu callback and mapping support
2. unify redirect preservation across password and provider login
3. add regression coverage and admin flow verification

## 14. Extension Points

1. new provider adapters can be added through the registry without rewriting login page composition
2. identity mapping policy can evolve behind service interfaces
3. admin UI can grow from key-based toggles to richer provider cards without changing backend contracts
4. passwordless or magic-link login can later be added as another login method kind

## 15. Assumptions

1. the first delivery target is `dingtalk + feishu + password`
2. keeping password login is desired
3. backend configuration of visible login methods is required
4. full login closure is required, not just button display
5. Feishu can either fit the current SSO connector abstraction or be added through a bounded provider adapter without rewriting the auth stack

## 16. Recommended Implementation Decision

Proceed with an incremental extension of the existing auth provider and SSO infrastructure.

This is recommended because it:

1. preserves current architecture boundaries
2. avoids a risky auth rewrite
3. supports admin-controlled visibility cleanly
4. enables future providers through the same registry model
