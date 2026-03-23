export interface PublicLoadFailure {
  ok: false;
  errorMessage: string;
}

export function resolvePublicLoadErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error) {
    const message = error.message.trim();
    return message || fallbackMessage;
  }

  if (typeof error === "string") {
    const message = error.trim();
    return message || fallbackMessage;
  }

  return fallbackMessage;
}
