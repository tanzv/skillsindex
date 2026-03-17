export const globalWorkbenchBackendShellStyles = `
.page-admin-react,
.page-account-react {
  --backend-shell-page-background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--si-color-canvas) 96%, var(--si-color-surface) 4%) 0%,
      color-mix(in srgb, var(--si-color-muted-surface) 90%, var(--si-color-canvas) 10%) 100%
    );
  --backend-shell-topbar-surface: color-mix(in srgb, var(--si-color-surface) 98%, var(--si-color-canvas) 2%);
  --backend-shell-topbar-surface-alt: color-mix(in srgb, var(--si-color-surface) 94%, var(--si-color-muted-surface) 6%);
  --backend-shell-topbar-background: var(--backend-shell-topbar-surface);
  --backend-shell-topbar-border: color-mix(in srgb, var(--si-color-border) 64%, transparent);
  --backend-shell-topbar-text: var(--si-color-text-primary);
  --backend-shell-topbar-text-muted: var(--si-color-text-secondary);
  --backend-shell-topbar-chip-border: color-mix(in srgb, var(--si-color-border) 74%, transparent);
  --backend-shell-topbar-chip-surface: color-mix(in srgb, var(--si-color-surface) 96%, var(--si-color-muted-surface) 4%);
  --backend-shell-topbar-chip-surface-hover: color-mix(in srgb, var(--si-color-muted-surface) 72%, var(--si-color-surface) 28%);
  --backend-shell-topbar-chip-surface-active: color-mix(in srgb, var(--si-color-accent) 10%, var(--si-color-surface) 90%);
  --backend-shell-topbar-chip-border-active: color-mix(in srgb, var(--si-color-accent) 44%, var(--si-color-border) 56%);
  --backend-shell-topbar-chip-text: var(--si-color-text-secondary);
  --backend-shell-topbar-chip-text-active: var(--si-color-text-primary);
  --backend-shell-topbar-nav-surface: color-mix(in srgb, var(--si-color-muted-surface) 84%, var(--si-color-surface) 16%);
  --backend-shell-sidebar-surface: color-mix(in srgb, var(--si-color-surface) 98%, var(--si-color-muted-surface) 2%);
  --backend-shell-sidebar-surface-strong: var(--si-color-surface);
  --backend-shell-sidebar-border: color-mix(in srgb, var(--si-color-border) 70%, transparent);
  --backend-shell-sidebar-divider: color-mix(in srgb, var(--si-color-border) 58%, transparent);
  --backend-shell-sidebar-title: var(--si-color-text-primary);
  --backend-shell-sidebar-kicker: var(--si-color-text-secondary);
  --backend-shell-sidebar-item-surface: color-mix(in srgb, var(--si-color-surface) 96%, var(--si-color-muted-surface) 4%);
  --backend-shell-sidebar-item-surface-hover: color-mix(in srgb, var(--si-color-muted-surface) 68%, var(--si-color-surface) 32%);
  --backend-shell-sidebar-item-surface-active: color-mix(in srgb, var(--si-color-accent) 8%, var(--si-color-surface) 92%);
  --backend-shell-sidebar-item-border: color-mix(in srgb, var(--si-color-border) 84%, transparent);
  --backend-shell-sidebar-item-border-hover: color-mix(in srgb, var(--si-color-text-secondary) 42%, var(--si-color-border) 58%);
  --backend-shell-sidebar-item-border-active: color-mix(in srgb, var(--si-color-accent) 40%, var(--si-color-border) 60%);
  --backend-shell-sidebar-item-accent: var(--si-color-accent);
  --backend-shell-sidebar-item-text: var(--si-color-text-primary);
  --backend-shell-sidebar-item-text-muted: var(--si-color-text-secondary);
  --backend-shell-sidebar-glyph-surface: color-mix(in srgb, var(--si-color-muted-surface) 82%, var(--si-color-surface) 18%);
  --backend-shell-sidebar-glyph-border: color-mix(in srgb, var(--si-color-border) 74%, transparent);
  --backend-shell-content-surface: color-mix(in srgb, var(--si-color-surface) 90%, transparent);
  --backend-shell-content-border: color-mix(in srgb, var(--si-color-border) 68%, transparent);
  --backend-shell-content-shadow: 0 10px 24px color-mix(in srgb, var(--si-color-overlay-mask) 10%, transparent);
  --backend-shell-overlay-border: color-mix(in srgb, var(--si-color-border) 68%, transparent);
  --backend-shell-overlay-surface: color-mix(in srgb, var(--si-color-surface) 98%, var(--si-color-canvas) 2%);
  --backend-shell-overlay-item-surface: color-mix(in srgb, var(--si-color-surface) 96%, var(--si-color-muted-surface) 4%);
  --backend-shell-overlay-item-surface-active: color-mix(in srgb, var(--si-color-accent) 10%, var(--si-color-surface) 90%);
  --backend-shell-overlay-shadow: 0 14px 28px color-mix(in srgb, var(--si-color-overlay-mask) 12%, transparent);
  background: var(--backend-shell-page-background);
}

:root[data-theme-mode="light"] .page-admin-react,
:root[data-theme-mode="light"] .page-account-react {
  --backend-shell-topbar-chip-text: var(--si-color-text-primary);
  --backend-shell-topbar-chip-surface: color-mix(in srgb, var(--si-color-surface) 94%, var(--si-color-muted-surface) 6%);
}

:root[data-theme-mode="dark"] .page-admin-react,
:root[data-theme-mode="dark"] .page-account-react {
  --backend-shell-topbar-chip-text: color-mix(in srgb, var(--si-color-text-primary) 88%, var(--si-color-text-secondary) 12%);
}

.backend-topbar {
  background: var(--backend-shell-topbar-background);
  box-shadow: none;
  backdrop-filter: none;
}

.backend-primary-nav-label {
  color: var(--backend-shell-topbar-text-muted);
}

.backend-primary-nav-list {
  background: var(--backend-shell-topbar-nav-surface);
  border-radius: 14px;
  box-shadow: none;
}

.backend-primary-nav-list {
  flex-wrap: nowrap;
  overflow: hidden;
}

.backend-primary-nav-item,
.backend-primary-overflow-trigger {
  flex: 0 0 auto;
  white-space: nowrap;
}

.backend-primary-overflow-trigger {
  min-height: 38px;
  border: 1px solid var(--backend-shell-topbar-chip-border);
  border-radius: 12px;
  background: var(--backend-shell-topbar-chip-surface);
  color: var(--backend-shell-topbar-chip-text);
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.backend-primary-overflow-trigger:hover,
.backend-primary-overflow-trigger.active {
  border-color: var(--backend-shell-topbar-chip-border-active);
  background: var(--backend-shell-topbar-chip-surface-active);
  color: var(--backend-shell-topbar-chip-text-active);
  transform: none;
}

.backend-primary-overflow-trigger:focus-visible,
.backend-secondary-collapse-toggle:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--backend-shell-sidebar-item-accent) 72%, white 28%);
  outline-offset: 2px;
}

.backend-primary-overflow-panel {
  width: min(320px, calc(100vw - 32px));
  border-radius: 16px;
  border: 1px solid var(--backend-shell-overlay-border);
  background: var(--backend-shell-overlay-surface);
  box-shadow: var(--backend-shell-overlay-shadow);
  padding: 12px;
  display: grid;
  gap: 12px;
  backdrop-filter: none;
}

.backend-primary-overflow-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.backend-primary-overflow-header strong {
  color: var(--backend-shell-topbar-text);
  font-size: 0.84rem;
  line-height: 1.2;
}

.backend-primary-overflow-header span {
  color: var(--backend-shell-topbar-text-muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.backend-primary-overflow-list {
  display: grid;
  gap: 8px;
}

.backend-primary-overflow-item {
  border: 1px solid color-mix(in srgb, var(--backend-shell-overlay-border) 74%, transparent);
  border-radius: 12px;
  background: var(--backend-shell-overlay-item-surface);
  padding: 11px 12px;
  display: grid;
  gap: 4px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s ease, background-color 0.18s ease, transform 0.18s ease;
}

.backend-primary-overflow-item:hover,
.backend-primary-overflow-item.active {
  border-color: var(--backend-shell-topbar-chip-border-active);
  background: var(--backend-shell-overlay-item-surface-active);
  transform: none;
}

.backend-primary-overflow-item strong {
  color: var(--backend-shell-topbar-text);
  font-size: 0.78rem;
  line-height: 1.3;
}

.backend-primary-overflow-item span {
  color: var(--backend-shell-topbar-text-muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 0.64rem;
  line-height: 1.4;
}

.backend-shell-body.is-sidebar-collapsed {
  grid-template-columns: 88px minmax(0, 1fr);
}

.backend-secondary-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.backend-secondary-heading {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.backend-secondary-collapse-toggle {
  min-width: 34px;
  width: 34px;
  height: 34px;
  border: 1px solid color-mix(in srgb, var(--backend-shell-sidebar-item-border) 76%, transparent);
  border-radius: 8px;
  background: var(--backend-shell-sidebar-item-surface);
  color: var(--backend-shell-sidebar-item-text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease;
}

.backend-secondary-collapse-toggle:hover {
  border-color: var(--backend-shell-sidebar-item-border-hover);
  background: color-mix(in srgb, var(--backend-shell-sidebar-surface) 96%, transparent);
  color: var(--backend-shell-sidebar-item-accent);
}

.backend-secondary-item {
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 9px;
}

.backend-secondary-item-glyph {
  width: 30px;
  min-width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--backend-shell-sidebar-glyph-border);
  background: var(--backend-shell-sidebar-glyph-surface);
  color: var(--backend-shell-sidebar-item-accent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 1;
}

.backend-secondary-item-copy {
  min-width: 0;
  display: grid;
  gap: 5px;
}

.backend-marketplace-link {
  border-radius: 12px;
  background: var(--backend-shell-topbar-chip-surface);
  box-shadow: none;
}

.backend-marketplace-link:hover {
  border-color: color-mix(in srgb, var(--backend-shell-topbar-chip-border) 72%, var(--si-color-text-primary) 28%);
  background: var(--backend-shell-topbar-chip-surface-hover);
  transform: none;
}

.backend-secondary-nav {
  border-radius: 18px;
  background: var(--backend-shell-sidebar-surface-strong);
  box-shadow: 0 8px 18px color-mix(in srgb, var(--si-color-overlay-mask) 8%, transparent);
  padding: 14px 10px 12px;
  gap: 12px;
}

.backend-secondary-header {
  padding: 0 0 10px;
  border-bottom-color: var(--backend-shell-sidebar-divider);
}

.backend-secondary-list {
  gap: 8px;
}

.backend-secondary-list.ant-menu .backend-secondary-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 9px;
  border-radius: 12px;
  padding: 12px 12px 12px 12px !important;
  box-shadow: none;
}

.backend-secondary-list.ant-menu .backend-secondary-item.ant-menu-item-selected {
  background: var(--backend-shell-sidebar-item-surface-active);
}

.backend-secondary-list.ant-menu .backend-secondary-item.ant-menu-item-only-child {
  height: auto;
}

.backend-secondary-list.ant-menu .backend-secondary-item .ant-menu-title-content {
  min-width: 0;
}

.backend-secondary-list.ant-menu .backend-secondary-item:focus-visible .backend-secondary-item-copy {
  outline: 2px solid color-mix(in srgb, var(--backend-shell-sidebar-item-accent) 72%, white 28%);
  outline-offset: 2px;
}

.backend-secondary-item {
  padding: 12px 12px 12px 12px;
}

.backend-secondary-item.active {
  box-shadow: none;
}

.backend-secondary-item.active strong {
  color: color-mix(in srgb, var(--backend-shell-sidebar-item-accent) 72%, var(--backend-shell-sidebar-item-text) 28%);
}

.backend-secondary-item:hover {
  transform: none;
  box-shadow: none;
}

.backend-primary-nav-item {
  min-height: 38px;
  border-radius: 12px;
  background: transparent;
  color: var(--backend-shell-topbar-chip-text);
  box-shadow: none;
}

.backend-primary-nav-item:hover {
  border-color: var(--backend-shell-topbar-chip-border);
  background: var(--backend-shell-topbar-chip-surface-hover);
  color: var(--backend-shell-topbar-text);
  transform: none;
}

.backend-primary-nav-item.active {
  border-color: var(--backend-shell-topbar-chip-border-active);
  background: var(--backend-shell-topbar-chip-surface-active);
  color: var(--backend-shell-topbar-chip-text-active);
  box-shadow: none;
}

.backend-main-panel {
  border-radius: 20px;
  box-shadow: var(--backend-shell-content-shadow);
}

.backend-secondary-nav.is-collapsed {
  padding: 12px 8px;
}

.backend-secondary-nav.is-collapsed .backend-secondary-header {
  padding: 0 0 4px;
  border-bottom: none;
}

.backend-secondary-nav.is-collapsed .backend-secondary-heading {
  display: none;
}

.backend-secondary-nav.is-collapsed .backend-secondary-header-row {
  justify-content: center;
}

.backend-secondary-nav.is-collapsed .backend-secondary-list {
  gap: 8px;
}

.backend-secondary-nav.is-collapsed .backend-secondary-list.ant-menu-inline-collapsed {
  width: 100%;
}

.backend-secondary-nav.is-collapsed .backend-secondary-item {
  grid-template-columns: 1fr;
  justify-items: center;
  padding: 10px 8px;
  gap: 0;
}

.backend-secondary-nav.is-collapsed .backend-secondary-list.ant-menu .backend-secondary-item {
  padding: 10px 8px !important;
}

.backend-secondary-nav.is-collapsed .backend-secondary-item-copy {
  display: none;
}

.backend-secondary-nav.is-collapsed .backend-secondary-item-glyph {
  width: 34px;
  min-width: 34px;
  height: 34px;
}

@media (max-width: 1120px) {
  .backend-primary-nav-list {
    overflow-x: auto;
  }

  .backend-shell-body.is-sidebar-collapsed {
    grid-template-columns: 1fr;
  }

  .backend-secondary-collapse-toggle {
    display: none;
  }
}
`;
