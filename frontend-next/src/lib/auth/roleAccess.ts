import type { SessionContext } from "../schemas/session";

export function normalizeSessionRole(role: string | null | undefined): string {
  return String(role || "").trim().toLowerCase();
}

export function canAccessProtectedConsole(context: SessionContext): boolean {
  const normalizedRole = normalizeSessionRole(context.user?.role);
  return normalizedRole === "member" || normalizedRole === "admin" || normalizedRole === "super_admin";
}

export function canViewAllAdminData(context: SessionContext): boolean {
  const normalizedRole = normalizeSessionRole(context.user?.role);
  return normalizedRole === "admin" || normalizedRole === "super_admin";
}

export function canManagePlatformUsers(context: SessionContext): boolean {
  return normalizeSessionRole(context.user?.role) === "super_admin";
}
