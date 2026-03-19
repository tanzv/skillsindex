import type { AdminAccessMessages } from "@/src/lib/i18n/protectedPageMessages.access";
import type { AdminAccountsMessages } from "@/src/lib/i18n/protectedPageMessages.accounts";

export interface AccountDisplayMessages {
  valueUnknownUser: string;
  statusLabelActive: string;
  statusLabelDisabled: string;
  statusLabelUnknown: string;
  roleLabelSuperAdmin: string;
  roleLabelAdmin: string;
  roleLabelAuditor: string;
  roleLabelMember: string;
  roleLabelViewer: string;
  roleLabelUnknown: string;
}

export type AccountsDisplayMessages = Pick<
  AdminAccountsMessages,
  | "valueUnknownUser"
  | "statusLabelActive"
  | "statusLabelDisabled"
  | "statusLabelUnknown"
  | "roleLabelSuperAdmin"
  | "roleLabelAdmin"
  | "roleLabelAuditor"
  | "roleLabelMember"
  | "roleLabelViewer"
  | "roleLabelUnknown"
>;

export type AccessDisplayMessages = Pick<
  AdminAccessMessages,
  | "valueUnknownUser"
  | "statusLabelActive"
  | "statusLabelDisabled"
  | "statusLabelUnknown"
  | "roleLabelSuperAdmin"
  | "roleLabelAdmin"
  | "roleLabelAuditor"
  | "roleLabelMember"
  | "roleLabelViewer"
  | "roleLabelUnknown"
>;

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveAccountUsernameLabel(username: string, messages: AccountDisplayMessages): string {
  const normalized = normalizeValue(username);

  if (!normalized || normalized === "unknown") {
    return messages.valueUnknownUser;
  }

  return username.trim();
}

export function resolveAccountStatusLabel(status: string, messages: AccountDisplayMessages): string {
  const normalized = normalizeValue(status);

  if (!normalized || normalized === "unknown") {
    return messages.statusLabelUnknown;
  }
  if (normalized === "active") {
    return messages.statusLabelActive;
  }
  if (normalized === "disabled") {
    return messages.statusLabelDisabled;
  }

  return status.trim();
}

export function resolveAccountRoleLabel(role: string, messages: AccountDisplayMessages): string {
  const normalized = normalizeValue(role);

  if (!normalized || normalized === "unknown") {
    return messages.roleLabelUnknown;
  }
  if (normalized === "super_admin") {
    return messages.roleLabelSuperAdmin;
  }
  if (normalized === "admin") {
    return messages.roleLabelAdmin;
  }
  if (normalized === "auditor") {
    return messages.roleLabelAuditor;
  }
  if (normalized === "member") {
    return messages.roleLabelMember;
  }
  if (normalized === "viewer") {
    return messages.roleLabelViewer;
  }

  return role.trim();
}
