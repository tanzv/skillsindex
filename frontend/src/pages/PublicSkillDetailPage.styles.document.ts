import { css } from "@emotion/react";

export const publicSkillDetailDocumentStyles = css`
  .skill-detail-directory-shell {
    width: 100%;
    border-radius: 12px;
    background: color-mix(in srgb, var(--skill-detail-surface-2) 74%, transparent);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border-strong) 42%, transparent);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .skill-detail-page.is-light .skill-detail-directory-shell {
    background: color-mix(in srgb, var(--skill-detail-surface-1) 86%, transparent);
    box-shadow: inset 0 1px 0 rgba(15, 23, 42, 0.04);
  }

  .skill-detail-directory-head {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .skill-detail-directory-title {
    margin: 0;
    color: var(--skill-detail-text-primary);
    font-size: 12px;
    line-height: 1.35;
    font-weight: 700;
  }

  .skill-detail-directory-meta {
    margin: 0;
    color: var(--skill-detail-text-muted);
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    line-height: 1.2;
    font-weight: 600;
  }

  .skill-detail-directory-tree {
    width: 100%;
    max-height: 188px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding-right: 2px;
  }

  .skill-detail-directory-row {
    width: 100%;
    min-height: 32px;
    border-radius: 8px;
    border: 0;
    background: transparent;
    color: var(--skill-detail-text-secondary);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-align: left;
    cursor: pointer;
    padding-top: 5px;
    padding-bottom: 5px;
    padding-right: 10px;
    padding-left: calc(10px + (var(--skill-detail-tree-depth, 1) - 1) * 16px);
    transition: background-color 160ms ease, color 160ms ease;
  }

  .skill-detail-directory-row.is-directory .skill-detail-directory-row-label {
    font-weight: 700;
  }

  .skill-detail-directory-row:hover {
    background: color-mix(in srgb, var(--skill-detail-surface-3) 62%, transparent);
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-directory-row:focus-visible {
    outline: 2px solid var(--skill-detail-focus-ring);
    outline-offset: 1px;
  }

  .skill-detail-directory-row.is-selected {
    background: color-mix(in srgb, var(--skill-detail-accent-bg) 18%, transparent);
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-directory-row.is-selected .skill-detail-directory-row-icon.is-file {
    background: color-mix(in srgb, var(--skill-detail-accent-bg) 74%, transparent);
  }

  .skill-detail-directory-row-caret {
    width: 10px;
    color: var(--skill-detail-text-muted);
    font-size: 10px;
    line-height: 1;
    text-align: center;
    flex: 0 0 auto;
  }

  .skill-detail-directory-row-icon {
    width: 12px;
    height: 12px;
    border-radius: 4px;
    flex: 0 0 auto;
    background: color-mix(in srgb, var(--skill-detail-surface-3) 78%, transparent);
  }

  .skill-detail-directory-row-icon.is-directory {
    border-radius: 3px;
    background: color-mix(in srgb, var(--skill-detail-accent-bg) 32%, transparent);
  }

  .skill-detail-directory-row-icon.is-file {
    border-radius: 50%;
    width: 8px;
    height: 8px;
    background: color-mix(in srgb, var(--skill-detail-text-muted) 72%, transparent);
  }

  .skill-detail-directory-row-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    line-height: 1.35;
    font-weight: 600;
  }

  .skill-detail-page.is-light .skill-detail-directory-row {
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-page.is-light .skill-detail-directory-row:hover {
    background: color-mix(in srgb, var(--skill-detail-surface-3) 78%, transparent);
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-page.is-light .skill-detail-directory-row.is-selected {
    background: color-mix(in srgb, var(--skill-detail-accent-bg) 12%, transparent);
  }

  .skill-detail-card.is-file-tree.is-preview-only {
    border: 1px solid color-mix(in srgb, var(--skill-detail-border-strong) 72%, transparent);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .skill-detail-page.is-light .skill-detail-card.is-file-tree.is-preview-only {
    border-color: color-mix(in srgb, var(--skill-detail-border-strong) 82%, transparent);
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.72);
  }

  .skill-detail-doc-toolbar {
    width: 100%;
    min-height: 42px;
    padding-bottom: 10px;
    border-bottom: 0;
  }

  .skill-detail-doc-toolbar-main {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .skill-detail-doc-file-icon {
    width: 12px;
    height: 14px;
    border-radius: 3px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-text-muted) 80%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-3) 78%, transparent);
    flex: 0 0 auto;
  }

  .skill-detail-doc-file-name {
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    line-height: 1.45;
    font-weight: 700;
    word-break: break-word;
  }

  .skill-detail-doc-file-size {
    color: var(--skill-detail-text-muted);
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    line-height: 1.3;
    font-weight: 600;
  }

  .skill-detail-doc-toolbar-actions {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
  }

  .skill-detail-doc-toolbar .skill-detail-file-info-actions {
    gap: 6px;
  }

  .skill-detail-doc-toolbar .skill-detail-file-info-actions button {
    min-height: 28px;
    border-radius: 7px;
    background: color-mix(in srgb, var(--skill-detail-surface-2) 72%, transparent);
    padding: 0 10px;
    color: var(--skill-detail-text-secondary);
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
    border: 0;
    transition: filter 160ms ease;
  }

  .skill-detail-doc-toolbar .skill-detail-file-info-actions button:hover {
    filter: brightness(1.06);
  }

  .skill-detail-doc-toolbar .skill-detail-file-info-actions button:focus-visible {
    outline: 2px solid var(--skill-detail-focus-ring);
    outline-offset: 1px;
  }

  .skill-detail-page.is-light .skill-detail-doc-toolbar {
    border-bottom-color: transparent;
  }

  .skill-detail-page.is-light .skill-detail-doc-toolbar .skill-detail-file-info-actions button {
    background: color-mix(in srgb, var(--skill-detail-surface-1) 84%, transparent);
  }

  .skill-detail-code-head.is-document-head {
    min-height: 38px;
    align-items: center;
    gap: 6px 16px;
  }

  .skill-detail-code-panel {
    width: 100%;
    min-height: 420px;
    height: auto;
    border-radius: 12px;
    background: color-mix(in srgb, var(--skill-detail-surface-2) 72%, transparent);
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: visible;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border-strong) 62%, transparent);
    backdrop-filter: blur(12px);
  }

  .skill-detail-code-panel.is-sql {
    background: linear-gradient(180deg, var(--skill-detail-surface-1) 0%, var(--skill-detail-surface-2) 100%);
    border-color: var(--skill-detail-border-strong);
  }

  .skill-detail-card.is-file-tree.is-preview-only .skill-detail-code-panel {
    min-height: 620px;
    height: auto;
  }

  .skill-detail-code-panel.is-document {
    background: color-mix(in srgb, var(--skill-detail-surface-1) 74%, transparent);
    padding: 20px 22px 22px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 8px 18px rgba(0, 0, 0, 0.22);
  }

  .skill-detail-page.is-light .skill-detail-code-panel {
    background: var(--skill-detail-surface-1);
    gap: 6px;
  }

  .skill-detail-page.is-light .skill-detail-code-panel.is-document {
    background: color-mix(in srgb, #ffffff 84%, transparent);
    box-shadow: inset 0 1px 0 rgba(15, 23, 42, 0.05), 0 6px 16px rgba(15, 23, 42, 0.08);
  }

  .skill-detail-code-content {
    margin: 0;
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-size: 12.5px;
    line-height: 1.55;
    font-weight: 600;
    white-space: pre;
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
  }

  .skill-detail-page.is-light .skill-detail-code-content {
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-doc-content {
    font-family: "IBM Plex Sans", "Noto Sans SC", "Noto Sans", sans-serif;
    font-size: 18px;
    line-height: 1.82;
    font-weight: 500;
    white-space: normal;
    display: flex;
    flex-direction: column;
    gap: 18px;
    overflow: visible;
    flex: 0 0 auto;
    min-height: 0;
  }

  .skill-detail-doc-heading {
    margin: 0;
    color: var(--skill-detail-text-primary);
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .skill-detail-doc-heading.is-h1 {
    font-size: clamp(40px, 3vw, 56px);
    line-height: 1.08;
    margin-top: 4px;
  }

  .skill-detail-doc-heading.is-h2 {
    font-size: clamp(32px, 2.3vw, 40px);
    line-height: 1.14;
    margin-top: 18px;
  }

  .skill-detail-doc-heading.is-h3 {
    font-size: clamp(24px, 1.9vw, 30px);
    line-height: 1.22;
    margin-top: 10px;
  }

  .skill-detail-doc-paragraph {
    margin: 0;
    color: color-mix(in srgb, var(--skill-detail-text-secondary) 92%, transparent);
    max-width: 74ch;
  }

  .skill-detail-doc-list {
    margin: 0;
    padding-left: 24px;
    display: grid;
    gap: 8px;
    color: color-mix(in srgb, var(--skill-detail-text-secondary) 92%, transparent);
  }

  .skill-detail-doc-list li::marker {
    color: var(--skill-detail-text-muted);
  }

  .skill-detail-doc-kv {
    margin: 0;
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
    color: color-mix(in srgb, var(--skill-detail-text-secondary) 92%, transparent);
  }

  .skill-detail-doc-kv-key {
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .skill-detail-doc-kv-value {
    font-family: "IBM Plex Sans", "Noto Sans SC", "Noto Sans", sans-serif;
    font-size: 17px;
    line-height: 1.78;
  }

  .skill-detail-doc-inline-code {
    border-radius: 6px;
    background: color-mix(in srgb, var(--skill-detail-surface-3) 86%, transparent);
    padding: 1px 7px;
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    line-height: 1.5;
    font-weight: 600;
  }

  .skill-detail-doc-divider {
    width: 100%;
    border: 0;
    height: 1px;
    background: color-mix(in srgb, var(--skill-detail-border) 82%, transparent);
    margin: 8px 0;
  }

  .skill-detail-code-foot {
    width: 100%;
    min-height: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: var(--skill-detail-text-muted);
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    line-height: 1.35;
    font-weight: 600;
    flex-wrap: wrap;
  }

  .skill-detail-page.is-light .skill-detail-code-foot {
    color: var(--skill-detail-text-muted);
  }
`;
