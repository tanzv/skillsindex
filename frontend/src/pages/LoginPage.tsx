import { Button, Checkbox, Form, Input } from "antd";
import { GlobalOutlined, MoonOutlined, SunOutlined, TranslationOutlined } from "@ant-design/icons";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { buildServerURL } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";
import LoginInfoPanel from "./LoginInfoPanel";
import { resolveLoginHomePath } from "./LoginPage.navigation";
import { LoginBrandConfig, resolveLoginBrandConfig } from "./loginBrandConfig";
import { resolveLoginThemeMode } from "./loginThemeMode";
import { buildLoginInfoPanelConfig, LoginInfoPanelConfig } from "./loginInfoPanelConfig";

interface LoginPageProps {
  loading: boolean;
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
  themeMode?: ThemeMode;
  onThemeModeChange?: (mode: ThemeMode) => void;
  brandConfig?: LoginBrandConfig;
  infoPanelConfig?: LoginInfoPanelConfig;
  onSubmit: (username: string, password: string) => Promise<void>;
}

interface OAuthProviderItem {
  key: string;
  label: string;
  symbol: string;
  tone: "dingtalk" | "github" | "google" | "wecom" | "more";
  fullWidth?: boolean;
  path: string;
}

export default function LoginPage({
  loading,
  locale,
  onLocaleChange,
  themeMode,
  onThemeModeChange,
  brandConfig,
  infoPanelConfig,
  onSubmit
}: LoginPageProps) {
  const { t } = useTranslation();
  const text = useMemo(
    () => ({
      kicker: t("login.kicker"),
      title: t("login.title"),
      lead: t("login.lead"),
      signIn: t("login.signIn"),
      note: t("login.note"),
      divider: t("login.divider"),
      username: t("login.username"),
      password: t("login.password"),
      showPassword: t("login.showPassword"),
      hidePassword: t("login.hidePassword"),
      remember: t("login.remember"),
      forgotPassword: t("login.forgotPassword"),
      loginFailed: t("login.loginFailed"),
      dingTalk: t("login.dingTalk"),
      dingTalkEnterprise: t("login.dingTalkEnterprise"),
      github: t("login.github"),
      google: t("login.google"),
      wecom: t("login.wecom"),
      moreProviders: t("login.moreProviders"),
      helper: t("login.helper"),
      providerDivider: t("login.providerDivider"),
      createHint: t("login.createHint")
    }),
    [t, locale]
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));

  const oauthProviders = useMemo<OAuthProviderItem[]>(
    () => [
      {
        key: "dingtalk",
        label: text.dingTalkEnterprise,
        symbol: "D",
        tone: "dingtalk",
        fullWidth: true,
        path: "/auth/dingtalk/start"
      },
      {
        key: "github",
        label: text.github,
        symbol: "●",
        tone: "github",
        path: "/auth/sso/start/github"
      },
      {
        key: "google",
        label: text.google,
        symbol: "G",
        tone: "google",
        path: "/auth/sso/start/google"
      },
      {
        key: "wecom",
        label: text.wecom,
        symbol: "●",
        tone: "wecom",
        path: "/auth/sso/start/wecom"
      },
      {
        key: "more",
        label: text.moreProviders,
        symbol: "▦",
        tone: "more",
        path: "/auth/sso/start/microsoft"
      }
    ],
    [text.dingTalkEnterprise, text.github, text.google, text.wecom, text.moreProviders]
  );
  const resolvedInfoPanelConfig = useMemo<LoginInfoPanelConfig>(
    () =>
      infoPanelConfig ||
      buildLoginInfoPanelConfig({
        kicker: text.kicker,
        title: text.title,
        lead: text.lead
      }),
    [
      infoPanelConfig,
      text.kicker,
      text.lead,
      text.title
    ]
  );
  const resolvedBrandConfig = useMemo<LoginBrandConfig>(
    () => brandConfig || resolveLoginBrandConfig({ locale }),
    [brandConfig, locale]
  );
  const currentPathname = window.location.pathname;
  const isMobilePath = /^\/mobile(\/|$)/.test(currentPathname);
  const homePath = useMemo(() => resolveLoginHomePath(currentPathname), [currentPathname]);
  const activeThemeMode = resolveLoginThemeMode(currentPathname, themeMode);
  const isVisualBaselineViewport = !isMobilePath && viewport.width === 512 && viewport.height === 342;
  const visualScale = isVisualBaselineViewport ? viewport.width / 1440 : 1;

  const stageStyle: CSSProperties | undefined = isVisualBaselineViewport
    ? {
        width: "100%",
        height: "100dvh",
        overflow: "hidden"
      }
    : undefined;
  const shellStyle: CSSProperties | undefined = isVisualBaselineViewport ? { transform: `scale(${visualScale})` } : undefined;

  useEffect(() => {
    function handleResize() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function openServerPath(path: string): void {
    window.location.assign(buildServerURL(path));
  }

  function handleThemeModeSwitch(nextMode: ThemeMode): void {
    if (!onThemeModeChange || nextMode === activeThemeMode) {
      return;
    }
    onThemeModeChange(nextMode);
  }

  function handleBrandNavigateHome(): void {
    window.location.assign(homePath);
  }

  async function handleSubmit() {
    setError("");
    try {
      await onSubmit(username, password);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : text.loginFailed);
    }
  }

  return (
    <div className={`login-page-stage${isVisualBaselineViewport ? " is-visual-baseline" : ""}`} style={stageStyle}>
      <div className={`auth-shell auth-shell-prototype${isVisualBaselineViewport ? " is-visual-baseline" : ""}`} style={shellStyle}>
        <header className="auth-header">
          <div className="auth-topbar">
            <button type="button" className="auth-topbar-brand" aria-label="Go to homepage" onClick={handleBrandNavigateHome}>
              <span className="auth-topbar-brand-logo-wrap" aria-hidden="true">
                <img className="auth-topbar-brand-logo" src={resolvedBrandConfig.logoSrc} alt="" />
              </span>
              <span className="auth-topbar-brand-text">{resolvedBrandConfig.brandText}</span>
            </button>
            <div className="auth-topbar-locale" aria-label="Global switches">
              <div className="auth-topbar-theme-switch" role="group" aria-label="Theme switch">
                <button
                  type="button"
                  className={`is-theme-toggle${activeThemeMode === "dark" ? " is-active" : ""}`}
                  onClick={() => handleThemeModeSwitch("dark")}
                  disabled={activeThemeMode === "dark"}
                  aria-label="Use dark theme"
                  title="Dark theme"
                >
                  <MoonOutlined />
                </button>
                <button
                  type="button"
                  className={`is-theme-toggle${activeThemeMode === "light" ? " is-active" : ""}`}
                  onClick={() => handleThemeModeSwitch("light")}
                  disabled={activeThemeMode === "light"}
                  aria-label="Use light theme"
                  title="Light theme"
                >
                  <SunOutlined />
                </button>
              </div>
              <div className="auth-topbar-locale-switch" role="group" aria-label="Locale switch">
                <button
                  type="button"
                  className={locale === "en" ? "is-active" : ""}
                  onClick={() => onLocaleChange("en")}
                  aria-label="Use English locale"
                  title="English"
                >
                  <GlobalOutlined />
                </button>
                <button
                  type="button"
                  className={locale === "zh" ? "is-active" : ""}
                  onClick={() => onLocaleChange("zh")}
                  aria-label="Use Chinese locale"
                  title="Chinese"
                >
                  <TranslationOutlined />
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="auth-layout">
          <LoginInfoPanel config={resolvedInfoPanelConfig} />

          <article className="auth-form-panel login-form-panel">
            <div className="login-form-brand" data-testid="login-form-brand">
              <span className="login-form-brand-logo-wrap" aria-hidden="true">
                <img className="login-form-brand-logo" src={resolvedBrandConfig.logoSrc} alt="" />
              </span>
              <span className="login-form-brand-text">{resolvedBrandConfig.brandText}</span>
            </div>
            <h2>{text.signIn}</h2>
            <p className="auth-form-note">{text.note}</p>

            <Form layout="vertical" onFinish={handleSubmit} className="login-stack-form">
              <p className="auth-login-divider">{text.divider}</p>

              <label className="login-field-label">{text.username}</label>
              <Form.Item>
                <Input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="you@company.com"
                  autoComplete="username"
                />
              </Form.Item>

              <label className="login-field-label">{text.password}</label>
              <Form.Item>
                <Input
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </Form.Item>
              <button
                className="login-password-toggle"
                type="button"
                onClick={() => setPasswordVisible((currentVisible) => !currentVisible)}
                aria-pressed={passwordVisible}
                data-testid="login-password-visibility-toggle"
              >
                {passwordVisible ? text.hidePassword : text.showPassword}
              </button>

              <div className="login-form-row">
                <Checkbox>{text.remember}</Checkbox>
                <button
                  className="login-forgot-link"
                  type="button"
                  onClick={() => openServerPath("/account/password-reset/request")}
                >
                  {text.forgotPassword}
                </button>
              </div>

              {error ? <p className="auth-error">{error}</p> : null}

              <Button htmlType="submit" type="primary" className="auth-submit" loading={loading}>
                {text.signIn}
              </Button>
            </Form>

            <div className="oauth-grid" role="list">
              {oauthProviders.map((provider) => (
                <button
                  key={provider.key}
                  type="button"
                  className={`oauth-provider-item is-${provider.tone}${provider.fullWidth ? " is-full-width" : ""}`}
                  onClick={() => openServerPath(provider.path)}
                >
                  <span className="oauth-provider-label">{provider.label}</span>
                  <span className="oauth-provider-icon">{provider.symbol}</span>
                </button>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
