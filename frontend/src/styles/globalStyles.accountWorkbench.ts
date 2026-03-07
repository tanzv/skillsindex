export const globalAccountWorkbenchStyles = `
.account-workbench {
  --account-workbench-font-base: "Noto Sans SC", "Noto Sans", sans-serif;
  --account-workbench-font-mono: "JetBrains Mono", monospace;
  --account-workbench-text-primary: var(--si-color-text-primary, #111111);
  --account-workbench-text-secondary: var(--si-color-text-secondary, #555555);
  --account-workbench-text-weak: var(--si-color-text-weak, #6a6a6a);
  --account-workbench-border: color-mix(in srgb, var(--si-color-border-soft, #d6d6d6) 72%, transparent);
  --account-workbench-border-strong: color-mix(in srgb, var(--si-color-border, #d6d6d6) 74%, transparent);
  --account-workbench-panel-bg: color-mix(in srgb, var(--si-color-panel, #ffffff) 88%, transparent);
  --account-workbench-panel-subtle-bg: color-mix(in srgb, var(--si-color-surface, #ffffff) 82%, transparent);
  --account-workbench-panel-accent-bg: color-mix(in srgb, var(--si-color-accent, #111111) 14%, transparent);
  --account-workbench-pill-active-bg: color-mix(in srgb, var(--si-color-success-bg, #ecfdf3) 84%, transparent);
  --account-workbench-pill-active-text: var(--si-color-success-text, #065f46);
  --account-workbench-pill-muted-bg: color-mix(in srgb, var(--si-color-muted-surface, #f3f4f6) 90%, transparent);
  --account-workbench-pill-muted-text: var(--account-workbench-text-secondary);
  --account-workbench-control-bg: color-mix(in srgb, var(--si-color-surface, #ffffff) 90%, transparent);
  --account-workbench-control-bg-active: color-mix(in srgb, var(--si-color-accent, #111111) 18%, transparent);
  --account-workbench-control-border-active: color-mix(in srgb, var(--si-color-accent, #111111) 62%, transparent);
  --account-workbench-focus-ring: color-mix(in srgb, var(--si-color-accent, #111111) 32%, transparent);
  --account-workbench-control-text-active: var(--si-color-accent-contrast, #ffffff);
  --account-workbench-control-text: var(--account-workbench-text-secondary);
}

.page-grid.account-workbench {
  margin-top: 0;
}

.account-workbench .panel {
  background: var(--account-workbench-panel-bg);
  border-color: var(--account-workbench-border-strong);
  box-shadow: 0 12px 26px color-mix(in srgb, #000000 18%, transparent);
}

.account-workbench .panel-hero {
  background:
    linear-gradient(150deg, var(--account-workbench-panel-accent-bg) 0%, transparent 56%),
    var(--account-workbench-panel-bg);
}

.account-workbench .panel .panel-hero-title {
  border-color: var(--account-workbench-border);
  background: var(--account-workbench-panel-subtle-bg);
  color: var(--account-workbench-text-primary);
}

.account-workbench .panel-action-button {
  border-color: var(--account-workbench-border);
  background: var(--account-workbench-panel-subtle-bg);
  color: var(--account-workbench-text-primary);
  box-shadow: none;
}

.account-workbench .panel-action-button:hover {
  border-color: var(--account-workbench-control-border-active);
  background: color-mix(in srgb, var(--si-color-accent, #111111) 10%, var(--account-workbench-panel-subtle-bg));
  box-shadow: none;
}

.account-workbench .panel-action-button:focus-visible {
  outline: 2px solid var(--account-workbench-focus-ring);
}

.account-workbench .metric-card {
  border-color: var(--account-workbench-border-strong);
  background: var(--account-workbench-panel-subtle-bg);
}

.account-workbench .metric-card span {
  color: var(--account-workbench-text-secondary);
}

.account-workbench .metric-card strong {
  color: var(--account-workbench-text-primary);
}

.account-workbench th,
.account-workbench td {
  border-bottom-color: color-mix(in srgb, var(--si-color-border-soft, #e5e5e5) 74%, transparent);
}

.account-workbench th {
  color: var(--account-workbench-text-secondary);
}

.account-workbench td {
  color: var(--account-workbench-text-primary);
}

.account-workbench .pill.active {
  background: var(--account-workbench-pill-active-bg);
  color: var(--account-workbench-pill-active-text);
}

.account-workbench .pill.muted {
  background: var(--account-workbench-pill-muted-bg);
  color: var(--account-workbench-pill-muted-text);
}

.account-workbench-status-strip {
  margin-bottom: 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}


.account-workbench-filter-panel {
  display: grid;
  gap: 12px;
  margin-bottom: 12px;
}

.account-workbench-filter-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.account-workbench-field {
  display: grid;
  gap: 6px;
  flex: 1 1 300px;
}

.account-workbench-field-label {
  font-family: var(--account-workbench-font-mono);
  font-size: 0.72rem;
  color: var(--account-workbench-text-weak);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.account-workbench-search-input {
  border: 1px solid var(--account-workbench-border);
  border-radius: 12px;
  padding: 10px 12px;
  min-height: 42px;
  background: var(--account-workbench-control-bg);
  color: var(--account-workbench-text-primary);
  transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.account-workbench-search-input::placeholder {
  color: color-mix(in srgb, var(--account-workbench-text-weak) 84%, transparent);
}

.account-workbench-search-input:hover {
  border-color: color-mix(in srgb, var(--si-color-accent, #111111) 46%, transparent);
}

.account-workbench-search-input:focus-visible {
  outline: 2px solid var(--account-workbench-focus-ring);
  outline-offset: 2px;
  border-color: var(--account-workbench-control-border-active);
}

.account-workbench-filter-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.account-workbench-filter-button {
  border-radius: 999px;
  border: 1px solid var(--account-workbench-border);
  background: var(--account-workbench-control-bg);
  color: var(--account-workbench-control-text);
  font-weight: 600;
  font-size: 0.8rem;
  line-height: 1;
  padding: 8px 14px;
  cursor: pointer;
  transition: border-color 180ms ease, background-color 180ms ease, color 180ms ease;
}

.account-workbench-filter-button:hover {
  border-color: color-mix(in srgb, var(--si-color-accent, #111111) 46%, transparent);
}

.account-workbench-filter-button.is-active {
  border-color: var(--account-workbench-control-border-active);
  background: var(--account-workbench-control-bg-active);
  color: var(--account-workbench-control-text-active);
  font-weight: 700;
}

.account-workbench-filter-button:focus-visible {
  outline: 2px solid var(--account-workbench-focus-ring);
  outline-offset: 2px;
}

.account-workbench-filter-summary {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.45;
  color: var(--account-workbench-text-secondary);
}

.account-workbench-degraded-message {
  margin-top: 0;
  color: var(--si-color-danger-text, #fecaca);
  font-size: 0.78rem;
}

.account-workbench-table-status {
  text-transform: capitalize;
}

.account-workbench-empty-row {
  color: var(--account-workbench-text-secondary);
}

.account-workbench-table-heading {
  margin-top: 0;
}

.account-workbench-mode-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}

.account-workbench-mode-main {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.account-workbench-mode-side {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.account-workbench-settings-panel,
.account-workbench-role-panel {
  display: grid;
  gap: 12px;
}

.account-workbench-setting-form,
.account-workbench-role-form {
  display: grid;
  gap: 12px;
}

.account-workbench-setting-grid {
  display: grid;
  gap: 12px;
}

.account-workbench-toggle-row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--account-workbench-text-primary);
  font-size: 0.86rem;
  font-weight: 600;
}

.account-workbench-toggle-row input {
  margin: 0;
}

.account-workbench-provider-fieldset {
  margin: 0;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--account-workbench-border);
  display: grid;
  gap: 10px;
}

.account-workbench-provider-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}

.account-workbench-provider-option {
  border: 1px solid var(--account-workbench-border);
  border-radius: 10px;
  padding: 8px 9px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--account-workbench-control-text);
  background: var(--account-workbench-control-bg);
}

.account-workbench-provider-option.is-active {
  border-color: var(--account-workbench-control-border-active);
  background: var(--account-workbench-control-bg-active);
  color: var(--account-workbench-control-text-active);
}

.account-workbench-provider-option input {
  margin: 0;
}

.account-workbench-provider-hint {
  margin: 0;
  color: var(--account-workbench-text-secondary);
  font-size: 0.78rem;
}

.account-workbench-inline-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.account-workbench-inline-feedback {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.45;
}

.account-workbench-inline-feedback.is-error {
  color: var(--si-color-danger-text, #b91c1c);
}

.account-workbench-inline-feedback.is-success {
  color: var(--si-color-success-text, #065f46);
}

.account-workbench-select-input {
  border: 1px solid var(--account-workbench-border);
  border-radius: 12px;
  padding: 10px 12px;
  min-height: 42px;
  background: var(--account-workbench-control-bg);
  color: var(--account-workbench-text-primary);
  transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.account-workbench-select-input:hover {
  border-color: color-mix(in srgb, var(--si-color-accent, #111111) 46%, transparent);
}

.account-workbench-select-input:focus-visible {
  outline: 2px solid var(--account-workbench-focus-ring);
  outline-offset: 2px;
  border-color: var(--account-workbench-control-border-active);
}

.account-workbench-role-preview {
  border: 1px solid var(--account-workbench-border);
  border-radius: 12px;
  background: var(--account-workbench-panel-subtle-bg);
  padding: 10px 11px;
  display: grid;
  gap: 4px;
}

.account-workbench-role-preview strong {
  color: var(--account-workbench-text-primary);
  font-size: 0.84rem;
  line-height: 1.3;
}

.account-workbench-role-preview span {
  color: var(--account-workbench-text-secondary);
  font-size: 0.76rem;
  line-height: 1.4;
}

.account-workbench-table-action-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.account-workbench-action-button {
  border-radius: 10px;
  border: 1px solid var(--account-workbench-border);
  background: var(--account-workbench-control-bg);
  color: var(--account-workbench-control-text);
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  transition: border-color 180ms ease, background-color 180ms ease, color 180ms ease;
}

.account-workbench-action-button:hover {
  border-color: var(--account-workbench-control-border-active);
  color: var(--account-workbench-text-primary);
}

.account-workbench-action-button:focus-visible {
  outline: 2px solid var(--account-workbench-focus-ring);
  outline-offset: 2px;
}

.account-workbench-action-button:disabled {
  opacity: 0.62;
  cursor: default;
}

.account-workbench-editor-modal .ant-modal-content {
  border-radius: 14px;
  border: 1px solid var(--account-workbench-border);
  background: var(--account-workbench-panel-bg);
  color: var(--account-workbench-text-primary);
}

.account-workbench-editor-modal .ant-modal-title {
  font-family: var(--account-workbench-font-base);
  color: var(--account-workbench-text-primary);
}

.account-workbench-editor-modal .ant-form-item-label > label {
  font-family: var(--account-workbench-font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--account-workbench-text-weak);
}

.account-workbench-editor-modal .ant-input,
.account-workbench-editor-modal .ant-select-selector {
  border-radius: 10px !important;
  border-color: var(--account-workbench-border) !important;
}

.account-workbench-editor-modal .ant-input:focus,
.account-workbench-editor-modal .ant-input-focused,
.account-workbench-editor-modal .ant-select-focused .ant-select-selector {
  border-color: var(--account-workbench-control-border-active) !important;
  box-shadow: 0 0 0 2px var(--account-workbench-focus-ring) !important;
}

.account-workbench-editor-alert {
  margin-bottom: 12px;
}

@media (max-width: 960px) {
  .account-workbench-mode-layout {
    grid-template-columns: 1fr;
  }

  .account-workbench-filter-row {
    align-items: stretch;
  }

  .account-workbench-field {
    flex-basis: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .account-workbench-search-input,
  .account-workbench-filter-button,
  .account-workbench-action-button {
    transition: none !important;
  }
}
`;
