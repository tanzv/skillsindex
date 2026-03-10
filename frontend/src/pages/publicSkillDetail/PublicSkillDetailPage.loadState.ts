export type SkillDetailLoadStatus = "loading" | "ready" | "not_found" | "error";

export interface SkillDetailLoadFailure {
  status: "not_found" | "error";
  message: string;
}

const notFoundErrorPatterns: RegExp[] = [/skill_not_found/i, /\bnot found\b/i, /\b404\b/i];

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return String(error.message || "").trim();
  }
  return String(error || "").trim();
}

export function isSkillDetailNotFoundError(error: unknown): boolean {
  const message = toErrorMessage(error);
  if (!message) {
    return false;
  }
  return notFoundErrorPatterns.some((pattern) => pattern.test(message));
}

export function resolveSkillDetailLoadFailure(error: unknown, fallbackMessage: string): SkillDetailLoadFailure {
  const normalizedMessage = toErrorMessage(error);
  const resolvedMessage = normalizedMessage || fallbackMessage;
  if (isSkillDetailNotFoundError(error)) {
    return {
      status: "not_found",
      message: resolvedMessage
    };
  }
  return {
    status: "error",
    message: resolvedMessage
  };
}
