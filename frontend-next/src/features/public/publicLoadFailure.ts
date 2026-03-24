import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";

export interface PublicLoadFailure {
  ok: false;
  errorMessage: string;
}

export function resolvePublicLoadErrorMessage(error: unknown, fallbackMessage: string): string {
  return resolveRequestErrorDisplayMessage(error, fallbackMessage);
}
