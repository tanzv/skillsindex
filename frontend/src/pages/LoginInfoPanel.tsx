import { LoginInfoPanelConfig } from "./loginInfoPanelConfig";

interface LoginInfoPanelProps {
  config: LoginInfoPanelConfig;
}

const defaultInfoItems = [
  "Enterprise SSO verifies member identity before sign-in.",
  "Role-based access protects internal skill assets.",
  "Audit events are retained for compliance tracing."
];

function resolveCompactHint(config: LoginInfoPanelConfig): string {
  if (config.title.trim()) {
    return config.title;
  }
  if (config.kicker.trim()) {
    return config.kicker;
  }
  return config.lead.trim();
}

export default function LoginInfoPanel({ config }: LoginInfoPanelProps) {
  const compactHint = resolveCompactHint(config);
  const keyPoints = (config.keyPoints || []).map((item) => item.trim()).filter((item) => item.length > 0);
  const resolvedItems = keyPoints.length > 0 ? keyPoints : defaultInfoItems;
  const heroImageSrc = config.heroImageSrc || "/brand/login-promo-illustration.svg";

  return (
    <article className="auth-visual-panel login-visual-panel">
      {compactHint ? (
        <p className="auth-compact-hint" data-testid="login-info-hint">
          {compactHint}
        </p>
      ) : null}
      <div className="login-info-hero" data-testid="login-info-hero" aria-hidden="true">
        <img className="login-info-hero-image" src={heroImageSrc} alt="" />
      </div>
      <ul className="login-info-points" data-testid="login-info-points">
        {resolvedItems.map((item) => (
          <li key={item}>
            <span className="login-info-point-icon" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
