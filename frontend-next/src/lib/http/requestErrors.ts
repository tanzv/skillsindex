export interface HTTPRequestError extends Error {
  code?: string;
  status?: number;
  requestId?: string;
}

interface ErrorPayload {
  code?: string;
  message: string;
  requestId?: string;
}

interface RequestErrorDisplayOptions {
  codeMessages?: Partial<Record<string, string>>;
  statusMessages?: Partial<Record<number, string>>;
  allowRawMessage?: boolean;
}

const defaultCodeMessages: Partial<Record<string, string>> = {
  backend_unreachable: "The service is temporarily unavailable. Try again shortly.",
  csrf_validation_failed: "Your session verification expired. Refresh and try again.",
  permission_denied: "You do not have permission to perform this action.",
  service_unavailable: "The service is temporarily unavailable. Try again shortly.",
  unauthorized: "Authentication is required to continue."
};

const defaultStatusMessages: Partial<Record<number, string>> = {
  400: "The request could not be completed.",
  401: "Authentication is required to continue.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource could not be found.",
  429: "Too many requests were submitted. Try again shortly.",
  503: "The service is temporarily unavailable. Try again shortly."
};

export function createRequestError(status: number, payload: ErrorPayload): HTTPRequestError {
  const error = new Error(payload.message) as HTTPRequestError;
  error.status = status;
  error.code = payload.code;
  error.requestId = payload.requestId;
  return error;
}

export async function extractErrorPayload(response: Response): Promise<ErrorPayload> {
  const responseText = await response.text();
  if (!responseText.trim()) {
    return {
      message: `HTTP ${response.status}`
    };
  }

  try {
    const payload = JSON.parse(responseText) as { message?: string; error?: string; request_id?: string };
    return {
      code: typeof payload.error === "string" && payload.error.trim() ? payload.error : undefined,
      message: payload.message || payload.error || `HTTP ${response.status}`,
      requestId: typeof payload.request_id === "string" && payload.request_id.trim() ? payload.request_id : undefined
    };
  } catch {
    return {
      message: responseText
    };
  }
}

export function resolveRequestErrorDisplayMessage(
  error: unknown,
  fallbackMessage: string,
  options: RequestErrorDisplayOptions = {}
): string {
  if (!(error instanceof Error)) {
    return fallbackMessage;
  }

  const requestError = error as HTTPRequestError;
  const code = requestError.code?.trim();
  if (code && options.codeMessages?.[code]) {
    return options.codeMessages[code] as string;
  }
  if (code && defaultCodeMessages[code]) {
    return defaultCodeMessages[code] as string;
  }

  const status = requestError.status;
  if (status && options.statusMessages?.[status]) {
    return options.statusMessages[status] as string;
  }

  if (status && defaultStatusMessages[status]) {
    return defaultStatusMessages[status] as string;
  }

  if (options.allowRawMessage) {
    const message = error.message.trim();
    if (message) {
      return message;
    }
  }

  return fallbackMessage;
}
