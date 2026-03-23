type PublicFallbackContextValue = string | number | boolean | null | undefined;

type PublicFallbackContext = Record<string, PublicFallbackContextValue>;

interface PublicFallbackLogPayload {
  message: string;
  name: string;
  context: Record<string, Exclude<PublicFallbackContextValue, undefined>>;
}

function normalizePublicFallbackError(error: unknown): Pick<PublicFallbackLogPayload, "message" | "name"> {
  if (error instanceof Error) {
    const message = error.message.trim();
    return {
      message: message || "Unknown error",
      name: error.name || "Error"
    };
  }

  if (typeof error === "string") {
    const message = error.trim();
    return {
      message: message || "Unknown error",
      name: "UnknownError"
    };
  }

  return {
    message: "Unknown error",
    name: "UnknownError"
  };
}

function normalizePublicFallbackContext(
  context: PublicFallbackContext
): Record<string, Exclude<PublicFallbackContextValue, undefined>> {
  return Object.fromEntries(
    Object.entries(context).filter(([, value]) => typeof value !== "undefined")
  ) as Record<string, Exclude<PublicFallbackContextValue, undefined>>;
}

export function reportPublicFallbackError(
  scope: string,
  error: unknown,
  context: PublicFallbackContext = {}
) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.warn(`[public-fallback] ${scope}`, {
    ...normalizePublicFallbackError(error),
    context: normalizePublicFallbackContext(context)
  });
}
