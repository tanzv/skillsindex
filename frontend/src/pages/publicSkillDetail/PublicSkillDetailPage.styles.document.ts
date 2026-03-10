import { css } from "@emotion/react";
import { publicSkillDetailDocumentContentStyles } from "./PublicSkillDetailPage.styles.document.content";

export const publicSkillDetailDocumentStyles = css`
  .skill-detail-directory-shell {
    width: 100%;
    border-radius: 12px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 80%, var(--skill-detail-surface-2) 20%);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 88%, transparent);
    box-shadow: none;
  }

  .skill-detail-page.is-light .skill-detail-directory-shell {
    background: color-mix(in srgb, var(--skill-detail-surface-1) 92%, var(--skill-detail-surface-2) 8%);
    box-shadow: none;
  }

  .skill-detail-directory-head {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding-bottom: 10px;
    border-bottom: 1px solid color-mix(in srgb, var(--skill-detail-border) 78%, transparent);
  }

  .skill-detail-directory-head-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .skill-detail-directory-title {
    margin: 0;
    color: var(--skill-detail-text-primary);
    font-size: 13px;
    line-height: 1.35;
    font-weight: 700;
  }

  .skill-detail-directory-meta {
    margin: 0;
    color: var(--skill-detail-text-muted);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 600;
  }

  .skill-detail-directory-current {
    margin: 0;
    max-width: min(100%, 360px);
    min-height: 30px;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 82%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-3) 74%, transparent);
    color: var(--skill-detail-text-secondary);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.4;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .skill-detail-directory-tree {
    width: 100%;
    max-height: 248px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding-right: 2px;
  }

  .skill-detail-directory-row {
    width: 100%;
    min-height: 34px;
    border-radius: 10px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--skill-detail-text-secondary);
    display: inline-flex;
    align-items: center;
    gap: 9px;
    text-align: left;
    cursor: pointer;
    padding: 6px 12px;
    position: relative;
    transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease, box-shadow 160ms ease;
  }

  .skill-detail-directory-row.is-directory {
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-directory-row.is-directory .skill-detail-directory-row-label {
    font-weight: 700;
  }

  .skill-detail-directory-row:hover {
    border-color: color-mix(in srgb, var(--skill-detail-border-strong) 78%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-3) 56%, transparent);
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-directory-row:focus-visible {
    outline: 2px solid var(--skill-detail-focus-ring);
    outline-offset: 1px;
  }

  .skill-detail-directory-row.is-selected {
    border-color: color-mix(in srgb, var(--skill-detail-accent-bg) 34%, transparent);
    background: color-mix(in srgb, var(--skill-detail-accent-bg) 16%, transparent);
    box-shadow: inset 3px 0 0 color-mix(in srgb, var(--skill-detail-accent-bg) 88%, transparent);
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-directory-row.is-selected .skill-detail-directory-row-label {
    font-weight: 700;
  }

  .skill-detail-directory-row.is-selected .skill-detail-directory-row-icon.is-file {
    background: color-mix(in srgb, var(--skill-detail-accent-bg) 74%, transparent);
  }

  .skill-detail-directory-row-indent {
    width: calc((var(--skill-detail-tree-depth, 1) - 1) * 18px);
    align-self: stretch;
    flex: 0 0 auto;
    border-radius: 999px;
    background-image: repeating-linear-gradient(
      to right,
      transparent 0 17px,
      color-mix(in srgb, var(--skill-detail-border) 56%, transparent) 17px 18px
    );
    opacity: 0.9;
  }

  .skill-detail-directory-row-caret {
    width: 12px;
    color: var(--skill-detail-text-muted);
    font-size: 11px;
    line-height: 1;
    text-align: center;
    flex: 0 0 auto;
  }

  .skill-detail-directory-row-icon {
    position: relative;
    flex: 0 0 auto;
  }

  .skill-detail-directory-row-icon.is-directory {
    width: 15px;
    height: 11px;
    border-radius: 3px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border-strong) 72%, transparent);
    background: color-mix(in srgb, var(--skill-detail-accent-bg) 18%, var(--skill-detail-surface-3) 82%);
  }

  .skill-detail-directory-row-icon.is-directory::before {
    content: "";
    position: absolute;
    top: -3px;
    left: 1px;
    width: 8px;
    height: 4px;
    border-radius: 3px 3px 0 0;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border-strong) 66%, transparent);
    border-bottom: 0;
    background: color-mix(in srgb, var(--skill-detail-accent-bg) 24%, var(--skill-detail-surface-2) 76%);
  }

  .skill-detail-directory-row-icon.is-file {
    width: 12px;
    height: 14px;
    border-radius: 4px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border-strong) 72%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-1) 92%, var(--skill-detail-surface-3) 8%);
  }

  .skill-detail-directory-row-icon.is-file::before {
    content: "";
    position: absolute;
    top: 2px;
    right: 2px;
    width: 3px;
    height: 3px;
    border-top: 1px solid color-mix(in srgb, var(--skill-detail-border-strong) 68%, transparent);
    border-right: 1px solid color-mix(in srgb, var(--skill-detail-border-strong) 68%, transparent);
    opacity: 0.85;
  }

  .skill-detail-directory-row-label {
    min-width: 0;
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: "JetBrains Mono", monospace;
    font-size: 12.5px;
    line-height: 1.45;
    font-weight: 600;
  }

  .skill-detail-page.is-light .skill-detail-directory-row {
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-page.is-light .skill-detail-directory-current {
    border-color: color-mix(in srgb, var(--skill-detail-border) 84%, #cbd5e1 16%);
    background: color-mix(in srgb, #ffffff 84%, var(--skill-detail-surface-3) 16%);
  }

  .skill-detail-page.is-light .skill-detail-directory-row:hover {
    border-color: color-mix(in srgb, var(--skill-detail-border-strong) 82%, #c4cfdd 18%);
    background: color-mix(in srgb, var(--skill-detail-surface-3) 72%, #f6f9fc 28%);
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-page.is-light .skill-detail-directory-row.is-selected {
    border-color: color-mix(in srgb, var(--skill-detail-accent-bg) 22%, #c7d1de 78%);
    background: color-mix(in srgb, var(--skill-detail-accent-bg) 9%, #eef3f8 91%);
    box-shadow: inset 3px 0 0 color-mix(in srgb, var(--skill-detail-accent-bg) 82%, transparent);
  }

  .skill-detail-card.is-file-tree.is-preview-only {
    border: 1px solid color-mix(in srgb, var(--skill-detail-border-strong) 72%, transparent);
    box-shadow: none;
  }

  .skill-detail-page.is-light .skill-detail-card.is-file-tree.is-preview-only {
    border-color: color-mix(in srgb, var(--skill-detail-border-strong) 82%, transparent);
    box-shadow: none;
  }

  .skill-detail-doc-toolbar {
    width: 100%;
    min-height: 48px;
    padding-bottom: 12px;
    border-bottom: 1px solid color-mix(in srgb, var(--skill-detail-border) 78%, transparent);
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
    min-height: 32px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 72%, var(--skill-detail-surface-2) 28%);
    padding: 0 10px;
    color: var(--skill-detail-text-secondary);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1;
    font-weight: 700;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 82%, transparent);
    transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease;
  }

  .skill-detail-doc-toolbar .skill-detail-file-info-actions button:hover {
    background: color-mix(in srgb, var(--skill-detail-surface-3) 56%, transparent);
    border-color: color-mix(in srgb, var(--skill-detail-border-strong) 86%, transparent);
  }

  .skill-detail-doc-toolbar .skill-detail-file-info-actions button:focus-visible {
    outline: 2px solid var(--skill-detail-focus-ring);
    outline-offset: 1px;
  }

  .skill-detail-page.is-light .skill-detail-doc-toolbar {
    border-bottom-color: color-mix(in srgb, var(--skill-detail-border) 84%, #cbd5e1 16%);
  }

  .skill-detail-page.is-light .skill-detail-doc-toolbar .skill-detail-file-info-actions button {
    background: #ffffff;
    border-color: color-mix(in srgb, var(--skill-detail-border) 82%, #cbd5e1 18%);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-code-head.is-document-head {
    min-height: 44px;
    align-items: flex-start;
    gap: 10px 16px;
  }

  .skill-detail-doc-head-copy {
    min-width: 0;
    flex: 1 1 280px;
    display: grid;
    gap: 4px;
  }

  .skill-detail-doc-head-badges {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
  }

  .skill-detail-code-panel {
    width: 100%;
    min-height: 360px;
    height: auto;
    border-radius: 12px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 76%, var(--skill-detail-surface-2) 24%);
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: visible;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 82%, transparent);
    backdrop-filter: none;
  }

  .skill-detail-code-panel.is-sql {
    background: linear-gradient(180deg, var(--skill-detail-surface-1) 0%, var(--skill-detail-surface-2) 100%);
    border-color: var(--skill-detail-border-strong);
  }

  .skill-detail-card.is-file-tree.is-preview-only .skill-detail-code-panel {
    min-height: 500px;
    height: auto;
  }

  .skill-detail-code-panel.is-document {
    background: color-mix(in srgb, var(--skill-detail-surface-1) 88%, var(--skill-detail-surface-2) 12%);
    padding: 20px 22px 24px;
    box-shadow: none;
  }

  .skill-detail-page.is-light .skill-detail-code-panel {
    background: color-mix(in srgb, #ffffff 98%, var(--skill-detail-surface-2) 2%);
    gap: 6px;
    border-color: color-mix(in srgb, var(--skill-detail-border) 82%, #cbd5e1 18%);
  }

  .skill-detail-page.is-light .skill-detail-code-panel.is-document {
    background: #ffffff;
    box-shadow: none;
  }

  .skill-detail-doc-reader-shell {
    width: 100%;
    display: grid;
    gap: 18px;
  }

  .skill-detail-doc-reader-intro {
    width: 100%;
    display: grid;
    gap: 12px;
    border-radius: 14px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 84%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-1) 78%, var(--skill-detail-surface-2) 22%);
    padding: 16px 18px;
  }

  .skill-detail-doc-reader-intro.is-compact {
    gap: 10px;
  }

  .skill-detail-page.is-light .skill-detail-doc-reader-intro {
    border-color: color-mix(in srgb, var(--skill-detail-border) 84%, #cbd5e1 16%);
    background: color-mix(in srgb, #ffffff 92%, var(--skill-detail-surface-2) 8%);
  }

  .skill-detail-doc-reader-eyebrow {
    margin: 0;
    color: var(--skill-detail-text-muted);
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    line-height: 1.35;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .skill-detail-doc-reader-summary {
    margin: 0;
    max-width: 72ch;
    color: var(--skill-detail-text-secondary);
    font-size: 15px;
    line-height: 1.7;
    font-weight: 600;
  }

  .skill-detail-doc-meta-list {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 10px;
  }

  .skill-detail-doc-meta-item {
    min-width: 0;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 76%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-3) 62%, transparent);
    padding: 10px 12px;
    display: grid;
    gap: 4px;
  }

  .skill-detail-page.is-light .skill-detail-doc-meta-item {
    border-color: color-mix(in srgb, var(--skill-detail-border) 82%, #cbd5e1 18%);
    background: color-mix(in srgb, #ffffff 88%, var(--skill-detail-surface-2) 12%);
  }

  .skill-detail-doc-meta-label {
    color: var(--skill-detail-text-muted);
    font-size: 10.5px;
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .skill-detail-doc-meta-value {
    color: var(--skill-detail-text-primary);
    font-size: 13px;
    line-height: 1.45;
    font-weight: 700;
    word-break: break-word;
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

  ${publicSkillDetailDocumentContentStyles}
`
