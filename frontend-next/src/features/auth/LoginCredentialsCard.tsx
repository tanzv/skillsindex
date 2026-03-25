import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

import { Checkbox } from "@/src/components/ui/checkbox";
import { resolveBrandWordmarkAlt, resolveBrandWordmarkSrc } from "@/src/components/shared/brandWordmark";
import type { PublicAuthProviderItem } from "@/src/lib/api/publicAuthProviders";
import type { PublicAuthMessages } from "@/src/lib/i18n/publicAuthMessages";
import { cn } from "@/src/lib/utils";

import styles from "./LoginCredentialsCard.module.scss";

interface LoginCredentialsCardProps {
  messages: PublicAuthMessages;
  providers: PublicAuthProviderItem[];
  theme: "dark" | "light";
  username: string;
  password: string;
  showPassword: boolean;
  rememberMe: boolean;
  errorMessage: string;
  isSubmitting: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberChange: (checked: boolean) => void;
  onTogglePassword: () => void;
  onForgotPassword: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function LoginCredentialsCard({
  messages,
  providers = [],
  theme,
  username,
  password,
  showPassword,
  rememberMe,
  errorMessage,
  isSubmitting,
  onUsernameChange,
  onPasswordChange,
  onRememberChange,
  onTogglePassword,
  onForgotPassword,
  onSubmit
}: LoginCredentialsCardProps) {
  const wordmarkSrc = resolveBrandWordmarkSrc(theme === "light");

  return (
    <div className={styles.formInner} aria-busy={isSubmitting} data-testid="login-form-card">
      <header className={styles.formHeader}>
        <div className={styles.formBrand} data-testid="login-form-brand">
          <Image
            src={wordmarkSrc}
            alt={resolveBrandWordmarkAlt(messages.brandText)}
            width={560}
            height={72}
            className={styles.formBrandWordmark}
          />
          <span className={styles.formBrandText}>{messages.brandText}</span>
        </div>
      </header>

      <h1 className={styles.heading}>{messages.heading}</h1>
      <p className={styles.note}>{messages.note}</p>

      <form className={styles.form} onSubmit={onSubmit}>
        {providers.length > 0 ? (
          <div className={styles.providerStack} data-testid="login-provider-stack">
            {providers.map((provider) => (
              <a
                key={provider.key}
                href={provider.startPath}
                className={styles.providerButton}
                data-testid={`login-provider-${provider.key}`}
              >
                {provider.label}
              </a>
            ))}
          </div>
        ) : null}

        <p className={styles.divider}>{messages.divider}</p>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="username">
            {messages.usernameLabel}
          </label>
          <div className={styles.inputWrap}>
            <input
              id="username"
              className={styles.input}
              autoComplete="username"
              data-testid="login-username-input"
              name="username"
              required
              value={username}
              onChange={(event) => onUsernameChange(event.target.value)}
              placeholder={messages.usernamePlaceholder}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="password">
            {messages.passwordLabel}
          </label>
          <div className={styles.inputWrap}>
            <input
              id="password"
              className={cn(styles.input, styles.passwordInput)}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              data-testid="login-password-input"
              name="password"
              required
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder={messages.passwordPlaceholder}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={onTogglePassword}
              aria-label={showPassword ? messages.hidePassword : messages.showPassword}
              data-testid="login-password-toggle"
            >
              {showPassword ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className={styles.row}>
          <label className={styles.checkboxLabel}>
            <Checkbox
              className={styles.checkbox}
              checked={rememberMe}
              onCheckedChange={onRememberChange}
            />
            <span>{messages.remember}</span>
          </label>

          <button type="button" className={styles.forgotButton} onClick={onForgotPassword}>
            {messages.forgotPassword}
          </button>
        </div>

        {errorMessage ? (
          <p className={styles.error} role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          className={styles.submitButton}
          aria-busy={isSubmitting}
          data-testid="login-submit-button"
          disabled={isSubmitting || !username.trim() || !password.trim()}
        >
          {isSubmitting ? (
            <span className={styles.submitSpinner} aria-hidden="true" data-testid="login-submit-spinner" />
          ) : null}
          <span className={styles.submitLabel}>{isSubmitting ? messages.submitting : messages.submit}</span>
        </button>
      </form>
    </div>
  );
}
