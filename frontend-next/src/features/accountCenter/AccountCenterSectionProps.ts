import type {
  AccountAPIKeyCreateDraft,
  AccountAPIKeysPayload,
  AccountProfileDraft,
  AccountSessionsPayload
} from "./model";

export interface AccountProfileSectionProps {
  loading: boolean;
  saving: boolean;
  avatarInitials: string;
  profileDraft: AccountProfileDraft;
  onProfileDraftChange: (patch: Partial<AccountProfileDraft>) => void;
  onSaveProfile: () => void;
}

export interface AccountSecuritySectionProps {
  loading: boolean;
  saving: boolean;
  passwordDraft: {
    currentPassword: string;
    newPassword: string;
    revokeOthers: boolean;
  };
  sessionsPayload: AccountSessionsPayload | null;
  onPasswordDraftChange: (patch: Partial<AccountSecuritySectionProps["passwordDraft"]>) => void;
  onChangePassword: () => void;
  onRevokeOtherSessions: () => void;
}

export interface AccountSessionsSectionProps {
  loading: boolean;
  saving: boolean;
  sessionsPayload: AccountSessionsPayload | null;
  onRevokeSession: (sessionId: string) => void;
}

export interface AccountCredentialsSectionProps {
  loading: boolean;
  saving: boolean;
  credentialDraft: AccountAPIKeyCreateDraft;
  credentialScopeDrafts: Record<number, string[]>;
  credentialsPayload: AccountAPIKeysPayload | null;
  onCredentialDraftChange: (patch: Partial<AccountAPIKeyCreateDraft>) => void;
  onCredentialScopeDraftChange: (keyId: number, rawValue: string) => void;
  onCreateCredential: () => Promise<boolean>;
  onRotateCredential: (keyId: number) => void;
  onRevokeCredential: (keyId: number) => void;
  onApplyCredentialScopes: (keyId: number) => void;
}

export function joinScopes(value: string[]) {
  return value.join(", ");
}
