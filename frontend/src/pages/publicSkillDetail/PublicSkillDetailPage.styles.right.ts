import { css } from "@emotion/react";

export const publicSkillDetailRightStyles = css`
  .skill-detail-card.is-file-control {
    min-height: 0;
    background: var(--skill-detail-surface-2);
    gap: 10px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-file-control {
    background: var(--skill-detail-surface-2);
  }

  .skill-detail-right-col .skill-detail-card.is-file-control .skill-detail-directory-shell {
    background: color-mix(in srgb, var(--skill-detail-surface-1) 74%, var(--skill-detail-surface-2) 26%);
  }

  .skill-detail-page.is-light .skill-detail-right-col .skill-detail-card.is-file-control .skill-detail-directory-shell {
    background: #ffffff;
  }

  .skill-detail-right-col .skill-detail-card.is-file-control .skill-detail-directory-tree {
    max-height: 220px;
  }

  .skill-detail-card.is-install {
    min-height: 0;
    background: var(--skill-detail-surface-1);
    gap: 12px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-install {
    background: var(--skill-detail-surface-1);
    gap: 8px;
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-install-hint {
    margin: 0;
    color: var(--skill-detail-text-secondary);
    font-size: 12px;
    line-height: 1.55;
    font-weight: 600;
  }

  .skill-detail-install-steps {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .skill-detail-install-step {
    min-height: 34px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 68%, var(--skill-detail-surface-2) 32%);
    padding: 7px 11px;
    display: inline-flex;
    align-items: center;
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.35;
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
    font-size: 12px;
  }

  .skill-detail-card.is-metadata {
    min-height: 0;
    background: var(--skill-detail-surface-2);
    gap: 12px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-metadata {
    background: var(--skill-detail-surface-2);
    gap: 8px;
  }

  .skill-detail-metadata-owner,
  .skill-detail-metadata-lines,
  .skill-detail-metadata-governance {
    border-radius: 12px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 76%, var(--skill-detail-surface-2) 24%);
    padding: 12px 14px;
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
    min-height: 0;
    background: var(--skill-detail-surface-2);
    gap: 14px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-action {
    background: var(--skill-detail-surface-2);
    gap: 10px;
  }

  .skill-detail-action-main {
    width: 100%;
    min-height: 46px;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-accent-bg) 28%, transparent);
    background: var(--skill-detail-accent-bg);
    color: var(--skill-detail-accent-text);
    font-size: 14px;
    line-height: 1.2;
    font-weight: 700;
    cursor: pointer;
    transition: transform 180ms ease, opacity 180ms ease;
  }

  .skill-detail-action-main:hover {
    transform: translateY(-1px);
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
    border-radius: 10px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 74%, var(--skill-detail-surface-2) 26%);
    color: var(--skill-detail-text-primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 12.5px;
    line-height: 1.35;
    font-weight: 700;
    cursor: pointer;
    transition: transform 170ms ease, background-color 170ms ease, border-color 170ms ease;
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
    background: #ffffff;
    color: var(--skill-detail-text-primary);
    border-color: color-mix(in srgb, var(--skill-detail-border) 84%, #cbd5e1 16%);
  }

  .skill-detail-action-button:hover {
    transform: translateY(-1px);
  }

  .skill-detail-action-button.is-active {
    background: var(--skill-detail-accent-bg);
    color: var(--skill-detail-accent-text);
  }

  .skill-detail-auth-cta {
    border-radius: 12px;
    border: 1px solid var(--skill-detail-border);
    background: color-mix(in srgb, var(--skill-detail-surface-1) 76%, var(--skill-detail-surface-2) 24%);
    padding: 12px;
    display: grid;
    gap: 10px;
  }

  .skill-detail-page.is-light .skill-detail-auth-cta {
    border-color: color-mix(in srgb, var(--skill-detail-border) 84%, #cbd5e1 16%);
    background: color-mix(in srgb, #ffffff 94%, var(--skill-detail-surface-2) 6%);
  }

  .skill-detail-action-feedback-panel {
    border-top: 1px solid color-mix(in srgb, var(--skill-detail-border) 88%, transparent);
    padding-top: 12px;
    display: grid;
    gap: 12px;
  }

  .skill-detail-page.is-light .skill-detail-action-feedback-panel {
    border-top-color: color-mix(in srgb, var(--skill-detail-border) 86%, #d8dee8 14%);
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

  .skill-detail-rating-row {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .skill-detail-rating-button {
    width: 44px;
    height: 42px;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 84%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-1) 76%, var(--skill-detail-surface-2) 24%);
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 170ms ease, border-color 170ms ease, transform 170ms ease;
  }

  .skill-detail-rating-button:hover {
    transform: translateY(-1px);
  }

  .skill-detail-rating-button.is-active {
    background: var(--skill-detail-accent-bg);
    color: var(--skill-detail-accent-text);
  }

  .skill-detail-page.is-light .skill-detail-rating-button {
    background: #ffffff;
    color: var(--skill-detail-text-secondary);
    border-color: color-mix(in srgb, var(--skill-detail-border) 84%, #cbd5e1 16%);
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
    border-radius: 10px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 82%, var(--skill-detail-surface-2) 18%);
    color: var(--skill-detail-text-primary);
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    font-size: 13.5px;
    line-height: 1.55;
    padding: 12px 14px;
    resize: vertical;
  }

  .skill-detail-page.is-light .skill-detail-comment-input {
    background: #ffffff;
    border-color: color-mix(in srgb, var(--skill-detail-border) 84%, #cbd5e1 16%);
    color: var(--skill-detail-text-primary);
  }

  .skill-detail-card.is-comments {
    min-height: 0;
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
    border-radius: 12px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 76%, var(--skill-detail-surface-2) 24%);
    padding: 12px;
    display: grid;
    gap: 8px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 84%, transparent);
  }

  .skill-detail-page.is-light .skill-detail-comment-item {
    background: #ffffff;
    border-color: color-mix(in srgb, var(--skill-detail-border) 84%, #cbd5e1 16%);
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
    width: fit-content;
    min-height: 36px;
    border-radius: 9px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 84%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-1) 72%, var(--skill-detail-surface-2) 28%);
    padding: 0 12px;
    color: var(--skill-detail-text-secondary);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 170ms ease, background-color 170ms ease;
  }

  .skill-detail-comment-delete:hover {
    transform: translateY(-1px);
  }

  .skill-detail-page.is-light .skill-detail-comment-delete {
    background: color-mix(in srgb, #ffffff 68%, var(--skill-detail-surface-3) 32%);
    color: var(--skill-detail-text-secondary);
  }

  .skill-detail-card.is-compatibility {
    min-height: 0;
    background: var(--skill-detail-surface-2);
    padding: 14px 16px;
    gap: 10px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-compatibility {
    background: var(--skill-detail-surface-2);
  }

  .skill-detail-compat-row {
    min-height: 34px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--skill-detail-surface-1) 74%, var(--skill-detail-surface-2) 26%);
    padding: 9px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 82%, transparent);
  }

  .skill-detail-compat-row.is-short {
    min-height: 30px;
    padding: 6px 10px;
  }

  .skill-detail-page.is-light .skill-detail-compat-row {
    background: #ffffff;
    border-color: color-mix(in srgb, var(--skill-detail-border) 84%, #cbd5e1 16%);
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
    color: var(--skill-detail-text-primary);
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
    color: var(--skill-detail-text-muted);
  }

  .skill-detail-card.is-install .skill-detail-action-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .skill-detail-card.is-install .skill-detail-action-button.is-large {
    width: 100%;
  }
`;
