export const globalLoginStylesInfoCards = `
.login-info-glass-card {
  width: min(100%, 520px);
  min-height: auto;
  margin: 0 0 0 auto;
  border-radius: 16px;
  border: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  padding: 0;
  display: grid;
  align-content: center;
  gap: 12px;
}

.login-info-headline {
  margin: 0;
  max-width: none;
  color: transparent;
  font-size: clamp(44px, 4.2vw, 64px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: 0.01em;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(214, 214, 214, 0.86));
  -webkit-background-clip: text;
  background-clip: text;
}

.login-info-description {
  margin: 0;
  max-width: 34ch;
  color: var(--login-info-description);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.01em;
}

.login-info-points {
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.login-info-points li {
  margin: 0;
  display: block;
  border: 1px solid var(--login-info-card-border);
  background: linear-gradient(150deg, var(--login-info-card-bg), rgba(255, 255, 255, 0.02));
  border-radius: 12px;
  padding: 12px 14px;
}

.login-info-point-body {
  color: var(--login-info-card-body);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.45;
}

@media (max-width: 1024px) {
  .login-info-glass-card {
    min-height: auto;
    align-content: start;
  }

  .login-info-headline {
    max-width: none;
    font-size: clamp(32px, 7.2vw, 46px);
    line-height: 1.08;
  }
}
`;
