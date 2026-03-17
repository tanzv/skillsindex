export const globalBackendUserControlStyles = `
.backend-topbar-actions .workspace-topbar-user-trigger {
  border: 1px solid var(--backend-shell-topbar-chip-border, rgba(163, 179, 197, 0.22));
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  color: var(--backend-shell-topbar-text, #f3f6fb);
  min-height: 40px;
  padding: 4px 10px 4px 4px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: border-color 0.16s ease, background-color 0.16s ease, box-shadow 0.16s ease, color 0.16s ease;
}

.backend-topbar-actions .workspace-topbar-user-trigger:hover {
  border-color: color-mix(in srgb, var(--backend-shell-topbar-chip-border, rgba(163, 179, 197, 0.22)) 70%, white 30%);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.05));
  box-shadow: 0 14px 28px rgba(2, 6, 23, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.backend-topbar-actions .workspace-topbar-user-trigger.is-open {
  border-color: var(--backend-shell-topbar-chip-border-active, rgba(214, 185, 137, 0.42));
  background: var(--backend-shell-topbar-chip-surface-active, rgba(214, 185, 137, 0.14));
  box-shadow: 0 16px 30px rgba(2, 6, 23, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.backend-topbar-actions .workspace-topbar-user-trigger:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--backend-shell-topbar-chip-border-active, rgba(214, 185, 137, 0.42)) 68%, white 32%);
  outline-offset: 2px;
}

.backend-topbar-actions .workspace-topbar-avatar,
.backend-user-dropdown .workspace-topbar-avatar {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top left, rgba(226, 213, 186, 0.7), transparent 68%), linear-gradient(145deg, rgba(106, 126, 150, 0.96), rgba(55, 69, 86, 0.92));
  color: #f4f0e7;
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 8px 14px rgba(0, 0, 0, 0.18);
}

.backend-user-dropdown .workspace-topbar-avatar.is-panel-avatar {
  width: 42px;
  height: 42px;
  font-size: 12px;
}

.backend-topbar-actions .workspace-topbar-user-meta {
  min-width: 0;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
}

.backend-topbar-actions .workspace-topbar-user-meta strong {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--backend-shell-topbar-text, #f3f6fb);
  font-size: 0.72rem;
  line-height: 1.1;
  font-weight: 700;
}

.backend-topbar-actions .workspace-topbar-user-meta small {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--backend-shell-topbar-text-muted, rgba(212, 220, 232, 0.7));
  font-size: 0.62rem;
  line-height: 1.1;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.backend-topbar-actions .workspace-topbar-user-icon {
  color: var(--backend-shell-topbar-text-muted, rgba(212, 220, 232, 0.7));
  font-size: 10px;
  line-height: 1;
  transition: transform 0.18s ease, color 0.18s ease;
}

.backend-topbar-actions .workspace-topbar-user-trigger.is-open .workspace-topbar-user-icon {
  color: var(--backend-shell-topbar-text, #f3f6fb);
  transform: rotate(180deg);
}

.backend-user-dropdown {
  min-width: 348px;
}

.backend-user-dropdown .workspace-topbar-user-panel {
  width: min(348px, calc(100vw - 28px));
  display: grid;
  gap: 14px;
  padding: 14px;
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, rgba(11, 17, 24, 0.98), rgba(17, 24, 34, 0.98));
  box-shadow: 0 24px 54px rgba(2, 6, 23, 0.46), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  will-change: opacity, transform;
  transform: translateZ(0);
}

.backend-user-dropdown .workspace-topbar-user-panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.03);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.backend-user-dropdown .workspace-topbar-user-panel-meta {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.backend-user-dropdown .workspace-topbar-user-panel-meta strong {
  color: #f8fbff;
  font-size: 0.95rem;
  line-height: 1.15;
  font-weight: 700;
}

.backend-user-dropdown .workspace-topbar-user-panel-meta small {
  color: rgba(203, 213, 225, 0.84);
  font-size: 0.74rem;
  line-height: 1.25;
  font-weight: 600;
}

.backend-user-dropdown .workspace-topbar-user-panel-sections {
  display: grid;
  gap: 12px;
}

.backend-user-dropdown .workspace-topbar-user-section {
  display: grid;
  gap: 8px;
}

.backend-user-dropdown .workspace-topbar-user-section-label {
  margin: 0;
  color: rgba(148, 163, 184, 0.92);
  font-family: "JetBrains Mono", monospace;
  font-size: 0.64rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 700;
}

.backend-user-dropdown .workspace-topbar-user-section-body {
  display: grid;
  gap: 8px;
}

.backend-user-dropdown .workspace-topbar-user-inline-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 10px;
}

.backend-user-dropdown .workspace-topbar-user-segmented-group {
  min-width: 0;
  display: grid;
  align-content: start;
  gap: 6px;
}

.backend-user-dropdown .workspace-topbar-user-segmented-label {
  color: rgba(203, 213, 225, 0.84);
  font-size: 0.7rem;
  line-height: 1.2;
  font-weight: 600;
}

.backend-user-dropdown .workspace-topbar-user-segmented-options {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  padding: 4px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.68);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.backend-user-dropdown .workspace-topbar-user-segmented-option {
  flex: 1 1 0;
  min-width: 0;
  min-height: 30px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgba(226, 232, 240, 0.82);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 10px;
  font-size: 0.74rem;
  line-height: 1;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
}

.backend-user-dropdown .workspace-topbar-user-segmented-option:hover:not(:disabled) {
  background: rgba(214, 185, 137, 0.12);
  color: #f8fbff;
}

.backend-user-dropdown .workspace-topbar-user-segmented-option.is-active {
  background: rgba(214, 185, 137, 0.18);
  color: #f0d8af;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.backend-user-dropdown .workspace-topbar-user-segmented-option:disabled,
.backend-user-dropdown .workspace-topbar-user-segmented-option.is-disabled {
  cursor: default;
  opacity: 0.54;
}

.backend-user-dropdown .workspace-topbar-user-segmented-option-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
}

.backend-user-dropdown .workspace-topbar-user-action {
  width: 100%;
  min-height: 46px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.68);
  color: #f8fbff;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease, transform 160ms ease;
}

.backend-user-dropdown .workspace-topbar-user-action:hover:not(:disabled) {
  border-color: rgba(214, 185, 137, 0.3);
  background: rgba(214, 185, 137, 0.08);
  transform: translateY(-1px);
}

.backend-user-dropdown .workspace-topbar-user-action.is-danger {
  background: rgba(239, 68, 68, 0.08);
}

.backend-user-dropdown .workspace-topbar-user-action.is-danger:hover:not(:disabled) {
  border-color: rgba(239, 68, 68, 0.36);
  background: rgba(239, 68, 68, 0.14);
}

.backend-user-dropdown .workspace-topbar-user-action:disabled,
.backend-user-dropdown .workspace-topbar-user-action.is-disabled {
  cursor: default;
  opacity: 0.58;
  transform: none;
}

.backend-user-dropdown .workspace-topbar-user-action-leading {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.backend-user-dropdown .workspace-topbar-user-action-icon {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(214, 185, 137, 0.12);
  font-size: 13px;
  line-height: 1;
}

.backend-user-dropdown .workspace-topbar-user-action-copy {
  min-width: 0;
  display: grid;
  gap: 2px;
  text-align: left;
}

.backend-user-dropdown .workspace-topbar-user-action-copy strong {
  color: inherit;
  font-size: 0.8rem;
  line-height: 1.2;
  font-weight: 700;
}

.backend-user-dropdown .workspace-topbar-user-action-copy small {
  color: rgba(203, 213, 225, 0.82);
  font-size: 0.68rem;
  line-height: 1.3;
  font-weight: 600;
}

.backend-user-dropdown .workspace-topbar-user-action-arrow {
  color: rgba(203, 213, 225, 0.84);
  font-size: 11px;
  line-height: 1;
}

@media (max-width: 520px) {
  .backend-user-dropdown {
    min-width: 0;
  }

  .backend-user-dropdown .workspace-topbar-user-inline-row {
    grid-template-columns: minmax(0, 1fr);
  }
}
`;
