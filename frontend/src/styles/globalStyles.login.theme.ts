export const globalLoginStylesTheme = `
@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700;800&family=Noto+Sans+SC:wght@400;500;600;700;800&display=swap");

.page-login-react,
.page-login-react-light {
  --login-font-base: "Noto Sans SC", "Noto Sans", sans-serif;
  --login-font-mono: "JetBrains Mono", monospace;
  --login-root-bg: var(--si-color-canvas, #101010);
  --login-root-bg-accent: var(--si-color-surface, #171717);
  --login-topbar-bg: var(--si-color-surface, #171717);
  --login-topbar-border: var(--si-color-border, #2b2b2b);
  --login-topbar-brand: var(--si-color-text-primary, #e5e5e5);
  --login-topbar-nav: var(--si-color-text-secondary, #a3a3a3);
  --login-topbar-locale: var(--si-color-text-secondary, #a3a3a3);
  --login-panel-visual-bg: linear-gradient(
    155deg,
    var(--si-color-surface, #171717),
    var(--si-color-panel, #111111)
  );
  --login-panel-form-bg: color-mix(in srgb, var(--si-color-panel, #111111) 84%, transparent);
  --login-panel-border: var(--si-color-border, #2b2b2b);
  --login-panel-shadow: var(--si-shadow-overlay, 0 24px 40px rgba(0, 0, 0, 0.34));
  --login-kicker: var(--si-color-text-secondary, #a3a3a3);
  --login-title: var(--si-color-text-primary, #e5e5e5);
  --login-lead: var(--si-color-text-secondary, #d4d4d4);
  --login-copy: var(--si-color-text-secondary, #a3a3a3);
  --login-glass-bg: rgba(20, 20, 20, 0.34);
  --login-glass-border: rgba(255, 255, 255, 0.16);
  --login-glass-highlight: rgba(255, 255, 255, 0.1);
  --login-glass-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
  --login-chip-bg: var(--si-color-muted-surface, #242424);
  --login-chip-border: var(--si-color-border-soft, #3a3a3a);
  --login-chip-text: var(--si-color-text-secondary, #d4d4d4);
  --login-input-bg: var(--si-color-field, #171717);
  --login-input-border: var(--si-color-border, #2b2b2b);
  --login-input-text: var(--si-color-text-primary, #e5e5e5);
  --login-input-placeholder: var(--si-color-text-weak, #8f8f8f);
  --login-btn-bg: var(--si-color-accent, #d6d6d6);
  --login-btn-border: var(--si-color-accent, #d6d6d6);
  --login-btn-text: var(--si-color-accent-contrast, #111111);
  --login-hint: var(--si-color-text-weak, #8f8f8f);
  --login-error: #ef4444;
  --login-focus-ring: rgba(148, 163, 184, 0.24);
  --login-topbar-height: 82px;
  --login-topbar-inline-padding: clamp(16px, 2.4vw, 32px);
  --oauth-dingtalk-bg: var(--si-color-accent, #d6d6d6);
  --oauth-dingtalk-text: var(--si-color-accent-contrast, #111111);
  --oauth-github-bg: var(--si-color-muted-surface, #242424);
  --oauth-github-text: var(--si-color-text-primary, #e5e5e5);
  --oauth-icon-dingtalk-bg: var(--si-color-panel, #111111);
  --oauth-icon-dingtalk-text: var(--si-color-text-primary, #e5e5e5);
  --oauth-icon-github-bg: var(--si-color-panel, #111111);
  --oauth-icon-github-text: var(--si-color-text-primary, #e5e5e5);
  --oauth-icon-google-bg: var(--si-color-panel, #111111);
  --oauth-icon-google-text: var(--si-color-text-primary, #e5e5e5);
  --oauth-icon-wecom-bg: var(--si-color-panel, #111111);
  --oauth-icon-wecom-text: var(--si-color-text-primary, #e5e5e5);
  --oauth-icon-more-bg: var(--si-color-panel, #111111);
  --oauth-icon-more-text: var(--si-color-text-primary, #e5e5e5);
  --login-info-surface-bg: rgba(255, 255, 255, 0.06);
  --login-info-surface-bg-strong: rgba(255, 255, 255, 0.02);
  --login-info-surface-border: var(--si-color-border-soft, #3a3a3a);
  --login-info-headline: var(--si-color-text-primary, #e5e5e5);
  --login-info-description: var(--si-color-text-secondary, #a3a3a3);
  --login-info-card-bg: rgba(255, 255, 255, 0.04);
  --login-info-card-border: var(--si-color-border-soft, #3a3a3a);
  --login-info-card-body: var(--si-color-text-secondary, #a3a3a3);

  background: var(--login-root-bg);
  color: var(--login-copy);
  overflow: hidden;
}

.login-page-stage {
  width: 100%;
  height: 100dvh;
  overflow: hidden;
}

.login-page-stage.is-visual-baseline {
  width: 100%;
  height: 100dvh;
  overflow: hidden;
}

.auth-shell.auth-shell-prototype {
  width: 100%;
  min-height: 100dvh;
  height: 100dvh;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0;
  overflow: hidden;
  font-family: var(--login-font-base);
}

.auth-shell.auth-shell-prototype.is-visual-baseline {
  width: 1440px;
  min-height: 1160px;
  margin: 0;
  transform-origin: top left;
}

.auth-header {
  width: 100%;
}

.auth-topbar {
  height: var(--login-topbar-height);
  min-height: var(--login-topbar-height);
  width: 100%;
  padding: 0 var(--login-topbar-inline-padding);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: var(--login-topbar-bg);
  border: 1px solid var(--login-topbar-border);
  border-top: 0;
  border-radius: 0;
  backdrop-filter: blur(10px);
}

.auth-topbar-brand {
  margin: 0;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--login-topbar-brand);
  font-family: var(--login-font-mono);
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.auth-topbar-brand-logo-wrap {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  overflow: hidden;
}

.auth-topbar-brand-logo {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: filter 180ms ease;
}

.auth-topbar-brand-text {
  display: inline-flex;
  align-items: center;
}

.auth-topbar-brand:focus-visible {
  outline: 2px solid var(--si-color-accent, #d6d6d6);
  outline-offset: 2px;
  border-radius: 12px;
}

.auth-topbar-locale {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.auth-topbar-theme-switch,
.auth-topbar-locale-switch {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 30px;
  padding: 4px;
  border-radius: 9px;
  background: var(--login-chip-bg);
  border: 1px solid var(--login-chip-border);
}

.auth-topbar-locale-switch {
  font-family: var(--login-font-mono);
}

.auth-topbar-theme-switch button,
.auth-topbar-locale-switch button {
  border: 0;
  min-height: 22px;
  border-radius: 6px;
  padding: 0 8px;
  background: transparent;
  color: var(--login-topbar-locale);
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.auth-topbar-theme-switch button.is-active,
.auth-topbar-theme-switch button:disabled,
.auth-topbar-locale-switch button.is-active,
.auth-topbar-locale-switch button:disabled {
  background: var(--si-color-surface-alt, #343438);
  color: var(--login-topbar-brand);
  cursor: default;
}

.auth-topbar-theme-switch .is-theme-toggle {
  min-width: 48px;
  text-transform: uppercase;
}

.auth-topbar-theme-switch .is-theme-toggle.is-active,
.auth-topbar-theme-switch .is-theme-toggle:disabled {
  background: var(--si-color-accent, #d6d6d6);
  color: var(--si-color-accent-contrast, #111111);
}

.auth-topbar-theme-switch button:focus-visible,
.auth-topbar-locale-switch button:focus-visible {
  outline: 2px solid var(--si-color-accent, #d6d6d6);
  outline-offset: 1px;
}

.auth-topbar-theme-switch button {
  font-family: var(--login-font-mono);
}

.auth-topbar-locale-switch button {
  color: var(--login-topbar-locale);
  min-width: 30px;
}

.auth-layout {
  position: relative;
  width: min(1360px, 100%);
  min-height: 0;
  height: calc(100dvh - var(--login-topbar-height));
  margin: 0 auto;
  padding: clamp(12px, 1.8vw, 24px);
  display: grid;
  grid-template-columns: 820px 460px;
  gap: 16px;
  overflow: hidden;
}

.auth-shell.auth-shell-prototype:not(.is-visual-baseline) .auth-layout {
  width: min(1120px, 100%);
  grid-template-columns: minmax(0, 1fr) minmax(0, 500px);
  align-items: center;
}

.auth-layout::before {
  content: none;
}

.auth-visual-panel,
.auth-form-panel {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  z-index: 1;
  min-height: 0;
}

.auth-form-panel {
  border: 1px solid color-mix(in srgb, var(--login-panel-border) 72%, #5f5f5f 28%);
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.26);
}

.auth-visual-panel {
  border: 1px solid var(--login-glass-border);
  box-shadow:
    var(--login-glass-shadow),
    inset 0 1px 0 var(--login-glass-highlight);
  backdrop-filter: blur(16px) saturate(130%);
  -webkit-backdrop-filter: blur(16px) saturate(130%);
}

.login-visual-panel {
  background: transparent;
  border: 0;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.auth-visual-panel.login-visual-panel {
  border: 0;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.login-visual-panel {
  padding: clamp(20px, 2vw, 28px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  gap: 14px;
}

.login-visual-panel::after {
  content: none;
}

.auth-compact-hint {
  margin: 0;
  width: 100%;
  max-width: 680px;
  color: rgba(245, 245, 245, 0.88);
  font-size: clamp(14px, 1.15vw, 16px);
  font-weight: 600;
  line-height: 1.44;
  letter-spacing: 0.01em;
}

`;
