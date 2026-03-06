import { css } from "@emotion/react";

export const publicSkillDetailRightStyles = css`
  .skill-detail-card.is-file-control {
    min-height: 332px;
    background: var(--skill-detail-surface-2);
    gap: 10px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-file-control {
    background: var(--skill-detail-surface-2);
  }

  .skill-detail-right-col .skill-detail-card.is-file-control .skill-detail-file-browser-row {
    min-height: 228px;
    gap: 10px;
  }

  .skill-detail-right-col .skill-detail-card.is-file-control .skill-detail-file-list-panel,
  .skill-detail-right-col .skill-detail-card.is-file-control .skill-detail-file-info-panel {
    min-height: 228px;
    max-height: 228px;
  }

  .skill-detail-right-col .skill-detail-card.is-file-control .skill-detail-file-state-badge {
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-card.is-install {
    height: 294px;
    background: var(--skill-detail-surface-1);
    gap: 10px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-install {
    background: var(--skill-detail-surface-1);
    gap: 8px;
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-install-hint {
    margin: 0;
    color: var(--skill-detail-text-secondary);
    font-size: 11px;
    line-height: 1.45;
    font-weight: 600;
  }

  .skill-detail-install-steps {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .skill-detail-install-step {
    min-height: 30px;
    border-radius: 8px;
    background: var(--skill-detail-surface-3);
    padding: 6px 9px;
    display: inline-flex;
    align-items: center;
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    line-height: 1.2;
    font-weight: 700;
  }

  .skill-detail-install-tags {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    flex-wrap: wrap;
  }

  .skill-detail-install-tags .skill-detail-pill {
    height: 28px;
    border-radius: 8px;
    padding: 0 10px;
    font-size: 11px;
  }

  .skill-detail-card.is-metadata {
    min-height: 232px;
    background: var(--skill-detail-surface-2);
    gap: 10px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-metadata {
    background: var(--skill-detail-surface-2);
    gap: 8px;
  }

  .skill-detail-metadata-owner,
  .skill-detail-metadata-lines,
  .skill-detail-metadata-governance {
    border-radius: 10px;
    background: var(--skill-detail-surface-1);
    padding: 10px 12px;
    border: 1px solid var(--skill-detail-border);
  }

  .skill-detail-page.is-light .skill-detail-metadata-owner,
  .skill-detail-page.is-light .skill-detail-metadata-lines,
  .skill-detail-page.is-light .skill-detail-metadata-governance {
    background: var(--skill-detail-surface-1);
  }

  .skill-detail-metadata-owner {
    width: 100%;
    min-height: 62px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .skill-detail-owner-avatar {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }

  .skill-detail-page.is-light .skill-detail-owner-avatar {
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-owner-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .skill-detail-owner-name {
    margin: 0;
    color: var(--skill-detail-text-primary);
    font-size: 14px;
    line-height: 1.25;
    font-weight: 700;
  }

  .skill-detail-page.is-light .skill-detail-owner-name {
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-owner-repo {
    margin: 0;
    color: var(--skill-detail-text-muted);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.35;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .skill-detail-page.is-light .skill-detail-owner-repo {
    color: var(--skill-detail-text-muted);
  }

  .skill-detail-metadata-lines {
    width: 100%;
    min-height: 84px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .skill-detail-metadata-lines p,
  .skill-detail-metadata-governance p {
    margin: 0;
    color: var(--skill-detail-text-secondary);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.4;
    font-weight: 600;
  }

  .skill-detail-page.is-light .skill-detail-metadata-lines p {
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-page.is-light .skill-detail-metadata-governance p {
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-metadata-governance {
    width: 100%;
    min-height: 46px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .skill-detail-metadata-governance p {
    font-family: "Noto Sans SC", sans-serif;
    font-weight: 700;
  }

  .skill-detail-card.is-action {
    min-height: 236px;
    background: var(--skill-detail-surface-2);
    gap: 12px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-action {
    background: var(--skill-detail-surface-2);
    gap: 8px;
  }

  .skill-detail-action-main {
    width: 100%;
    min-height: 44px;
    border-radius: 9px;
    background: var(--skill-detail-accent-bg);
    color: var(--skill-detail-accent-text);
    font-size: 14px;
    line-height: 1.2;
    font-weight: 700;
    cursor: pointer;
    transition: filter 180ms ease;
  }

  .skill-detail-action-main:hover {
    filter: brightness(1.1);
  }

  .skill-detail-action-main:disabled,
  .skill-detail-action-button:disabled,
  .skill-detail-rating-button:disabled,
  .skill-detail-comment-delete:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    filter: none;
  }

  .skill-detail-action-row {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: stretch;
    gap: 8px;
  }

  .skill-detail-page.is-light .skill-detail-action-row {
    gap: 8px;
  }

  .skill-detail-action-button {
    border-radius: 8px;
    background: var(--skill-detail-surface-1);
    color: var(--skill-detail-text-primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 12px;
    line-height: 1.35;
    font-weight: 700;
    cursor: pointer;
    transition: filter 170ms ease;
  }

  .skill-detail-action-button.is-large {
    width: 100%;
    min-height: 44px;
    padding: 6px 8px;
  }

  .skill-detail-action-button.is-small {
    width: 100%;
    min-height: 44px;
    padding: 6px 8px;
  }

  .skill-detail-page.is-light .skill-detail-action-button {
    background: var(--skill-detail-surface-1);
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-action-button:hover {
    filter: brightness(1.06);
  }

  .skill-detail-action-button.is-active {
    background: var(--skill-detail-accent-bg);
    color: var(--skill-detail-accent-text);
  }

  .skill-detail-action-tags {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    flex-wrap: wrap;
  }

  .skill-detail-page.is-light .skill-detail-action-tags {
    gap: 6px;
  }

  .skill-detail-action-tags .skill-detail-pill {
    min-height: 30px;
    border-radius: 8px;
    padding: 0 10px;
    font-size: 12px;
  }

  .skill-detail-auth-cta {
    border-radius: 10px;
    border: 1px solid var(--skill-detail-border);
    background: var(--skill-detail-surface-1);
    padding: 10px;
    display: grid;
    gap: 8px;
  }

  .skill-detail-page.is-light .skill-detail-auth-cta {
    border-color: var(--skill-detail-border);
    background: var(--skill-detail-surface-1);
  }

  .skill-detail-auth-hint {
    margin: 0;
    color: var(--skill-detail-text-secondary);
    font-size: 12px;
    line-height: 1.4;
    font-weight: 600;
  }

  .skill-detail-page.is-light .skill-detail-auth-hint {
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-interaction-summary {
    margin: 0;
    color: var(--skill-detail-text-secondary);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.5;
    font-weight: 600;
  }

  .skill-detail-page.is-light .skill-detail-interaction-summary {
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-rating-row {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .skill-detail-rating-button {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    background: var(--skill-detail-surface-1);
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: filter 170ms ease, transform 170ms ease;
  }

  .skill-detail-rating-button:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }

  .skill-detail-rating-button.is-active {
    background: var(--skill-detail-accent-bg);
    color: var(--skill-detail-accent-text);
  }

  .skill-detail-page.is-light .skill-detail-rating-button {
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-page.is-light .skill-detail-rating-button.is-active {
    background: var(--skill-detail-accent-bg);
    color: var(--skill-detail-accent-text);
  }

  .skill-detail-comment-editor {
    display: grid;
    gap: 8px;
  }

  .skill-detail-comment-input {
    width: 100%;
    min-height: 96px;
    border: 1px solid var(--skill-detail-border);
    border-radius: 8px;
    background: var(--skill-detail-surface-1);
    color: var(--skill-detail-text-primary);
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    font-size: 13px;
    line-height: 1.5;
    padding: 10px 12px;
    resize: vertical;
  }

  .skill-detail-page.is-light .skill-detail-comment-input {
    background: var(--skill-detail-surface-1);
    border-color: var(--skill-detail-border);
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-card.is-comments {
    min-height: 176px;
    background: var(--skill-detail-surface-2);
    gap: 12px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-comments {
    background: var(--skill-detail-surface-2);
  }

  .skill-detail-comments-empty {
    margin: 0;
    color: var(--skill-detail-text-muted);
    font-size: 13px;
    line-height: 1.4;
  }

  .skill-detail-page.is-light .skill-detail-comments-empty {
    color: var(--skill-detail-text-muted);
  }

  .skill-detail-comment-item {
    border-radius: 10px;
    background: var(--skill-detail-surface-1);
    padding: 10px;
    display: grid;
    gap: 8px;
  }

  .skill-detail-page.is-light .skill-detail-comment-item {
    background: var(--skill-detail-surface-1);
  }

  .skill-detail-comment-meta {
    margin: 0;
    color: var(--skill-detail-text-muted);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.35;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .skill-detail-page.is-light .skill-detail-comment-meta {
    color: var(--skill-detail-text-muted);
  }

  .skill-detail-comment-content {
    margin: 0;
    color: var(--skill-detail-text-primary);
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .skill-detail-page.is-light .skill-detail-comment-content {
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-comment-delete {
    width: 90px;
    min-height: 44px;
    border-radius: 7px;
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: filter 170ms ease;
  }

  .skill-detail-comment-delete:hover {
    filter: brightness(1.08);
  }

  .skill-detail-page.is-light .skill-detail-comment-delete {
    background: var(--skill-detail-surface-3);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-card.is-compatibility {
    min-height: 172px;
    background: var(--skill-detail-surface-2);
    padding: 12px 14px;
    gap: 10px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-compatibility {
    background: var(--skill-detail-surface-2);
  }

  .skill-detail-compat-row {
    min-height: 34px;
    border-radius: 8px;
    background: var(--skill-detail-surface-1);
    padding: 8px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .skill-detail-compat-row.is-short {
    min-height: 30px;
    padding: 6px 10px;
  }

  .skill-detail-page.is-light .skill-detail-compat-row {
    background: var(--skill-detail-surface-1);
  }

  .skill-detail-compat-label,
  .skill-detail-compat-value {
    margin: 0;
    font-size: 12px;
    line-height: 1.25;
    font-weight: 700;
  }

  .skill-detail-compat-label {
    color: var(--skill-detail-text-muted);
  }

  .skill-detail-compat-value {
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
  }

  .skill-detail-page.is-light .skill-detail-compat-label,
  .skill-detail-page.is-light .skill-detail-compat-value {
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-compat-conflict {
    margin: 0;
    color: var(--skill-detail-text-secondary);
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    line-height: 1.4;
    font-weight: 600;
  }

  .skill-detail-page.is-light .skill-detail-compat-conflict {
    color: var(--skill-detail-text-secondary);
  }
`;
