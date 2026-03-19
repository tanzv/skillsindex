import type { AccountCenterMessages } from "@/src/lib/i18n/protectedPageMessages.accountCenter";
import type { AdminApiKeysMessages } from "@/src/lib/i18n/protectedPageMessages.apikeys";

export interface ApiKeyDisplayMessages {
  statusLabelActive: string;
  statusLabelRevoked: string;
  statusLabelExpired: string;
  statusLabelUnknown: string;
}

export type AccountCenterApiKeyDisplayMessages = Pick<
  AccountCenterMessages,
  "statusLabelActive" | "statusLabelRevoked" | "statusLabelExpired" | "statusLabelUnknown"
>;

export type AdminApiKeyDisplayMessages = Pick<
  AdminApiKeysMessages,
  "statusLabelActive" | "statusLabelRevoked" | "statusLabelExpired" | "statusLabelUnknown"
>;

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveApiKeyStatusLabel(status: string, messages: ApiKeyDisplayMessages): string {
  const normalized = normalizeValue(status);

  if (!normalized || normalized === "unknown") {
    return messages.statusLabelUnknown;
  }
  if (normalized === "active") {
    return messages.statusLabelActive;
  }
  if (normalized === "revoked") {
    return messages.statusLabelRevoked;
  }
  if (normalized === "expired") {
    return messages.statusLabelExpired;
  }

  return status.trim();
}

export function resolveApiKeyStatusTone(status: string): "default" | "soft" | "outline" {
  const normalized = normalizeValue(status);

  if (normalized === "active") {
    return "soft";
  }
  if (normalized === "expired") {
    return "default";
  }

  return "outline";
}
