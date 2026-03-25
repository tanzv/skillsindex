import {
  createRequestError,
  extractErrorPayload,
  resolveRequestErrorDisplayMessage
} from "@/src/lib/http/requestErrors";

interface PerformAccountMenuSignOutOptions {
  fetchImpl?: typeof fetch;
  logoutErrorMessage: string;
}

type AccountMenuSignOutResult =
  | { ok: true }
  | { ok: false; errorMessage: string };

export async function performAccountMenuSignOut({
  fetchImpl = fetch,
  logoutErrorMessage
}: PerformAccountMenuSignOutOptions): Promise<AccountMenuSignOutResult> {
  try {
    const response = await fetchImpl("/api/bff/auth/logout", {
      method: "POST",
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) {
      throw createRequestError(response.status, await extractErrorPayload(response));
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      errorMessage: resolveRequestErrorDisplayMessage(error, logoutErrorMessage)
    };
  }
}
