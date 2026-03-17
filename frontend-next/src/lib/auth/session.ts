import { headers } from "next/headers";

import { serverFetchJSON } from "../http/serverFetch";
import { normalizeSessionContext, type RawSessionContext, type SessionContext, type SessionUser } from "../schemas/session";

export function resolveSessionContext(payload: RawSessionContext | null | undefined): SessionContext {
  return normalizeSessionContext(payload);
}

export function isAuthenticatedSession(context: SessionContext): context is SessionContext & { user: SessionUser } {
  return context.user !== null;
}

export function requireAuthenticatedSession(context: SessionContext): SessionUser {
  if (!context.user) {
    throw new Error("Authentication is required");
  }

  return context.user;
}

export async function getServerSessionContext(): Promise<SessionContext> {
  try {
    const requestHeaders = new Headers(await headers());
    const payload = await serverFetchJSON<RawSessionContext>("/api/v1/auth/me", {
      requestHeaders
    });

    return normalizeSessionContext(payload);
  } catch {
    return normalizeSessionContext(null);
  }
}
