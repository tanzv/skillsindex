export const globalLoginStylesFormHeader = `
@keyframes loginPanelEnter {
  from {
    opacity: 0;
    transform: translate3d(0, 12px, 0) scale(0.988);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

.login-form-panel {
  background: var(--login-panel-form-bg);
  padding: clamp(24px, 2.6vw, 40px);
  display: flex;
  flex-direction: column;
  gap: 14px;
  justify-content: center;
  animation: loginPanelEnter 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-form-panel {
  background: transparent;
}

.login-form-header {
  width: min(100%, 404px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.login-form-header-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 0 0 auto;
}

.login-form-header-actions .auth-topbar-theme-switch,
.login-form-header-actions .auth-topbar-locale-switch {
  min-height: 34px;
  padding: 5px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--login-chip-bg) 78%, transparent);
  border-color: color-mix(in srgb, var(--login-chip-border) 74%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.login-form-header-actions .auth-topbar-theme-switch button,
.login-form-header-actions .auth-topbar-locale-switch button {
  min-width: 28px;
  min-height: 24px;
  border-radius: 999px;
  padding: 0 9px;
  font-size: 12px;
}

.login-form-header-actions .auth-topbar-theme-switch .is-theme-toggle {
  min-width: 30px;
}

.login-form-brand {
  width: min(100%, 404px);
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.login-form-header .login-form-brand {
  width: auto;
  min-width: 0;
  flex: 1 1 auto;
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

@media (max-width: 1024px) {
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-form-header {
    width: 100%;
  }
}

@media (max-width: 560px) {
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-form-header {
    align-items: flex-start;
    gap: 10px;
  }

  .login-form-header-actions {
    gap: 6px;
  }

  .login-form-header-actions .auth-topbar-theme-switch,
  .login-form-header-actions .auth-topbar-locale-switch {
    min-height: 32px;
  }
}
`;
