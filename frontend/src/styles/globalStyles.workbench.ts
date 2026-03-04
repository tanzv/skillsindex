export const globalWorkbenchStyles = `
.page-admin-react,
.page-account-react {
  background:
    radial-gradient(circle at 12% 16%, rgba(244, 95, 63, 0.09), transparent 32%),
    radial-gradient(circle at 83% 10%, rgba(47, 155, 143, 0.12), transparent 30%),
    linear-gradient(140deg, #f6f2ea 0%, #f1ede5 48%, #ebe7de 100%);
}

.backend-shell {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.backend-topbar {
  position: sticky;
  top: 0;
  z-index: 80;
  border-bottom: 1px solid rgba(17, 25, 31, 0.14);
  background:
    linear-gradient(150deg, rgba(18, 29, 42, 0.96), rgba(13, 22, 35, 0.94)),
    radial-gradient(circle at 12% 10%, rgba(52, 211, 153, 0.14), transparent 36%);
  color: #e8f0ff;
  backdrop-filter: blur(10px);
  padding: 12px 20px;
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
}

.backend-topbar-brand {
  display: grid;
  gap: 2px;
}

.backend-topbar-brand h1 {
  margin: 0;
  font-size: 1.06rem;
  line-height: 1.1;
  letter-spacing: 0.01em;
  font-family: "Syne", sans-serif;
}

.backend-topbar-brand p {
  margin: 0;
  opacity: 0.76;
  font-size: 0.72rem;
}

.backend-primary-nav {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.backend-primary-nav-item {
  border: 1px solid rgba(226, 232, 240, 0.26);
  border-radius: 999px;
  background: rgba(226, 232, 240, 0.06);
  color: #dbe7ff;
  padding: 7px 12px;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.backend-primary-nav-item:hover {
  border-color: rgba(191, 219, 254, 0.52);
}

.backend-primary-nav-item.active {
  border-color: rgba(93, 234, 199, 0.78);
  background: rgba(93, 234, 199, 0.16);
  color: #f0fffb;
}

.backend-topbar-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.backend-marketplace-link {
  border: 1px solid rgba(226, 232, 240, 0.32);
  border-radius: 999px;
  background: transparent;
  color: #deecff;
  padding: 7px 12px;
  font-size: 0.74rem;
  cursor: pointer;
}

.backend-user-inline {
  display: grid;
  justify-items: end;
  gap: 1px;
  min-width: 96px;
}

.backend-user-inline strong {
  font-size: 0.77rem;
  line-height: 1.1;
  color: #f3f8ff;
}

.backend-user-inline span {
  font-size: 0.66rem;
  color: rgba(219, 234, 254, 0.84);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.backend-shell-body {
  min-height: 0;
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr);
  gap: 12px;
  width: min(1680px, calc(100% - 18px));
  margin: 12px auto;
}

.backend-secondary-nav {
  border-radius: 16px;
  border: 1px solid rgba(17, 25, 31, 0.14);
  background: linear-gradient(175deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.92));
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.08);
  padding: 14px;
  display: grid;
  align-content: start;
  gap: 10px;
}

.backend-secondary-title {
  margin: 0;
  color: #3f4f5b;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 800;
}

.backend-secondary-list {
  display: grid;
  gap: 8px;
}

.backend-secondary-item {
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.66);
  padding: 10px;
  text-align: left;
  display: grid;
  gap: 4px;
  cursor: pointer;
}

.backend-secondary-item strong {
  font-size: 0.82rem;
  color: #102230;
}

.backend-secondary-item span {
  font-size: 0.72rem;
  color: #51606d;
  line-height: 1.35;
}

.backend-secondary-item.active {
  border-color: rgba(14, 138, 160, 0.7);
  background: rgba(14, 138, 160, 0.11);
}

.backend-main-panel {
  min-width: 0;
  border-radius: 18px;
  border: 1px solid rgba(17, 25, 31, 0.14);
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 18px 30px rgba(15, 23, 42, 0.08);
  padding: 18px;
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
  .backend-topbar {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }

  .backend-shell-body {
    width: min(1680px, calc(100% - 14px));
    grid-template-columns: 1fr;
    margin-top: 10px;
  }

  .backend-secondary-nav {
    position: static;
  }

  .side-nav-groups {
    max-height: 38vh;
  }

  .workbench-field-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
}
`;
