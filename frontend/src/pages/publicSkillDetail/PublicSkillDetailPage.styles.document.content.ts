import { css } from "@emotion/react";

export const publicSkillDetailDocumentContentStyles = css`
  .skill-detail-doc-content {
    width: 100%;
    max-width: 76ch;
    margin: 0 auto;
    font-family: "IBM Plex Sans", "Noto Sans SC", "Noto Sans", sans-serif;
    font-size: 16.5px;
    line-height: 1.76;
    font-weight: 500;
    white-space: normal;
    display: flex;
    flex-direction: column;
    gap: 16px;
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
    max-width: 15ch;
    font-size: clamp(32px, 2.8vw, 42px);
    line-height: 1.12;
    margin-top: 2px;
  }

  .skill-detail-doc-heading.is-h2 {
    font-size: clamp(24px, 2.1vw, 30px);
    line-height: 1.18;
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid color-mix(in srgb, var(--skill-detail-border) 76%, transparent);
  }

  .skill-detail-doc-heading.is-h3 {
    font-size: clamp(20px, 1.7vw, 24px);
    line-height: 1.28;
    margin-top: 8px;
  }

  .skill-detail-doc-paragraph {
    margin: 0;
    color: color-mix(in srgb, var(--skill-detail-text-secondary) 92%, transparent);
    max-width: 72ch;
  }

  .skill-detail-doc-list {
    margin: 0;
    max-width: 72ch;
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
    max-width: 72ch;
    display: grid;
    gap: 6px;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 76%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-3) 52%, transparent);
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
    font-size: 15.5px;
    line-height: 1.7;
  }

  .skill-detail-doc-inline-code {
    border-radius: 6px;
    border: 1px solid color-mix(in srgb, var(--skill-detail-border) 72%, transparent);
    background: color-mix(in srgb, var(--skill-detail-surface-3) 86%, transparent);
    padding: 1px 7px;
    color: var(--skill-detail-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
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
