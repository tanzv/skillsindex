export const globalLoginStylesInfoCards = `
.login-info-glass-card {
  width: min(100%, 560px);
  min-height: auto;
  margin: 0;
  display: grid;
  align-content: start;
  gap: 24px;
}

.login-info-copy-group {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 12px;
  max-width: 500px;
  padding-top: 18px;
}

.login-info-copy-group::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 72px;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.44) 0%,
    color-mix(in srgb, var(--login-btn-bg) 36%, transparent) 72%,
    transparent 100%
  );
}

.login-info-eyebrow {
  width: fit-content;
  margin: 0;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid var(--login-info-eyebrow-border);
  background: var(--login-info-eyebrow-bg);
  color: var(--login-info-eyebrow-text);
  font-family: var(--login-font-mono);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.login-info-headline {
  margin: 0;
  max-width: none;
  color: var(--login-info-headline);
  font-size: clamp(34px, 4vw, 56px);
  font-weight: 780;
  line-height: 1.02;
  letter-spacing: -0.025em;
  word-break: normal;
  text-wrap: balance;
}

.login-info-description {
  margin: 0;
  max-width: 32ch;
  color: var(--login-info-description);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.62;
  letter-spacing: 0.01em;
}

.login-info-points {
  position: relative;
  z-index: 1;
  width: min(100%, 520px);
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  border: 0;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  overflow: visible;
}

.login-info-points li {
  margin: 0;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  align-items: start;
  gap: 16px;
  padding: 15px 18px;
  min-height: 0;
  border: 1px solid color-mix(in srgb, var(--login-info-surface-border) 46%, transparent);
  border-radius: 18px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--login-info-surface-bg) 72%, transparent) 0%,
    color-mix(in srgb, var(--login-info-surface-bg-strong) 62%, transparent) 100%
  );
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.login-info-point-index {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  width: auto;
  height: auto;
  border-radius: 0;
  background: transparent;
  color: var(--login-info-point-index);
  font-family: var(--login-font-mono);
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.08em;
  padding-top: 5px;
}

.login-info-point-body {
  color: var(--login-info-card-body);
  font-size: 14px;
  font-weight: 550;
  line-height: 1.6;
}

.auth-shell.auth-shell-prototype.is-visual-baseline .login-info-glass-card {
  width: min(100%, 390px);
  gap: 14px;
}

.auth-shell.auth-shell-prototype.is-visual-baseline .login-info-copy-group {
  gap: 8px;
  max-width: 360px;
  padding-top: 12px;
}

.auth-shell.auth-shell-prototype.is-visual-baseline .login-info-copy-group::before {
  width: 56px;
}

.auth-shell.auth-shell-prototype.is-visual-baseline .login-info-headline {
  font-size: 21px;
}

.auth-shell.auth-shell-prototype.is-visual-baseline .login-info-description {
  max-width: 30ch;
  font-size: 10px;
  line-height: 1.45;
}

.auth-shell.auth-shell-prototype.is-visual-baseline .login-info-points {
  width: min(100%, 360px);
  gap: 6px;
}

.auth-shell.auth-shell-prototype.is-visual-baseline .login-info-points li {
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
}

.auth-shell.auth-shell-prototype.is-visual-baseline .login-info-point-index {
  font-size: 10px;
  padding-top: 3px;
}

.auth-shell.auth-shell-prototype.is-visual-baseline .login-info-point-body {
  font-size: 10px;
  line-height: 1.35;
}

@media (max-width: 1024px) {
  .login-info-glass-card {
    min-height: auto;
    align-content: start;
    width: 100%;
    margin: 0;
    gap: 20px;
  }

  .login-info-copy-group {
    max-width: none;
    padding-top: 16px;
  }

  .login-info-headline {
    max-width: none;
    font-size: clamp(30px, 7vw, 42px);
  }
}

@media (max-width: 560px) {
  .login-info-description {
    font-size: 15px;
  }

  .login-info-points {
    width: 100%;
  }

  .login-info-points li {
    grid-template-columns: 28px minmax(0, 1fr);
    padding: 12px 14px;
    gap: 12px;
  }
}
`;
