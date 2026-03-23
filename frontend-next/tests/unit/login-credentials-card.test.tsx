import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LoginCredentialsCard } from "@/src/features/auth/LoginCredentialsCard";
import type { PublicAuthMessages } from "@/src/lib/i18n/publicAuthMessages";

const messages: PublicAuthMessages = {
  themeSwitchAriaLabel: "Theme switch",
  themeDarkAriaLabel: "Switch to dark theme",
  themeLightAriaLabel: "Switch to light theme",
  localeSwitchAriaLabel: "Locale switch",
  localeEnAriaLabel: "Switch to English",
  localeZhAriaLabel: "Switch to Chinese",
  brandText: "SkillsIndex",
  heading: "Account Sign In",
  note: "Use your workspace credentials to continue.",
  divider: "Use your workspace credentials",
  usernameLabel: "Username",
  usernamePlaceholder: "you@company.com",
  passwordLabel: "Password",
  passwordPlaceholder: "••••••••",
  remember: "Remember me",
  forgotPassword: "Forgot password?",
  showPassword: "Show password",
  hidePassword: "Hide password",
  submit: "Sign In",
  submitting: "Signing In...",
  loginFailed: "Sign in failed.",
  loginInvalidCredentials: "Invalid username or password.",
  loginTooManyRequests: "Too many attempts. Try again later.",
  loginServiceUnavailable: "Service unavailable. Try again later.",
  loginSessionStartFailed: "Session startup failed after sign in.",
  loginCsrfFailed: "Unable to initialize sign-in security."
};

function renderCardMarkup(overrides?: Partial<Parameters<typeof LoginCredentialsCard>[0]>) {
  return renderToStaticMarkup(
    createElement(LoginCredentialsCard, {
      messages,
      theme: "dark",
      username: "admin",
      password: "Admin123456!",
      showPassword: false,
      rememberMe: true,
      errorMessage: "",
      isSubmitting: false,
      onUsernameChange: () => {},
      onPasswordChange: () => {},
      onRememberChange: () => {},
      onTogglePassword: () => {},
      onForgotPassword: () => {},
      onSubmit: () => {},
      ...overrides
    })
  );
}

describe("LoginCredentialsCard", () => {
  it("renders stable input semantics for login credentials", () => {
    const markup = renderCardMarkup();

    expect(markup).toContain('id="username"');
    expect(markup).toContain('name="username"');
    expect(markup).toContain('autoComplete="username"');
    expect(markup).toContain('required=""');
    expect(markup).toContain('id="password"');
    expect(markup).toContain('name="password"');
    expect(markup).toContain('autoComplete="current-password"');
    expect(markup).toContain('data-testid="login-submit-button"');
    expect(markup).not.toContain('data-testid="login-submit-spinner"');
  });

  it("renders submitting and error accessibility contracts when the form is busy", () => {
    const markup = renderCardMarkup({
      errorMessage: messages.loginInvalidCredentials,
      isSubmitting: true
    });

    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain('data-testid="login-submit-spinner"');
    expect(markup).toContain(messages.submitting);
    expect(markup).toContain('role="alert"');
    expect(markup).toContain(messages.loginInvalidCredentials);
  });
});
