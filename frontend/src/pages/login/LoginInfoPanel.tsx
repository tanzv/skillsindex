import { LoginInfoPanelConfig } from "./loginInfoPanelConfig";
import { buildLoginInfoPanelViewModel } from "./loginInfoPanelModel";

interface LoginInfoPanelProps {
  config: LoginInfoPanelConfig;
}

export default function LoginInfoPanel({ config }: LoginInfoPanelProps) {
  const panelViewModel = buildLoginInfoPanelViewModel(config);

  return (
    <article className="auth-visual-panel login-visual-panel">
      <section className="login-info-glass-card" data-testid="login-info-card">
        <div className="login-info-copy-group">
          {panelViewModel.eyebrow ? (
            <p className="login-info-eyebrow" data-testid="login-info-eyebrow">
              {panelViewModel.eyebrow}
            </p>
          ) : null}
          {panelViewModel.headline ? (
            <h2 className="login-info-headline" data-testid="login-info-hint">
              {panelViewModel.headline}
            </h2>
          ) : null}
          {panelViewModel.description ? <p className="login-info-description">{panelViewModel.description}</p> : null}
        </div>
        {panelViewModel.points.length > 0 ? (
          <ul className="login-info-points" data-testid="login-info-points">
            {panelViewModel.points.map((point, index) => (
              <li key={point.id}>
                <span className="login-info-point-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="login-info-point-body">{point.body}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </article>
  );
}
