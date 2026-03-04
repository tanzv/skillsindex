import { css } from "@emotion/react";

export const publicSkillDetailBaseStyles = css`
  @keyframes skillDetailPageEnter {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .skill-detail-stage {
    margin: 0;
    width: 100%;
    min-height: 100dvh;
    background: radial-gradient(circle at 0 0, #171717 0%, #101010 40%, #0a0a0a 100%);
    overflow-x: hidden;
    overflow-y: auto;
  }

  .skill-detail-stage.is-light-stage {
    background: linear-gradient(180deg, #f8fbff 0%, #eff4fc 100%);
  }

  .skill-detail-page {
    width: 100%;
    max-width: 1440px;
    min-height: 1160px;
    margin: 0 auto;
    padding: 0 0 12px;
    background: #111111;
    color: #e5e5e5;
    font-family: "IBM Plex Sans", "Noto Sans SC", "Noto Sans", sans-serif;
    display: flex;
    flex-direction: column;
    gap: 16px;
    transform-origin: top left;
    animation: skillDetailPageEnter 220ms ease-out both;
  }

  .skill-detail-page.is-visual-baseline {
    width: 1440px;
    max-width: none;
  }

  .skill-detail-page.is-light {
    background: #f0f0f0;
    color: #111111;
  }

  .skill-detail-page * {
    box-sizing: border-box;
  }

  .skill-detail-page button {
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
  }

  .skill-detail-top {
    width: 100%;
    min-height: 120px;
    padding: 20px clamp(16px, 2.2vw, 24px);
    background: linear-gradient(180deg, #171717 0%, #12151b 100%);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  }

  .skill-detail-page.is-light .skill-detail-top {
    background: linear-gradient(180deg, #ffffff 0%, #f6f8fb 100%);
    border-bottom-color: #dbe4ee;
  }

  .skill-detail-title-group {
    width: min(760px, 100%);
    min-width: 260px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .skill-detail-title {
    margin: 0;
    color: #e5e5e5;
    font-size: 34px;
    line-height: 1.06;
    font-weight: 700;
    letter-spacing: -0.015em;
  }

  .skill-detail-page.is-light .skill-detail-title {
    color: #111111;
  }

  .skill-detail-breadcrumb {
    min-height: 20px;
    max-width: 100%;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .skill-detail-breadcrumb .ant-breadcrumb {
    width: 100%;
    color: #94a3b8;
    font-size: 12px;
    line-height: 1.35;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .skill-detail-breadcrumb .ant-breadcrumb-link,
  .skill-detail-breadcrumb .ant-breadcrumb-separator {
    color: #94a3b8;
  }

  .skill-detail-breadcrumb-button {
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
    padding: 0;
    transition: color 160ms ease;
  }

  .skill-detail-breadcrumb-button:hover {
    color: #cbd5e1;
  }

  .skill-detail-breadcrumb-current {
    color: inherit;
  }

  .skill-detail-page.is-light .skill-detail-breadcrumb .ant-breadcrumb,
  .skill-detail-page.is-light .skill-detail-breadcrumb .ant-breadcrumb-link,
  .skill-detail-page.is-light .skill-detail-breadcrumb .ant-breadcrumb-separator {
    color: #334155;
  }

  .skill-detail-page.is-light .skill-detail-breadcrumb-button:hover {
    color: #0f172a;
  }

  .skill-detail-meta-strip {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .skill-detail-meta-chip {
    height: 26px;
    border-radius: 999px;
    padding: 0 12px;
    background: #1e293b;
    color: #cbd5e1;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
  }

  .skill-detail-meta-chip.is-accent {
    background: #1d4ed8;
    color: #dbeafe;
  }

  .skill-detail-meta-chip.is-success {
    background: #14532d;
    color: #dcfce7;
  }

  .skill-detail-page.is-light .skill-detail-meta-chip {
    background: #e2e8f0;
    color: #334155;
  }

  .skill-detail-page.is-light .skill-detail-meta-chip.is-accent {
    background: #dbeafe;
    color: #1e3a8a;
  }

  .skill-detail-page.is-light .skill-detail-meta-chip.is-success {
    background: #dcfce7;
    color: #166534;
  }

  .skill-detail-top-actions {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .skill-detail-pill {
    height: 40px;
    border-radius: 12px;
    padding: 0 16px;
    background: #1e293b;
    color: #e2e8f0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
    transition: filter 180ms ease, transform 180ms ease;
  }

  .skill-detail-page.is-light .skill-detail-pill {
    background: #e2e8f0;
    color: #0f172a;
  }

  .skill-detail-pill.is-active {
    background: #0f172a;
    color: #e2e8f0;
    cursor: default;
  }

  .skill-detail-page.is-light .skill-detail-pill.is-active {
    background: #334155;
    color: #f8fafc;
  }

  .skill-detail-pill.is-primary-action {
    background: #2563eb;
    color: #ffffff;
  }

  .skill-detail-pill.is-secondary-action {
    background: #0f172a;
    color: #dbeafe;
  }

  .skill-detail-pill.is-warning {
    background: #7c4a0f;
    color: #ffe7c7;
  }

  .skill-detail-pill.is-success {
    background: #14532d;
    color: #dcfce7;
  }

  .skill-detail-pill.is-neutral {
    background: #0f172a;
    color: #93c5fd;
  }

  .skill-detail-page.is-light .skill-detail-pill.is-secondary-action {
    background: #cbd5e1;
    color: #0f172a;
  }

  .skill-detail-page.is-light .skill-detail-pill.is-neutral {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .skill-detail-pill:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .skill-detail-pill:not(.is-active):not(:disabled):hover {
    filter: brightness(1.06);
    transform: translateY(-1px);
  }

  .skill-detail-main {
    width: min(1360px, calc(100% - 24px));
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 360px);
    gap: 16px;
    align-items: flex-start;
  }

  .skill-detail-left-col {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .skill-detail-right-col {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .skill-detail-card {
    border-radius: 16px;
    background: #242424;
    padding: 16px 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: 1px solid rgba(148, 163, 184, 0.16);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
    transition: border-color 180ms ease, box-shadow 180ms ease;
  }

  .skill-detail-page.is-light .skill-detail-card {
    background: #f5f5f5;
    color: #111111;
    border-color: rgba(15, 23, 42, 0.08);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  }

  .skill-detail-card-title {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 15px;
    line-height: 1.2;
    font-weight: 700;
    color: #e5e5e5;
  }

  .skill-detail-page.is-light .skill-detail-card-title {
    color: #111111;
  }

  .skill-detail-title-dot {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    background: #111111;
    flex: 0 0 auto;
  }

  .skill-detail-page:not(.is-light) .skill-detail-title-dot.is-dark-dot {
    background: #f0f0f0;
  }

  .skill-detail-feedback {
    margin: 0;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 700;
    color: #94a3b8;
  }

  .skill-detail-page.is-light .skill-detail-feedback {
    color: #111111;
  }

  .skill-detail-loading,
  .skill-detail-empty,
  .skill-detail-error {
    width: 100%;
    height: 320px;
    display: grid;
    place-items: center;
    font-size: 14px;
    line-height: 1.2;
    font-weight: 600;
  }

  .skill-detail-error {
    color: #ef4444;
  }
`;
