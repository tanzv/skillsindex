import { describe, expect, it } from "vitest";

import { resolveLoginErrorMessage } from "@/src/features/auth/loginErrorMessage";
import type { HTTPRequestError } from "@/src/lib/http/requestErrors";
import type { PublicAuthMessages } from "@/src/lib/i18n/publicAuthMessages";

const zhMessages: PublicAuthMessages = {
  themeSwitchAriaLabel: "主题切换",
  themeDarkAriaLabel: "切换为深色主题",
  themeLightAriaLabel: "切换为浅色主题",
  localeSwitchAriaLabel: "语言切换",
  localeEnAriaLabel: "切换为英文",
  localeZhAriaLabel: "切换为中文",
  brandText: "技能索引",
  heading: "账户登录",
  note: "请选择企业身份登录，或使用工作区账号凭据继续。",
  divider: "使用工作区账号凭据",
  usernameLabel: "用户名",
  usernamePlaceholder: "you@company.com",
  passwordLabel: "密码",
  passwordPlaceholder: "••••••••",
  remember: "记住我",
  forgotPassword: "忘记？",
  showPassword: "显示密码",
  hidePassword: "隐藏密码",
  submit: "登录",
  submitting: "登录中...",
  loginFailed: "登录失败。",
  loginInvalidCredentials: "用户名或密码错误。",
  loginTooManyRequests: "登录尝试次数过多，请稍后再试。",
  loginServiceUnavailable: "登录服务暂时不可用，请稍后再试。",
  loginSessionStartFailed: "登录成功后启动会话失败，请重试。",
  loginCsrfFailed: "登录校验初始化失败，请刷新页面后重试。"
};

function buildRequestError(code?: string): HTTPRequestError {
  const error = new Error("English backend message") as HTTPRequestError;
  error.status = 401;
  error.code = code;
  return error;
}

describe("resolveLoginErrorMessage", () => {
  it("maps invalid credential errors to localized copy", () => {
    expect(resolveLoginErrorMessage(buildRequestError("unauthorized"), zhMessages)).toBe(
      zhMessages.loginInvalidCredentials
    );
    expect(resolveLoginErrorMessage(buildRequestError("invalid_credentials"), zhMessages)).toBe(
      zhMessages.loginInvalidCredentials
    );
  });

  it("maps csrf bootstrap failures to localized copy", () => {
    expect(resolveLoginErrorMessage(buildRequestError("csrf_token_failed"), zhMessages)).toBe(
      zhMessages.loginCsrfFailed
    );
  });

  it("maps backend connectivity failures to the localized service unavailable copy", () => {
    expect(resolveLoginErrorMessage(buildRequestError("backend_unreachable"), zhMessages)).toBe(
      zhMessages.loginServiceUnavailable
    );
  });

  it("falls back to the generic localized failure copy for unknown errors", () => {
    expect(resolveLoginErrorMessage(buildRequestError("unknown_error"), zhMessages)).toBe(zhMessages.loginFailed);
    expect(resolveLoginErrorMessage(new Error("Network request failed"), zhMessages)).toBe(zhMessages.loginFailed);
  });
});
