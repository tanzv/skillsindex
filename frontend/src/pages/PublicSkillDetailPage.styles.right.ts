import { css } from "@emotion/react";

export const publicSkillDetailRightStyles = css`
  .skill-detail-card.is-install {
    height: 294px;
    background: #111111;
    gap: 10px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-install {
    background: #111111;
    gap: 8px;
    color: #e5e5e5;
  }

  .skill-detail-install-hint {
    margin: 0;
    color: #c7d2fe;
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
    background: #2b2b2b;
    padding: 6px 9px;
    display: inline-flex;
    align-items: center;
    color: #e5e5e5;
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
    background: #242424;
    gap: 10px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-metadata {
    background: #f0f0f0;
    gap: 8px;
  }

  .skill-detail-metadata-owner,
  .skill-detail-metadata-lines,
  .skill-detail-metadata-governance {
    border-radius: 10px;
    background: #1f2937;
    padding: 10px 12px;
    border: 1px solid rgba(148, 163, 184, 0.18);
  }

  .skill-detail-page.is-light .skill-detail-metadata-owner,
  .skill-detail-page.is-light .skill-detail-metadata-lines,
  .skill-detail-page.is-light .skill-detail-metadata-governance {
    background: #f5f5f5;
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
    background: #0f172a;
    color: #e5e5e5;
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
    background: #f0f0f0;
    color: #111111;
  }

  .skill-detail-owner-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .skill-detail-owner-name {
    margin: 0;
    color: #e5e5e5;
    font-size: 14px;
    line-height: 1.25;
    font-weight: 700;
  }

  .skill-detail-page.is-light .skill-detail-owner-name {
    color: #2b2b2b;
  }

  .skill-detail-owner-repo {
    margin: 0;
    color: #4a4a4a;
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.35;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .skill-detail-page.is-light .skill-detail-owner-repo {
    color: #111111;
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
    color: #d4d4d4;
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.4;
    font-weight: 600;
  }

  .skill-detail-page.is-light .skill-detail-metadata-lines p {
    color: #2b2b2b;
  }

  .skill-detail-page.is-light .skill-detail-metadata-governance p {
    color: #111111;
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
    background: #242424;
    gap: 12px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-action {
    background: #f5f5f5;
    gap: 8px;
  }

  .skill-detail-action-main {
    width: 100%;
    min-height: 42px;
    border-radius: 9px;
    background: #111111;
    color: #e5e5e5;
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
    background: #111827;
    color: #e5e5e5;
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
    min-height: 36px;
    padding: 6px 8px;
  }

  .skill-detail-action-button.is-small {
    width: 100%;
    min-height: 34px;
    padding: 6px 8px;
  }

  .skill-detail-page.is-light .skill-detail-action-button {
    background: #f5f5f5;
    color: #111111;
  }

  .skill-detail-action-button:hover {
    filter: brightness(1.06);
  }

  .skill-detail-action-button.is-active {
    background: #1d4ed8;
    color: #dbeafe;
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

  .skill-detail-interaction-summary {
    margin: 0;
    color: #d4d4d4;
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.5;
    font-weight: 600;
  }

  .skill-detail-page.is-light .skill-detail-interaction-summary {
    color: #334155;
  }

  .skill-detail-rating-row {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .skill-detail-rating-button {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #111111;
    color: #e5e5e5;
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
    background: #2563eb;
    color: #ffffff;
  }

  .skill-detail-page.is-light .skill-detail-rating-button {
    background: #cbd5e1;
    color: #0f172a;
  }

  .skill-detail-page.is-light .skill-detail-rating-button.is-active {
    background: #2563eb;
    color: #ffffff;
  }

  .skill-detail-comment-editor {
    display: grid;
    gap: 8px;
  }

  .skill-detail-comment-input {
    width: 100%;
    min-height: 96px;
    border: 1px solid #334155;
    border-radius: 8px;
    background: #111111;
    color: #e5e5e5;
    font-family: "Noto Sans SC", "Noto Sans", sans-serif;
    font-size: 13px;
    line-height: 1.5;
    padding: 10px 12px;
    resize: vertical;
  }

  .skill-detail-page.is-light .skill-detail-comment-input {
    background: #ffffff;
    border-color: #cbd5e1;
    color: #0f172a;
  }

  .skill-detail-card.is-comments {
    min-height: 176px;
    background: #242424;
    gap: 12px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-comments {
    background: #f5f5f5;
  }

  .skill-detail-comments-empty {
    margin: 0;
    color: #a3a3a3;
    font-size: 13px;
    line-height: 1.4;
  }

  .skill-detail-page.is-light .skill-detail-comments-empty {
    color: #475569;
  }

  .skill-detail-comment-item {
    border-radius: 10px;
    background: #1f2937;
    padding: 10px;
    display: grid;
    gap: 8px;
  }

  .skill-detail-page.is-light .skill-detail-comment-item {
    background: #e2e8f0;
  }

  .skill-detail-comment-meta {
    margin: 0;
    color: #cbd5e1;
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    line-height: 1.35;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .skill-detail-page.is-light .skill-detail-comment-meta {
    color: #334155;
  }

  .skill-detail-comment-content {
    margin: 0;
    color: #e5e5e5;
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .skill-detail-page.is-light .skill-detail-comment-content {
    color: #0f172a;
  }

  .skill-detail-comment-delete {
    width: 90px;
    min-height: 32px;
    border-radius: 7px;
    background: #7f1d1d;
    color: #fee2e2;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: filter 170ms ease;
  }

  .skill-detail-comment-delete:hover {
    filter: brightness(1.08);
  }

  .skill-detail-page.is-light .skill-detail-comment-delete {
    background: #fecaca;
    color: #7f1d1d;
  }

  .skill-detail-card.is-compatibility {
    min-height: 172px;
    background: #242424;
    padding: 12px 14px;
    gap: 10px;
  }

  .skill-detail-page.is-light .skill-detail-card.is-compatibility {
    background: #f0f0f0;
  }

  .skill-detail-compat-row {
    min-height: 34px;
    border-radius: 8px;
    background: #242424;
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
    background: #ffffff;
  }

  .skill-detail-compat-label,
  .skill-detail-compat-value {
    margin: 0;
    font-size: 12px;
    line-height: 1.25;
    font-weight: 700;
  }

  .skill-detail-compat-label {
    color: #4a4a4a;
  }

  .skill-detail-compat-value {
    color: #e5e5e5;
    font-family: "JetBrains Mono", monospace;
  }

  .skill-detail-page.is-light .skill-detail-compat-label,
  .skill-detail-page.is-light .skill-detail-compat-value {
    color: #111111;
  }

  .skill-detail-compat-conflict {
    margin: 0;
    color: #ffd6a5;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    line-height: 1.4;
    font-weight: 600;
  }

  .skill-detail-page.is-light .skill-detail-compat-conflict {
    color: #b45309;
  }
`;
