export interface RawSessionUser {
  id: number;
  username: string;
  display_name: string;
  role: string;
  status: string;
}

export interface RawSessionContext {
  user?: RawSessionUser | null;
  marketplace_public_access?: boolean;
}

export interface SessionUser {
  id: number;
  username: string;
  displayName: string;
  role: string;
  status: string;
}

export interface SessionContext {
  user: SessionUser | null;
  marketplacePublicAccess: boolean;
}

export function normalizeSessionUser(payload: RawSessionUser | null | undefined): SessionUser | null {
  if (!payload) {
    return null;
  }

  return {
    id: payload.id,
    username: payload.username,
    displayName: payload.display_name,
    role: payload.role,
    status: payload.status
  };
}

export function normalizeSessionContext(payload: RawSessionContext | null | undefined): SessionContext {
  return {
    user: normalizeSessionUser(payload?.user),
    marketplacePublicAccess: payload?.marketplace_public_access !== false
  };
}
