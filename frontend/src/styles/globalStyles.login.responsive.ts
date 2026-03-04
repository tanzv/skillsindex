export const globalLoginStylesResponsive = `
@media (max-width: 1400px) {
  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .auth-layout {
    width: min(1120px, 100%);
    grid-template-columns: minmax(0, 1fr) minmax(0, 500px);
    align-items: center;
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
    width: min(944px, 100%);
    min-height: 0;
    padding: 16px;
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-visual-panel {
    min-height: 0;
    padding: 26px;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-form-panel {
    padding: 22px;
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
    padding: 12px;
    gap: 12px;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-visual-panel {
    padding: 18px;
    min-height: 0;
  }

  .auth-shell.auth-shell-prototype:not(.is-visual-baseline) .login-form-panel {
    padding: 16px;
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
