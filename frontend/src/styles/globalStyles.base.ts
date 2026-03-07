export const globalBaseStyles = `
:root {
  --bg-canvas: var(--si-color-canvas, #f0ede6);
  --bg-ink: var(--si-color-surface, #11191f);
  --bg-panel: color-mix(in srgb, var(--si-color-panel, #fffaf2) 92%, transparent);
  --bg-nav: var(--si-color-surface, #171e24);
  --text-main: var(--si-color-text-primary, #0f2029);
  --text-soft: var(--si-color-text-secondary, #53656f);
  --text-inverse: var(--si-color-text-inverse, #ecf4f6);
  --accent-primary: var(--si-color-accent, #f45f3f);
  --accent-secondary: var(--si-color-accent, #2f9b8f);
  --success-bg: var(--si-color-success-bg, #ecfdf3);
  --success-text: var(--si-color-success-text, #065f46);
  --muted-bg: var(--si-color-muted-surface, rgba(17, 25, 31, 0.1));
  --stroke-soft: color-mix(in srgb, var(--si-color-border-soft, #d6d6d6) 72%, transparent);
  --shadow-panel: 0 18px 40px color-mix(in srgb, #000000 14%, transparent);
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
  font-family: "Manrope", sans-serif;
}

body {
  background:
    radial-gradient(circle at 14% 22%, rgba(244, 95, 63, 0.18), transparent 38%),
    radial-gradient(circle at 78% 12%, rgba(47, 155, 143, 0.22), transparent 33%),
    linear-gradient(135deg, #f3efe8 0%, #f0ede6 45%, #ece9e2 100%);
  color: var(--text-main);
}

button,
input {
  font: inherit;
}

.app-loading {
  min-height: 100vh;
  display: grid;
  place-items: center;
  color: var(--text-soft);
  letter-spacing: 0.03em;
}

.auth-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.auth-card {
  width: min(560px, 100%);
  border-radius: 28px;
  background: var(--bg-panel);
  border: 1px solid var(--stroke-soft);
  box-shadow: var(--shadow-panel);
  padding: 42px;
}

.auth-headline {
  font-family: "Syne", sans-serif;
  font-size: clamp(1.7rem, 4vw, 2.4rem);
  letter-spacing: -0.02em;
}

.auth-subline {
  margin: 12px 0 28px;
  color: var(--text-soft);
}

.auth-form {
  display: grid;
  gap: 16px;
}

.auth-label {
  display: grid;
  gap: 10px;
  font-weight: 600;
  color: #1c323f;
}

.auth-input {
  border: 1px solid rgba(17, 25, 31, 0.2);
  border-radius: 12px;
  padding: 12px 14px;
  background: #ffffff;
}

.auth-input:focus {
  outline: 2px solid rgba(47, 155, 143, 0.4);
  outline-offset: 1px;
}

.auth-error {
  margin: 0;
  color: #b7402d;
  font-size: 0.95rem;
}

.auth-submit {
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--accent-primary), #ea7246);
  color: white;
  font-weight: 700;
  padding: 13px 16px;
  cursor: pointer;
}

.auth-submit:disabled {
  opacity: 0.6;
  cursor: default;
}

.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
}

.side-nav {
  background:
    linear-gradient(155deg, rgba(24, 34, 42, 0.95), rgba(13, 22, 28, 0.92)),
    repeating-linear-gradient(
      -45deg,
      rgba(236, 244, 246, 0.05) 0,
      rgba(236, 244, 246, 0.05) 10px,
      transparent 10px,
      transparent 20px
    );
  color: var(--text-inverse);
  padding: 32px 24px;
  border-right: 1px solid rgba(236, 244, 246, 0.14);
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 26px;
}

.brand-block h1 {
  margin: 8px 0 0;
  font-family: "Syne", sans-serif;
  font-size: clamp(1.5rem, 2.2vw, 2rem);
  line-height: 1.1;
}

.brand-kicker {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  opacity: 0.75;
}

.side-nav nav {
  display: grid;
  gap: 10px;
  align-content: start;
}

.nav-item {
  border: 1px solid rgba(236, 244, 246, 0.2);
  background: rgba(236, 244, 246, 0.04);
  border-radius: 14px;
  text-align: left;
  color: var(--text-inverse);
  padding: 14px;
  display: grid;
  gap: 6px;
  cursor: pointer;
}

.nav-item strong {
  font-weight: 700;
}

.nav-item span {
  font-size: 0.85rem;
  opacity: 0.78;
}

.nav-item.active {
  border-color: rgba(244, 95, 63, 0.75);
  background: rgba(244, 95, 63, 0.14);
}

.user-block {
  border-top: 1px solid rgba(236, 244, 246, 0.22);
  padding-top: 16px;
}

.user-block p {
  margin: 0;
  font-weight: 700;
}

.user-block small {
  display: block;
  margin-top: 4px;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  opacity: 0.68;
}

.ghost {
  border: 1px solid rgba(236, 244, 246, 0.3);
  background: transparent;
  color: var(--text-inverse);
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
}

.main-panel {
  padding: 28px;
  width: min(1440px, 100%);
}


.page-grid {
  margin-top: 18px;
  display: grid;
  gap: 16px;
}

.panel {
  background: var(--bg-panel);
  border: 1px solid var(--stroke-soft);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 24px color-mix(in srgb, #000000 14%, transparent);
}

.panel-hero {
  background:
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--accent-secondary) 16%, transparent),
      color-mix(in srgb, var(--accent-primary) 18%, transparent)
    ),
    var(--bg-panel);
}

.panel-hero-compact {
  display: grid;
  gap: 16px;
}

.panel-hero-toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
}

.panel-hero-toolbar-main {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.panel .panel-hero-title {
  margin: 0;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--stroke-soft) 84%, transparent);
  background: color-mix(in srgb, var(--bg-panel) 82%, rgba(255, 255, 255, 0.42));
  color: var(--text-main);
  font-family: "JetBrains Mono", monospace;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1;
  text-transform: uppercase;
}

.panel-hero-badges,
.panel-hero-actions,
.panel-hero-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.panel-hero-controls {
  min-width: 0;
}

.panel-hero-notice {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.82rem;
  line-height: 1.55;
}

.panel-hero-metric-help {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.8rem;
  line-height: 1.45;
}

.panel-action-button {
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--stroke-soft) 88%, transparent);
  background: color-mix(in srgb, var(--bg-panel) 84%, rgba(255, 255, 255, 0.4));
  color: var(--text-main);
  padding: 9px 14px;
  cursor: pointer;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
  box-shadow: 0 10px 24px color-mix(in srgb, #000000 13%, transparent);
  transition: transform 180ms ease, border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
}

.panel-action-button:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--accent-secondary) 28%, var(--stroke-soft));
  box-shadow: 0 14px 28px color-mix(in srgb, #000000 16%, transparent);
}

.panel-action-button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent-secondary) 24%, transparent);
  outline-offset: 2px;
}

.panel-action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.panel-action-button[data-variant="emphasis"] {
  border-color: color-mix(in srgb, var(--accent-primary) 42%, var(--stroke-soft));
  background: linear-gradient(135deg, rgba(244, 95, 63, 0.14), rgba(47, 155, 143, 0.12));
}

.panel h2,
.panel h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-family: "Syne", sans-serif;
}

.panel.loading,
.panel.error {
  text-align: center;
  font-weight: 600;
}

.panel.error {
  color: #b7402d;
}

.metric-row {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.metric-card {
  border: 1px solid var(--stroke-soft);
  border-radius: 14px;
  padding: 12px;
  display: grid;
  gap: 8px;
  background: color-mix(in srgb, var(--bg-panel) 86%, transparent);
}

.metric-card span {
  color: var(--text-soft);
  font-size: 0.86rem;
}

.metric-card strong {
  font-size: 1.6rem;
  font-family: "Syne", sans-serif;
}

.metrics-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.metric-spotlight {
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--bg-ink) 8%, transparent), color-mix(in srgb, var(--bg-panel) 84%, transparent));
}

.metric-spotlight span {
  color: var(--text-soft);
  font-weight: 600;
  font-size: 0.86rem;
}

.metric-spotlight strong {
  display: block;
  margin-top: 8px;
  font-size: 2.1rem;
  font-family: "Syne", sans-serif;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 11px 8px;
  border-bottom: 1px solid color-mix(in srgb, var(--stroke-soft) 88%, transparent);
  white-space: nowrap;
}

th {
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-soft);
}

.pill {
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.pill.active {
  background: color-mix(in srgb, var(--success-bg) 82%, transparent);
  color: var(--success-text);
}

.pill.muted {
  background: color-mix(in srgb, var(--muted-bg) 88%, transparent);
  color: var(--text-soft);
}

@media (max-width: 960px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .side-nav {
    border-right: 0;
    border-bottom: 1px solid rgba(236, 244, 246, 0.2);
  }

  .main-panel {
    width: 100%;
    padding: 18px;
  }
}

.page-home-react {
  background: #050c18;
  color: #eaf2ff;
}

.page-home-react-light {
  background:
    radial-gradient(circle at 14% 20%, rgba(84, 128, 191, 0.15), transparent 34%),
    radial-gradient(circle at 84% 16%, rgba(33, 149, 178, 0.16), transparent 30%),
    linear-gradient(160deg, #c3cfdf 0%, #becadb 56%, #b9c5d7 100%);
  color: #132845;
}
`;
