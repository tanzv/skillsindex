export const globalLoginStylesInfoCards = `
.login-info-glass-card {
  position: relative;
  isolation: isolate;
  width: min(100%, 500px);
  min-height: auto;
  margin: 0;
  padding: 26px 24px 24px;
  display: grid;
  align-content: start;
  gap: 22px;
  border: 1px solid color-mix(in srgb, var(--login-info-surface-border) 24%, transparent);
  border-radius: 28px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--login-info-surface-bg) 34%, transparent) 0%,
    color-mix(in srgb, var(--login-info-surface-bg-strong) 24%, transparent) 100%
  );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 18px 44px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.login-info-glass-card::before {
  content: "";
  position: absolute;
  left: -54px;
  top: -72px;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--login-btn-bg) 18%, transparent) 0%,
    transparent 72%
  );
  opacity: 0.34;
  filter: blur(14px);
  pointer-events: none;
  z-index: 0;
}

.login-info-glass-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), transparent 42%);
  opacity: 0.7;
  pointer-events: none;
  z-index: 0;
}

.login-info-copy-group {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 10px;
  max-width: 420px;
  padding-top: 16px;
}

.login-info-copy-group::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 64px;
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
  max-width: 280px;
  color: var(--login-info-headline);
  font-size: clamp(34px, 3.8vw, 50px);
  font-weight: 780;
  line-height: 1.04;
  letter-spacing: -0.028em;
  word-break: normal;
  text-wrap: balance;
}

.login-info-description {
  margin: 0;
  max-width: 28ch;
  color: var(--login-info-description);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.58;
  letter-spacing: 0.01em;
}

.login-info-points {
  position: relative;
  z-index: 1;
  width: min(100%, 460px);
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  border: 0;
  background: transparent;
  overflow: visible;
}

.login-info-points li {
  position: relative;
  overflow: hidden;
  margin: 0;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  align-items: start;
  gap: 14px;
  padding: 13px 16px;
  min-height: 0;
  border: 1px solid color-mix(in srgb, var(--login-info-surface-border) 24%, transparent);
  border-radius: 18px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--login-info-surface-bg) 32%, transparent) 0%,
    color-mix(in srgb, var(--login-info-surface-bg-strong) 24%, transparent) 100%
  );
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.login-info-points li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 1px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--login-btn-bg) 44%, transparent) 0%,
    transparent 100%
  );
  opacity: 0.36;
}

.login-info-points li:first-child {
  border-color: color-mix(in srgb, var(--login-info-surface-border) 38%, transparent);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--login-info-surface-bg) 46%, transparent) 0%,
    color-mix(in srgb, var(--login-info-surface-bg-strong) 34%, transparent) 100%
  );
}

.login-info-points li:first-child::before {
  width: 2px;
  opacity: 0.7;
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
  line-height: 1.55;
}

.auth-shell.auth-shell-prototype.is-visual-baseline .login-info-glass-card {
  width: min(100%, 390px);
  padding: 14px 12px 12px;
  gap: 14px;
  border-radius: 18px;
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
  max-width: 200px;
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

.auth-shell.auth-shell-prototype.is-visual-baseline .login-info-points li::before {
  top: 8px;
  bottom: 8px;
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
    padding: 24px 20px 20px;
    gap: 20px;
  }

  .login-info-copy-group {
    max-width: none;
    padding-top: 16px;
  }

  .login-info-headline {
    max-width: 280px;
    font-size: clamp(30px, 7vw, 42px);
  }
}

@media (max-width: 560px) {
  .login-info-glass-card {
    padding: 18px 16px 16px;
    border-radius: 20px;
  }

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
