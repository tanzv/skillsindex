export const globalLoginStylesComponents = `
.login-page-stage,
.login-page-stage * {
  -webkit-app-region: no-drag;
  -webkit-user-drag: none;
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
  width: 24px;
  min-width: 24px;
  height: 24px;
  min-height: 24px;
  border: 0;
  background: transparent;
  color: var(--login-copy);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  line-height: 1;
  padding: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: color 160ms ease, transform 140ms ease, opacity 140ms ease;
}

.login-password-toggle-icon {
  font-size: 13px;
  line-height: 1;
}

.login-password-toggle:hover {
  color: var(--login-title);
  opacity: 0.96;
}

.login-password-toggle:focus-visible {
  outline: 2px solid var(--si-color-accent, #d6d6d6);
  outline-offset: 2px;
  border-radius: 8px;
}

.login-password-toggle:active {
  transform: translateY(1px);
}

.login-forgot-link {
  border: 0;
  background: transparent;
  color: var(--login-copy);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  transition: color 160ms ease, transform 140ms ease;
}

.login-forgot-link:hover {
  color: var(--login-title);
}

.login-forgot-link:focus-visible {
  outline: 2px solid var(--si-color-accent, #d6d6d6);
  outline-offset: 2px;
  border-radius: 8px;
}

.login-forgot-link:active {
  transform: translateY(1px);
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
  transition: transform 150ms ease, box-shadow 200ms ease;
}

.auth-submit.ant-btn:hover,
.auth-submit.ant-btn:focus {
  border-color: var(--login-btn-border);
  background: var(--login-btn-bg);
  color: var(--login-btn-text);
  box-shadow: var(--login-panel-shadow);
  transform: translateY(-1px);
}

.auth-submit.ant-btn:active {
  transform: translateY(0);
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
  transition: transform 170ms ease, box-shadow 220ms ease, border-color 180ms ease, filter 180ms ease;
  animation: loginPanelEnter 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.oauth-provider-item:nth-of-type(1) {
  animation-delay: 40ms;
}

.oauth-provider-item:nth-of-type(2) {
  animation-delay: 100ms;
}

.oauth-provider-item:nth-of-type(3) {
  animation-delay: 160ms;
}

.oauth-provider-item:nth-of-type(4) {
  animation-delay: 220ms;
}

.oauth-provider-item:nth-of-type(5) {
  animation-delay: 260ms;
}

.oauth-provider-item:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--login-chip-border) 68%, var(--si-color-accent, #d6d6d6) 32%);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.2);
}

.oauth-provider-item:focus-visible {
  outline: 2px solid var(--si-color-accent, #d6d6d6);
  outline-offset: 2px;
}

.oauth-provider-item:active {
  transform: translateY(0) scale(0.992);
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
  transition: transform 180ms ease, filter 180ms ease;
}

.oauth-provider-item:hover .oauth-provider-icon {
  transform: scale(1.08);
  filter: saturate(1.15);
}

@media (prefers-reduced-motion: reduce) {
  .login-form-panel,
  .oauth-provider-item {
    animation: none !important;
  }

  .auth-submit.ant-btn,
  .login-password-toggle,
  .login-forgot-link,
  .auth-topbar-brand,
  .auth-topbar-theme-switch button,
  .auth-topbar-locale-switch button,
  .oauth-provider-item,
  .oauth-provider-icon {
    transition: none !important;
  }
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
