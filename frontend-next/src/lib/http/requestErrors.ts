export interface HTTPRequestError extends Error {
  code?: string;
  status?: number;
}

interface ErrorPayload {
  code?: string;
  message: string;
}

export function createRequestError(status: number, payload: ErrorPayload): HTTPRequestError {
  const error = new Error(payload.message) as HTTPRequestError;
  error.status = status;
  error.code = payload.code;
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
    const payload = JSON.parse(responseText) as { message?: string; error?: string };
    return {
      code: typeof payload.error === "string" && payload.error.trim() ? payload.error : undefined,
      message: payload.message || payload.error || `HTTP ${response.status}`
    };
  } catch {
    return {
      message: responseText
    };
  }
}
