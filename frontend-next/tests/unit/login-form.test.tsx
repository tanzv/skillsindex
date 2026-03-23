import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LoginForm } from "@/src/features/auth/LoginForm";
import type { LoginInfoPanelModel } from "@/src/features/auth/loginInfoPanelModel";
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
  loginCsrfFailed: "Unable to initialize sign-in security.",
};

const infoPanelModel: LoginInfoPanelModel = {
  eyebrow: "Private Access",
  title: "Welcome Back",
  lead: "Use one secure entry point for internal skill access.",
  cards: [
    {
      id: "credentials",
      accent: "primary",
      eyebrow: "Credential Mode",
      title: "Password Sign-In",
      description: "Use your existing local account credentials.",
    },
    {
      id: "redirect",
      accent: "secondary",
      eyebrow: "Return Route",
      title: "Resume Requested Work",
      description:
        "After sign in, you will be redirected to the requested route.",
      meta: "/admin/overview",
    },
  ],
};

function renderLoginFormMarkup() {
  return renderToStaticMarkup(
    createElement(LoginForm, {
      redirectTarget: "/admin/overview",
      initialLocale: "en",
      infoPanelModel,
      messages,
    }),
  );
}

describe("LoginForm", () => {
  it("renders stable shell semantics for the login route", () => {
    const markup = renderLoginFormMarkup();

    expect(markup).toContain('data-testid="login-page"');
    expect(markup).toContain('data-testid="login-topbar"');
    expect(markup).toContain('data-testid="login-info-card"');
    expect(markup).toContain('data-testid="login-form-card"');
    expect(markup).toContain('data-testid="login-theme-dark"');
    expect(markup).toContain('data-testid="login-theme-light"');
    expect(markup).toContain('data-testid="login-locale-en"');
    expect(markup).toContain('data-testid="login-locale-zh"');
    expect(markup).toContain("Welcome Back");
    expect(markup).toContain("/admin/overview");
  });
});
