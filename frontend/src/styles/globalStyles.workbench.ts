export const globalWorkbenchStyles = `
.page-admin-react,
.page-account-react {
  background:
    radial-gradient(circle at 12% 16%, rgba(244, 95, 63, 0.09), transparent 32%),
    radial-gradient(circle at 83% 10%, rgba(47, 155, 143, 0.12), transparent 30%),
    linear-gradient(140deg, #f6f2ea 0%, #f1ede5 48%, #ebe7de 100%);
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
  .side-nav-groups {
    max-height: 38vh;
  }

  .workbench-field-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
}
`;
