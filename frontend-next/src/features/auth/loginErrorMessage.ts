import type { HTTPRequestError } from "@/src/lib/http/requestErrors";
import type { PublicAuthMessages } from "@/src/lib/i18n/publicAuthMessages";

const loginErrorMessageKeys = {
  csrf_token_failed: "loginCsrfFailed",
  invalid_credentials: "loginInvalidCredentials",
  service_unavailable: "loginServiceUnavailable",
  session_start_failed: "loginSessionStartFailed",
  too_many_requests: "loginTooManyRequests",
  unauthorized: "loginInvalidCredentials"
} satisfies Partial<Record<string, keyof PublicAuthMessages>>;

function resolveLoginMessageKey(code: string | undefined): keyof PublicAuthMessages | undefined {
  if (!code || !(code in loginErrorMessageKeys)) {
    return undefined;
  }

  return loginErrorMessageKeys[code as keyof typeof loginErrorMessageKeys];
}

export function resolveLoginErrorMessage(error: unknown, messages: PublicAuthMessages): string {
  if (!(error instanceof Error)) {
    return messages.loginFailed;
  }

  const requestError = error as HTTPRequestError;
  const messageKey = resolveLoginMessageKey(requestError.code);
  if (messageKey) {
    return messages[messageKey];
  }

  return messages.loginFailed;
}
