export const globalLoginStylesComponents = `
.login-page-stage,
.login-page-stage * {
  -webkit-app-region: no-drag;
  -webkit-user-drag: none;
}

.login-form-panel {
  background: var(--login-panel-form-bg);
  padding: clamp(20px, 1.9vw, 30px);
  display: flex;
  flex-direction: column;
  gap: 14px;
  justify-content: center;
}

.login-form-brand {
  width: min(100%, 404px);
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.login-form-brand-logo-wrap {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.login-form-brand-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-form-brand-text {
  color: var(--login-title);
  font-family: var(--login-font-mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1;
}

.login-form-panel h2 {
  margin: 0;
  color: var(--login-title);
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
}

.auth-form-note {
  margin: 0;
  width: min(100%, 404px);
  color: var(--login-hint);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.45;
}

.login-stack-form {
  width: min(100%, 404px);
  display: grid;
  gap: 8px;
}

.auth-login-divider {
  margin: 0;
  color: var(--login-copy);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.login-field-label {
  color: var(--login-copy);
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.login-stack-form .ant-form-item {
  width: 100%;
  margin-bottom: 0;
}

.login-stack-form .ant-input,
.login-stack-form .ant-input-affix-wrapper {
  width: 100%;
  min-height: 48px;
  border: 1px solid var(--login-input-border);
  border-radius: 12px;
  background: var(--login-input-bg);
  color: var(--login-input-text);
  box-shadow: none;
}

.login-stack-form .ant-input::placeholder,
.login-stack-form .ant-input-password-icon {
  color: var(--login-input-placeholder);
}

.login-stack-form .ant-input-password-icon {
  display: none;
}

.login-stack-form .ant-input-affix-wrapper .ant-input {
  min-height: 0;
  width: 100%;
  border: 0;
  background: transparent;
}

.login-stack-form .ant-input-affix-wrapper-focused,
.login-stack-form .ant-input-affix-wrapper:focus,
.login-stack-form .ant-input:focus {
  border-color: var(--login-btn-border);
  box-shadow: 0 0 0 2px var(--login-focus-ring);
}

.login-form-row {
  width: 100%;
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.login-form-row .ant-checkbox-wrapper {
  color: var(--login-copy);
  font-size: 12px;
  font-weight: 600;
}

.login-password-toggle {
  width: fit-content;
  border: 0;
  background: transparent;
  color: var(--login-copy);
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  padding: 0;
  cursor: pointer;
}

.login-forgot-link {
  border: 0;
  background: transparent;
  color: var(--login-copy);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.auth-error {
  width: 100%;
  margin: 0;
  color: var(--login-error);
  font-size: 11px;
  font-weight: 600;
}

.auth-submit.ant-btn {
  width: 100%;
  min-height: 50px;
  border-radius: 12px;
  border-color: var(--login-btn-border);
  background: var(--login-btn-bg);
  color: var(--login-btn-text);
  font-size: 15px;
  font-weight: 700;
  box-shadow: var(--login-panel-shadow);
}

.auth-submit.ant-btn:hover,
.auth-submit.ant-btn:focus {
  border-color: var(--login-btn-border);
  background: var(--login-btn-bg);
  color: var(--login-btn-text);
  box-shadow: var(--login-panel-shadow);
}

.auth-helper-text,
.auth-provider-divider {
  width: 392px;
  margin: 0;
  color: var(--login-hint);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.4;
}

.auth-provider-divider {
  font-weight: 700;
}

.oauth-grid {
  width: min(100%, 404px);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.oauth-provider-item {
  border: 1px solid var(--login-chip-border);
  border-radius: 10px;
  background: var(--oauth-github-bg);
  color: var(--oauth-github-text);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 40px;
  padding: 8px 10px 8px 12px;
  cursor: pointer;
}

.oauth-provider-item.is-full-width {
  grid-column: 1 / -1;
  min-height: 36px;
  background: var(--oauth-dingtalk-bg);
  color: var(--oauth-dingtalk-text);
  border-color: var(--oauth-dingtalk-bg);
}

.oauth-provider-icon {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--login-font-mono);
  font-size: 9px;
  font-weight: 800;
  flex: 0 0 auto;
}

.oauth-provider-item.is-dingtalk .oauth-provider-icon {
  background: var(--oauth-icon-dingtalk-bg);
  color: var(--oauth-icon-dingtalk-text);
}

.oauth-provider-item.is-github .oauth-provider-icon {
  background: var(--oauth-icon-github-bg);
  color: var(--oauth-icon-github-text);
}

.oauth-provider-item.is-google .oauth-provider-icon {
  background: var(--oauth-icon-google-bg);
  color: var(--oauth-icon-google-text);
  font-family: var(--login-font-base);
  font-size: 11px;
}

.oauth-provider-item.is-wecom .oauth-provider-icon {
  background: var(--oauth-icon-wecom-bg);
  color: var(--oauth-icon-wecom-text);
  font-size: 7px;
}

.oauth-provider-item.is-more .oauth-provider-icon {
  background: var(--oauth-icon-more-bg);
  color: var(--oauth-icon-more-text);
  border-radius: 6px;
  width: 16px;
  height: 16px;
}

.oauth-provider-label {
  color: inherit;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  text-transform: none;
}

.auth-create-hint {
  margin: 0;
  color: var(--login-copy);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

`;
