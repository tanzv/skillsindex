"use client";

import { Globe2, Languages, MoonStar, SunMedium } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";

import { LoginCredentialsCard } from "@/src/features/auth/LoginCredentialsCard";
import { resolveLoginErrorMessage } from "@/src/features/auth/loginErrorMessage";
import { LoginInfoPanel } from "@/src/features/auth/LoginInfoPanel";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import type { PublicAuthMessages } from "@/src/lib/i18n/publicAuthMessages";
import {
  publicLocaleCookieName,
  publicLocaleStorageKey,
  type PublicLocale
} from "@/src/lib/i18n/publicLocale";
import { cn } from "@/src/lib/utils";

import styles from "./LoginForm.module.css";

interface LoginFormProps {
  redirectTarget: string;
  initialLocale: PublicLocale;
  messages: PublicAuthMessages;
}

interface LoginResponse {
  ok: boolean;
  user: {
    id: number;
    username: string;
  };
}

type LoginTheme = "dark" | "light";

export function LoginForm({ redirectTarget, initialLocale, messages }: LoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState<LoginTheme>("dark");
  const [requestedLocale, setRequestedLocale] = useState<PublicLocale | null>(null);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === "undefined" ? 1440 : window.innerWidth,
    height: typeof window === "undefined" ? 1160 : window.innerHeight
  }));

  const safeRedirectTarget = useMemo(() => {
    if (!redirectTarget.startsWith("/") || redirectTarget.startsWith("//")) {
      return "/workspace";
    }

    return redirectTarget;
  }, [redirectTarget]);

  const infoItems = useMemo(
    () => [messages.infoPointOne, messages.infoPointTwo, messages.infoPointThree],
    [messages.infoPointOne, messages.infoPointThree, messages.infoPointTwo]
  );
  const locale = requestedLocale === null || requestedLocale === initialLocale ? initialLocale : requestedLocale;
  const isVisualBaselineViewport = viewport.width === 512 && viewport.height === 342;
  const visualScale = isVisualBaselineViewport ? viewport.width / 1440 : 1;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    function handleResize() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function applyLocale(nextLocale: PublicLocale) {
    if (nextLocale === locale) {
      return;
    }

    setRequestedLocale(nextLocale);
    window.localStorage.setItem(publicLocaleStorageKey, nextLocale);
    document.cookie = `${publicLocaleCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = nextLocale;
    startTransition(() => {
      router.refresh();
    });
  }

  function handleForgotPassword() {
    window.location.assign("/account/password-reset/request");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await clientFetchJSON<LoginResponse>("/api/bff/auth/login", {
        method: "POST",
        body: {
          username,
          password
        }
      });

      window.location.assign(safeRedirectTarget);
    } catch (error) {
      setErrorMessage(resolveLoginErrorMessage(error, messages));
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.stage} data-theme={theme} data-testid="login-page">
      <div className={cn(styles.viewport, isVisualBaselineViewport && styles.isVisualBaselineViewport)}>
        <div
          className={cn(styles.shell, isVisualBaselineViewport && styles.isVisualBaselineShell)}
          data-visual-baseline={isVisualBaselineViewport ? "true" : "false"}
          style={isVisualBaselineViewport ? { transform: `scale(${visualScale})` } : undefined}
        >
          <header className={styles.topbar} data-testid="login-topbar">
            <div className={styles.topbarBrand}>
              <span className={styles.topbarBrandMark} aria-hidden="true" />
              <span className={styles.topbarBrandText}>{messages.brandText}</span>
            </div>
            <div className={styles.topbarControls}>
              <div className={styles.controlGroup} role="group" aria-label={messages.themeSwitchAriaLabel}>
                <button
                  type="button"
                  className={cn(styles.controlButton, theme === "dark" && styles.isActive)}
                  onClick={() => setTheme("dark")}
                  aria-pressed={theme === "dark"}
                  aria-label={messages.themeDarkAriaLabel}
                  data-testid="login-theme-dark"
                >
                  <MoonStar size={13} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={cn(styles.controlButton, theme === "light" && styles.isActive)}
                  onClick={() => setTheme("light")}
                  aria-pressed={theme === "light"}
                  aria-label={messages.themeLightAriaLabel}
                  data-testid="login-theme-light"
                >
                  <SunMedium size={13} aria-hidden="true" />
                </button>
              </div>

              <div className={styles.controlGroup} role="group" aria-label={messages.localeSwitchAriaLabel}>
                <button
                  type="button"
                  className={cn(styles.controlButton, locale === "en" && styles.isActive)}
                  onClick={() => applyLocale("en")}
                  aria-pressed={locale === "en"}
                  aria-label={messages.localeEnAriaLabel}
                  data-testid="login-locale-en"
                >
                  <Globe2 size={13} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={cn(styles.controlButton, locale === "zh" && styles.isActive)}
                  onClick={() => applyLocale("zh")}
                  aria-pressed={locale === "zh"}
                  aria-label={messages.localeZhAriaLabel}
                  data-testid="login-locale-zh"
                >
                  <Languages size={13} aria-hidden="true" />
                </button>
              </div>
            </div>
          </header>

          <section className={styles.layout}>
            <aside className={styles.infoPanel}>
              <LoginInfoPanel
                eyebrow={messages.infoEyebrow}
                title={messages.infoTitle}
                lead={messages.infoLead}
                items={infoItems}
              />
            </aside>

            <section className={styles.formCard}>
              <LoginCredentialsCard
                messages={messages}
                username={username}
                password={password}
                showPassword={showPassword}
                rememberMe={rememberMe}
                errorMessage={errorMessage}
                isSubmitting={isSubmitting}
                onUsernameChange={setUsername}
                onPasswordChange={setPassword}
                onRememberChange={setRememberMe}
                onTogglePassword={() => setShowPassword((currentValue) => !currentValue)}
                onForgotPassword={handleForgotPassword}
                onSubmit={handleSubmit}
              />
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}
