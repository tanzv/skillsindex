export const globalWorkbenchStyles = `
.page-admin-react,
.page-account-react {
  --backend-shell-page-glow: rgba(198, 160, 104, 0.08);
  --backend-shell-topbar-surface: #0e1620;
  --backend-shell-topbar-surface-alt: #1a2430;
  --backend-shell-topbar-border: rgba(163, 179, 197, 0.18);
  --backend-shell-topbar-text: #f3f6fb;
  --backend-shell-topbar-text-muted: rgba(212, 220, 232, 0.7);
  --backend-shell-topbar-chip-border: rgba(163, 179, 197, 0.22);
  --backend-shell-topbar-chip-surface: rgba(255, 255, 255, 0.04);
  --backend-shell-topbar-chip-surface-hover: rgba(255, 255, 255, 0.08);
  --backend-shell-topbar-chip-surface-active: rgba(214, 185, 137, 0.14);
  --backend-shell-topbar-chip-border-active: rgba(214, 185, 137, 0.42);
  --backend-shell-topbar-chip-text: rgba(232, 238, 247, 0.84);
  --backend-shell-topbar-chip-text-active: #fff9ef;
  --backend-shell-sidebar-surface: rgba(249, 248, 245, 0.94);
  --backend-shell-sidebar-surface-strong: rgba(255, 255, 255, 0.96);
  --backend-shell-sidebar-border: rgba(73, 89, 106, 0.16);
  --backend-shell-sidebar-title: #182534;
  --backend-shell-sidebar-kicker: rgba(87, 100, 116, 0.82);
  --backend-shell-sidebar-item-surface: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(244, 246, 248, 0.94));
  --backend-shell-sidebar-item-surface-hover: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(239, 242, 246, 0.96));
  --backend-shell-sidebar-item-surface-active: linear-gradient(180deg, rgba(251, 246, 236, 0.98), rgba(243, 238, 228, 0.98));
  --backend-shell-sidebar-item-border: rgba(97, 114, 132, 0.22);
  --backend-shell-sidebar-item-border-hover: rgba(81, 95, 111, 0.34);
  --backend-shell-sidebar-item-border-active: rgba(164, 133, 83, 0.42);
  --backend-shell-sidebar-item-accent: #8c6a3d;
  --backend-shell-sidebar-item-text: #172432;
  --backend-shell-sidebar-item-text-muted: #566779;
  --backend-shell-content-surface: rgba(255, 255, 255, 0.76);
  --backend-shell-content-border: rgba(73, 89, 106, 0.14);
  --backend-shell-content-shadow: 0 20px 34px rgba(15, 23, 42, 0.08);
  background:
    radial-gradient(circle at 12% 16%, var(--backend-shell-page-glow), transparent 32%),
    radial-gradient(circle at 83% 10%, rgba(106, 123, 148, 0.08), transparent 30%),
    linear-gradient(180deg, #f5f1e9 0%, #efebe3 48%, #e9e4db 100%);
}

.backend-shell {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.backend-topbar {
  position: sticky;
  top: 0;
  z-index: 80;
  border-bottom: 1px solid var(--backend-shell-topbar-border);
  background:
    linear-gradient(180deg, rgba(8, 13, 19, 0.98), rgba(11, 18, 27, 0.97)),
    linear-gradient(90deg, color-mix(in srgb, var(--backend-shell-topbar-surface-alt) 90%, white 10%), transparent 42%, rgba(196, 164, 118, 0.08));
  color: var(--backend-shell-topbar-text);
  backdrop-filter: blur(14px);
  padding: 14px 22px 16px;
  display: grid;
  grid-template-columns: minmax(240px, 296px) minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  box-shadow: 0 14px 30px rgba(3, 8, 18, 0.2);
}

.backend-topbar-brand {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.backend-topbar-brand-copy {
  display: grid;
  gap: 4px;
}

.backend-topbar-brand h1 {
  margin: 0;
  font-size: 1.16rem;
  line-height: 1;
  letter-spacing: 0.02em;
  font-family: "Syne", sans-serif;
  color: var(--backend-shell-topbar-text);
}

.backend-topbar-brand p {
  margin: 0;
  color: var(--backend-shell-topbar-text-muted);
  font-size: 0.72rem;
  line-height: 1.35;
  max-width: 34ch;
}

.backend-primary-nav {
  min-width: 0;
  display: grid;
  gap: 8px;
}

.backend-primary-nav-label {
  color: rgba(214, 220, 230, 0.74);
  font-family: "JetBrains Mono", monospace;
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.backend-primary-nav-list {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 6px;
  border-radius: 20px;
  border: 1px solid var(--backend-shell-topbar-chip-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.backend-primary-nav-item {
  min-height: 40px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: var(--backend-shell-topbar-chip-surface);
  color: var(--backend-shell-topbar-chip-text);
  padding: 0 14px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
}

.backend-primary-nav-item:hover {
  border-color: var(--backend-shell-topbar-chip-border);
  background: var(--backend-shell-topbar-chip-surface-hover);
  color: var(--backend-shell-topbar-text);
  transform: translateY(-1px);
}

.backend-primary-nav-item.active {
  border-color: var(--backend-shell-topbar-chip-border-active);
  background: var(--backend-shell-topbar-chip-surface-active);
  color: var(--backend-shell-topbar-chip-text-active);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 10px 20px rgba(1, 6, 14, 0.18);
}

.backend-primary-nav-item:focus-visible,
.backend-marketplace-link:focus-visible,
.backend-secondary-item:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--backend-shell-sidebar-item-accent) 72%, white 28%);
  outline-offset: 2px;
}

.backend-topbar-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.backend-marketplace-link {
  min-height: 40px;
  border: 1px solid var(--backend-shell-topbar-chip-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--backend-shell-topbar-text);
  padding: 0 14px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: border-color 0.18s ease, background-color 0.18s ease, transform 0.18s ease;
}

.backend-marketplace-link:hover {
  border-color: color-mix(in srgb, var(--backend-shell-topbar-chip-border) 62%, white 38%);
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}


.backend-shell-body {
  min-height: 0;
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr);
  gap: 16px;
  width: min(1680px, calc(100% - 24px));
  margin: 16px auto;
  align-items: start;
}

.backend-secondary-nav {
  position: sticky;
  top: 88px;
  border-radius: 22px;
  border: 1px solid var(--backend-shell-sidebar-border);
  background: linear-gradient(180deg, var(--backend-shell-sidebar-surface-strong), var(--backend-shell-sidebar-surface));
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.08);
  padding: 18px 16px 16px;
  display: grid;
  align-self: start;
  align-content: start;
  gap: 14px;
}

.backend-secondary-header {
  display: grid;
  gap: 6px;
  padding: 0 2px 12px;
  border-bottom: 1px solid rgba(73, 89, 106, 0.12);
}

.backend-secondary-eyebrow {
  color: var(--backend-shell-sidebar-kicker);
  font-family: "JetBrains Mono", monospace;
  font-size: 0.63rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
}

.backend-secondary-title {
  margin: 0;
  color: var(--backend-shell-sidebar-title);
  font-size: 1.02rem;
  letter-spacing: 0.02em;
  font-weight: 700;
  font-family: "Syne", sans-serif;
}

.backend-secondary-list {
  display: grid;
  gap: 10px;
}

.backend-secondary-list.ant-menu,
.backend-secondary-list.ant-menu-inline {
  border-inline-end: none;
  background: transparent;
}

.backend-secondary-list.ant-menu .backend-secondary-item {
  width: 100%;
  height: auto;
  margin: 0;
  line-height: 1.2;
}

.backend-secondary-list.ant-menu .backend-secondary-item::after {
  display: none;
}

.backend-secondary-list.ant-menu .backend-secondary-item .ant-menu-item-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-inline-end: 0;
}

.backend-secondary-list.ant-menu .backend-secondary-item .ant-menu-title-content {
  min-width: 0;
  margin-inline-start: 0;
}

.backend-secondary-item {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--backend-shell-sidebar-item-border);
  border-radius: 14px;
  background: var(--backend-shell-sidebar-item-surface);
  padding: 12px 14px 12px 16px;
  text-align: left;
  display: grid;
  gap: 5px;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.74);
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
}

.backend-secondary-item::before {
  content: "";
  position: absolute;
  inset: 8px auto 8px 0;
  width: 4px;
  border-radius: 999px;
  background: var(--backend-shell-sidebar-item-accent);
  opacity: 0;
  transition: opacity 0.18s ease;
}

.backend-secondary-item:hover {
  border-color: var(--backend-shell-sidebar-item-border-hover);
  background: var(--backend-shell-sidebar-item-surface-hover);
  transform: translateY(-1px);
}

.backend-secondary-item:hover::before,
.backend-secondary-item.active::before {
  opacity: 1;
}

.backend-secondary-item strong {
  font-size: 0.8rem;
  color: var(--backend-shell-sidebar-item-text);
  letter-spacing: 0.01em;
}

.backend-secondary-item .backend-secondary-item-copy > span {
  font-size: 0.72rem;
  color: var(--backend-shell-sidebar-item-text-muted);
  line-height: 1.35;
}

.backend-secondary-item.active {
  border-color: var(--backend-shell-sidebar-item-border-active);
  background: var(--backend-shell-sidebar-item-surface-active);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82), 0 10px 20px rgba(129, 104, 70, 0.08);
}

.backend-secondary-item.active strong {
  color: color-mix(in srgb, var(--backend-shell-sidebar-item-accent) 72%, #172432 28%);
}

.backend-main-panel {
  min-width: 0;
  border-radius: 24px;
  border: 1px solid var(--backend-shell-content-border);
  background: var(--backend-shell-content-surface);
  box-shadow: var(--backend-shell-content-shadow);
  padding: 22px;
}

.side-nav-groups {
  display: grid;
  align-content: start;
  gap: 16px;
  overflow: auto;
  padding-right: 4px;
}

.side-nav-group {
  display: grid;
  gap: 8px;
}

.side-nav-group-title {
  margin: 0;
  color: rgba(236, 244, 246, 0.74);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.11em;
}

.workbench-page {
  margin-top: 18px;
  display: grid;
  gap: 16px;
}

.workbench-title.ant-typography {
  margin: 0;
  font-family: "Syne", sans-serif;
}

.workbench-subtitle.ant-typography {
  margin: 10px 0 0;
  color: var(--text-soft);
  max-width: 72ch;
}

.workbench-summary-grid {
  display: grid;
}

.workbench-summary-card .ant-statistic-title {
  font-size: 0.82rem;
  color: var(--text-soft);
}

.workbench-summary-card .ant-statistic-content {
  font-family: "Syne", sans-serif;
  font-weight: 700;
}

.workbench-summary-help {
  margin: 8px 0 0;
  font-size: 0.8rem;
  color: var(--text-soft);
}

.workbench-resource-list {
  display: grid;
  gap: 14px;
}

.workbench-action-list {
  display: grid;
  gap: 12px;
}

.workbench-action-list h3 {
  margin: 0;
  font-family: "Syne", sans-serif;
}

.workbench-card {
  border-radius: 18px;
}

.workbench-card .ant-card-head-title {
  font-weight: 700;
}

.workbench-card-description {
  margin: 0 0 12px;
  color: var(--text-soft);
}

.workbench-field-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
}

.workbench-field {
  display: grid;
  gap: 6px;
}

.workbench-field > span {
  color: #2a3d47;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.workbench-number-input,
.workbench-number-input .ant-input-number,
.workbench-number-input.ant-input-number {
  width: 100%;
}

.workbench-card-actions {
  margin-top: 10px;
  margin-bottom: 2px;
}

.workbench-divider.ant-divider-horizontal {
  margin: 12px 0;
}

.workbench-loading {
  min-height: 44px;
  display: grid;
  align-items: center;
  justify-items: center;
}

.workbench-payload-stack {
  width: 100%;
}

.workbench-nested-card {
  border-radius: 12px;
}

.workbench-json {
  margin: 0;
  padding: 10px;
  border-radius: 10px;
  background: rgba(17, 25, 31, 0.05);
  border: 1px solid rgba(17, 25, 31, 0.08);
  color: #2a3d47;
  font-size: 0.78rem;
  line-height: 1.45;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.workbench-empty {
  color: var(--text-soft);
  font-size: 0.85rem;
}

.workbench-path {
  margin: 8px 0 0;
  font-size: 0.74rem;
  color: #7a8b95;
  word-break: break-all;
}

@media (max-width: 960px) {
  .backend-topbar {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }

  .backend-primary-nav-list {
    width: 100%;
  }

  .backend-shell-body {
    width: min(1680px, calc(100% - 14px));
    grid-template-columns: 1fr;
    margin-top: 10px;
  }

  .backend-secondary-nav {
    position: static;
    top: auto;
  }

  .side-nav-groups {
    max-height: 38vh;
  }

  .workbench-field-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
}
`;
