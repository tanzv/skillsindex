export const globalLoginStylesInfoCards = `
.login-info-glass-card {
  width: min(100%, 560px);
  min-height: auto;
  margin: 0 auto 0 0;
  display: grid;
  align-content: center;
  gap: 24px;
}

.login-info-copy-group {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 12px;
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
  max-width: 7.5em;
  color: transparent;
  font-size: clamp(46px, 4.8vw, 70px);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: 0.01em;
  word-break: keep-all;
  text-wrap: balance;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(214, 214, 214, 0.86));
  -webkit-background-clip: text;
  background-clip: text;
}

.login-info-description {
  margin: 0;
  max-width: 32ch;
  color: var(--login-info-description);
  font-size: 17px;
  font-weight: 500;
  line-height: 1.6;
  letter-spacing: 0.01em;
}

.login-info-points {
  position: relative;
  z-index: 1;
  width: min(100%, 470px);
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  border: 1px solid color-mix(in srgb, var(--login-info-surface-border) 68%, transparent);
  border-radius: 20px;
  background: color-mix(in srgb, var(--login-info-surface-bg) 46%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  overflow: hidden;
}

.login-info-points li {
  margin: 0;
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  padding: 15px 18px;
  min-height: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--login-info-surface-border) 54%, transparent);
}

.login-info-points li:last-child {
  border-bottom: 0;
}

.login-info-point-index {
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--login-btn-bg) 78%, transparent);
  font-size: 0;
  line-height: 0;
}

.login-info-point-body {
  color: var(--login-info-card-body);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

@media (max-width: 1024px) {
  .login-info-glass-card {
    min-height: auto;
    align-content: start;
    width: 100%;
    margin: 0;
  }

  .login-info-headline {
    max-width: none;
    font-size: clamp(32px, 7.2vw, 46px);
    line-height: 1.08;
  }
}

@media (max-width: 560px) {
  .login-info-description {
    font-size: 15px;
  }

  .login-info-points {
    width: 100%;
    border-radius: 18px;
  }

  .login-info-points li {
    padding: 13px 14px;
    gap: 10px;
  }
}
`;
