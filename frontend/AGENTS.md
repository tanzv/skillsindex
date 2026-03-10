# Frontend Local Agent Rules

Scope: applies to everything under `frontend/`.

## Workspace Admin Navigation Contract

For admin subpages rendered by `WorkspacePrototypePageShell`, keep navigation behavior consistent:

1. Topbar must always render the full first-level menu set from `buildWorkspaceSidebarNavigation`.
2. Sidebar must render only the second-level items of the currently active first-level menu group.
3. Do not remove or add topbar first-level entries based on the current subpage route.
4. Keep topbar and sidebar active states synchronized (`aria-current`, visual highlight, and selected group).

Required implementation pattern:

1. Build full groups into `topbarMenuGroups`.
2. Build filtered groups into `sidebarGroups`.
3. Pass both props to `WorkspacePrototypePageShell`.
4. Use `sidebarMode="secondary"` when only one group should be shown in the left sidebar.

Route-to-group alignment:

1. `/admin/accounts*`, `/admin/access*`, `/admin/roles*` -> `user-management`.
2. `/admin/ingestion/*`, `/admin/records/*` -> `skill-management`.

Verification requirements for navigation changes:

1. Add or update unit tests for group resolution and active-menu mapping.
2. Add or update e2e coverage for topbar stability and sidebar filtering on affected routes.

## Pages Feature-Folder Contract

For `frontend/src/pages`, keep route-level code organized by feature folder instead of a flat root directory:

1. `src/pages/` root must stay free of implementation files; add new route/page families under dedicated folders.
2. Co-locate page entry files, local helpers, hooks, styles, copy, types, tests, and page-local subcomponents inside the same feature folder.
3. Move cross-page reusable UI to `frontend/src/components/`, pure shared logic to `frontend/src/lib/`, and route-family shared helpers to an explicit shared page folder.
4. Update imports together with any file move; do not leave compatibility shims in the root `src/pages/` directory unless explicitly approved.

## Frontend Visual Baseline Contract

When touching route-level UI or visual regression infrastructure under `frontend/`:

1. Keep every scenario declared in `frontend/scripts/visual-regression/run.mjs` aligned with an existing baseline image.
2. Store active regression baselines under `frontend/prototype-baselines/` unless a scenario explicitly uses preview assets under `frontend/public/prototypes/previews/`.
3. If a visual contract changes intentionally, update the scenario config, the matching baseline files, and the verification evidence in the same change.
4. If a page move changes raw imports or filesystem-based alignment tests, update those relative paths as part of the refactor.
