export interface AdminCommonMessages {
  adminEyebrow: string;
  refresh: string;
  refreshing: string;
  clear: string;
}

export const adminCommonMessageKeyMap = {
  adminEyebrow: "admin_common_admin_eyebrow",
  refresh: "admin_common_refresh",
  refreshing: "admin_common_refreshing",
  clear: "admin_common_clear"
} as const satisfies { [K in keyof AdminCommonMessages]: string };
