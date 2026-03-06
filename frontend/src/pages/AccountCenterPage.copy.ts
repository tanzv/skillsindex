import type { AppLocale } from "../lib/i18n";

export interface AccountCenterCopy {
  title: string;
  subtitle: string;
  profileTab: string;
  securityTab: string;
  sessionsTab: string;
  refresh: string;
  loading: string;
  profileWorkspace: string;
  profileHint: string;
  profilePreview: string;
  displayName: string;
  avatarURL: string;
  bio: string;
  editProfile: string;
  editProfileModalTitle: string;
  saveProfile: string;
  cancel: string;
  invalidAvatarURL: string;
  displayNameTooLong: string;
  bioTooLong: string;
  securityWorkspace: string;
  securityHint: string;
  currentPassword: string;
  newPassword: string;
  revokeOthers: string;
  noRevoke: string;
  applyPassword: string;
  sessionsWorkspace: string;
  sessionsHint: string;
  current: string;
  revoke: string;
  revokeOthersNow: string;
  accountSignals: string;
  role: string;
  status: string;
  activeSessions: string;
  sessionTTL: string;
  profileCompleteness: string;
  quickActions: string;
  openMarketplace: string;
  openAdmin: string;
  signOutHint: string;
  saveSuccess: string;
  updateFailed: string;
  passwordSuccess: string;
  revokedSuccess: string;
  never: string;
  createdAt: string;
  expiresAt: string;
  userAgent: string;
  issuedIP: string;
}

const enCopy: AccountCenterCopy = {
  title: "Account Center",
  subtitle: "Profile, credential security, and active session governance.",
  profileTab: "Profile",
  securityTab: "Security",
  sessionsTab: "Sessions",
  refresh: "Refresh",
  loading: "Loading account workspace",
  profileWorkspace: "Profile Workspace",
  profileHint: "Update identity metadata used across internal skill workflows.",
  profilePreview: "Profile Preview",
  displayName: "Display Name",
  avatarURL: "Avatar URL",
  bio: "Bio",
  editProfile: "Edit Profile",
  editProfileModalTitle: "Edit Personal Information",
  saveProfile: "Save Profile",
  cancel: "Cancel",
  invalidAvatarURL: "Avatar URL must be a valid http or https URL.",
  displayNameTooLong: "Display name must be 64 characters or fewer.",
  bioTooLong: "Bio must be 500 characters or fewer.",
  securityWorkspace: "Credential Security",
  securityHint: "Rotate your password and optionally revoke every other active session.",
  currentPassword: "Current Password",
  newPassword: "New Password",
  revokeOthers: "Revoke other sessions",
  noRevoke: "Keep other sessions",
  applyPassword: "Apply Password",
  sessionsWorkspace: "Active Sessions",
  sessionsHint: "Review session devices and revoke suspicious access immediately.",
  current: "Current",
  revoke: "Revoke",
  revokeOthersNow: "Revoke Others",
  accountSignals: "Account Signals",
  role: "Role",
  status: "Status",
  activeSessions: "Active Sessions",
  sessionTTL: "Session TTL",
  profileCompleteness: "Profile Completeness",
  quickActions: "Quick Actions",
  openMarketplace: "Open Marketplace",
  openAdmin: "Open Admin",
  signOutHint: "Use sidebar sign-out for full logout.",
  saveSuccess: "Saved successfully",
  updateFailed: "Request failed",
  passwordSuccess: "Password updated",
  revokedSuccess: "Session revoked",
  never: "n/a",
  createdAt: "Issued",
  expiresAt: "Expires",
  userAgent: "User Agent",
  issuedIP: "IP"
};

const zhCopy: AccountCenterCopy = {
  ...enCopy,
  title: "\u8d26\u53f7\u4e2d\u5fc3",
  subtitle: "\u4e2a\u4eba\u8d44\u6599\u3001\u5bc6\u7801\u5b89\u5168\u4e0e\u4f1a\u8bdd\u7ba1\u7406\u4e00\u4f53\u5316\u64cd\u4f5c\u3002",
  profileTab: "\u8d44\u6599",
  securityTab: "\u5b89\u5168",
  sessionsTab: "\u4f1a\u8bdd",
  refresh: "\u5237\u65b0",
  loading: "\u6b63\u5728\u52a0\u8f7d\u8d26\u53f7\u5de5\u4f5c\u53f0",
  profileWorkspace: "\u8d44\u6599\u7ef4\u62a4",
  profileHint: "\u66f4\u65b0\u7528\u4e8e\u6280\u80fd\u534f\u4f5c\u7684\u8eab\u4efd\u4fe1\u606f\u3002",
  profilePreview: "\u4e2a\u4eba\u8d44\u6599\u9884\u89c8",
  displayName: "\u663e\u793a\u540d",
  avatarURL: "\u5934\u50cf\u94fe\u63a5",
  bio: "\u4e2a\u4eba\u7b80\u4ecb",
  editProfile: "\u7f16\u8f91\u4e2a\u4eba\u4fe1\u606f",
  editProfileModalTitle: "\u7f16\u8f91\u4e2a\u4eba\u4fe1\u606f",
  saveProfile: "\u4fdd\u5b58\u8d44\u6599",
  cancel: "\u53d6\u6d88",
  invalidAvatarURL: "\u5934\u50cf\u94fe\u63a5\u5fc5\u987b\u662f\u6709\u6548\u7684 http \u6216 https \u5730\u5740\u3002",
  displayNameTooLong: "\u663e\u793a\u540d\u4e0d\u80fd\u8d85\u8fc7 64 \u4e2a\u5b57\u7b26\u3002",
  bioTooLong: "\u4e2a\u4eba\u7b80\u4ecb\u4e0d\u80fd\u8d85\u8fc7 500 \u4e2a\u5b57\u7b26\u3002",
  securityWorkspace: "\u5bc6\u7801\u5b89\u5168",
  securityHint: "\u66f4\u65b0\u5bc6\u7801\u5e76\u53ef\u9009\u540c\u6b65\u6e05\u9000\u5176\u4ed6\u4f1a\u8bdd\u3002",
  currentPassword: "\u5f53\u524d\u5bc6\u7801",
  newPassword: "\u65b0\u5bc6\u7801",
  revokeOthers: "\u6e05\u9000\u5176\u4ed6\u4f1a\u8bdd",
  noRevoke: "\u4fdd\u7559\u5176\u4ed6\u4f1a\u8bdd",
  applyPassword: "\u5e94\u7528\u5bc6\u7801",
  sessionsWorkspace: "\u6d3b\u8dc3\u4f1a\u8bdd",
  sessionsHint: "\u68c0\u67e5\u8bbe\u5907\u767b\u5f55\u60c5\u51b5\uff0c\u5bf9\u53ef\u7591\u4f1a\u8bdd\u7acb\u5373\u64a4\u9500\u3002",
  current: "\u5f53\u524d",
  revoke: "\u64a4\u9500",
  revokeOthersNow: "\u64a4\u9500\u5176\u4ed6\u4f1a\u8bdd",
  accountSignals: "\u8d26\u53f7\u4fe1\u53f7",
  role: "\u89d2\u8272",
  status: "\u72b6\u6001",
  activeSessions: "\u6d3b\u8dc3\u4f1a\u8bdd",
  sessionTTL: "\u4f1a\u8bdd\u8fc7\u671f",
  profileCompleteness: "\u8d44\u6599\u5b8c\u6574\u5ea6",
  quickActions: "\u5feb\u6377\u64cd\u4f5c",
  openMarketplace: "\u6253\u5f00\u5e02\u573a",
  openAdmin: "\u6253\u5f00\u7ba1\u7406\u53f0",
  signOutHint: "\u9700\u8981\u5b8c\u6574\u9000\u51fa\u8bf7\u4f7f\u7528\u5de6\u4fa7\u8fb9\u680f\u7684\u9000\u51fa\u6309\u94ae\u3002",
  saveSuccess: "\u4fdd\u5b58\u6210\u529f",
  updateFailed: "\u8bf7\u6c42\u5931\u8d25",
  passwordSuccess: "\u5bc6\u7801\u5df2\u66f4\u65b0",
  revokedSuccess: "\u4f1a\u8bdd\u5df2\u64a4\u9500",
  never: "\u6682\u65e0",
  createdAt: "\u7b7e\u53d1\u65f6\u95f4",
  expiresAt: "\u8fc7\u671f\u65f6\u95f4",
  userAgent: "\u5ba2\u6237\u7aef",
  issuedIP: "IP"
};

export function getAccountCenterCopy(locale: AppLocale): AccountCenterCopy {
  return locale === "zh" ? zhCopy : enCopy;
}
