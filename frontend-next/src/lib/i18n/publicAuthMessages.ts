export interface PublicAuthMessages {
  themeSwitchAriaLabel: string;
  themeDarkAriaLabel: string;
  themeLightAriaLabel: string;
  localeSwitchAriaLabel: string;
  localeEnAriaLabel: string;
  localeZhAriaLabel: string;
  brandText: string;
  heading: string;
  note: string;
  divider: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  remember: string;
  forgotPassword: string;
  showPassword: string;
  hidePassword: string;
  submit: string;
  submitting: string;
  loginFailed: string;
  loginInvalidCredentials: string;
  loginTooManyRequests: string;
  loginServiceUnavailable: string;
  loginSessionStartFailed: string;
  loginCsrfFailed: string;
}

export const publicAuthMessageKeyMap = {
  themeSwitchAriaLabel: "theme_switch_aria_label",
  themeDarkAriaLabel: "theme_dark_aria_label",
  themeLightAriaLabel: "theme_light_aria_label",
  localeSwitchAriaLabel: "locale_switch_aria_label",
  localeEnAriaLabel: "locale_en_aria_label",
  localeZhAriaLabel: "locale_zh_aria_label",
  brandText: "brand_text",
  heading: "heading",
  note: "note",
  divider: "divider",
  usernameLabel: "username_label",
  usernamePlaceholder: "username_placeholder",
  passwordLabel: "password_label",
  passwordPlaceholder: "password_placeholder",
  remember: "remember",
  forgotPassword: "forgot_password",
  showPassword: "show_password",
  hidePassword: "hide_password",
  submit: "submit",
  submitting: "submitting",
  loginFailed: "login_failed",
  loginInvalidCredentials: "login_invalid_credentials",
  loginTooManyRequests: "login_too_many_requests",
  loginServiceUnavailable: "login_service_unavailable",
  loginSessionStartFailed: "login_session_start_failed",
  loginCsrfFailed: "login_csrf_failed"
} satisfies Record<keyof PublicAuthMessages, string>;
