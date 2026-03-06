export const globalLoginStylesResponsive = `
@media (max-width: 1400px) {
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .auth-layout {
    width: 100%;
    grid-template-columns: minmax(0, 1fr) minmax(420px, 480px);
    align-items: stretch;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .auth-compact-hint,
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-info-points,
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-form-brand,
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .auth-form-note,
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-stack-form,
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-stack-form .ant-form-item,
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-stack-form .ant-input,
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-stack-form .ant-input-affix-wrapper,
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-form-row,
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .auth-submit.ant-btn,
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .auth-error,
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .auth-helper-text,
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .auth-provider-divider,
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .oauth-grid {
    width: 100%;
  }

}

@media (max-width: 1024px) {
  .page-login-react,
  .page-login-react-light {
    --login-topbar-height: 72px;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .auth-topbar {
    height: var(--login-topbar-height);
    min-height: var(--login-topbar-height);
    padding: 0 var(--login-topbar-inline-padding);
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .auth-layout {
    width: 100%;
    min-height: 100dvh;
    height: auto;
    padding: 0;
    grid-template-columns: 1fr;
    gap: 0;
    overflow: auto;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-visual-panel {
    min-height: 0;
    padding: 28px 24px 18px;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-form-panel {
    padding: 24px 22px 28px;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .auth-compact-hint {
    font-size: 15px;
  }
}

@media (max-width: 560px) {
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .auth-topbar {
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    height: var(--login-topbar-height);
    min-height: var(--login-topbar-height);
    padding: 0 12px;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .auth-topbar-locale {
    width: auto;
    justify-content: flex-end;
    flex-wrap: nowrap;
    gap: 6px;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .auth-layout {
    width: 100%;
    min-height: 100dvh;
    padding: 0;
    gap: 0;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-visual-panel {
    padding: 22px 16px 14px;
    min-height: 0;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-form-panel {
    padding: 18px 16px 22px;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-form-panel h2 {
    font-size: 30px;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .auth-compact-hint {
    font-size: 14px;
    line-height: 1.45;
    width: 100%;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-info-points {
    width: 100%;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .oauth-grid {
    width: 100%;
    grid-template-columns: 1fr;
    flex-wrap: wrap;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .oauth-provider-item.is-full-width {
    grid-column: auto;
  }
}
`;
