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
        {panelViewModel.headline ? (
          <h2 className="login-info-headline" data-testid="login-info-hint">
            {panelViewModel.headline}
          </h2>
        ) : null}
        {panelViewModel.description ? <p className="login-info-description">{panelViewModel.description}</p> : null}
        {panelViewModel.points.length > 0 ? (
          <ul className="login-info-points" data-testid="login-info-points">
            {panelViewModel.points.map((point) => (
              <li key={point.id}>
                <span className="login-info-point-body">{point.body}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </article>
  );
}
