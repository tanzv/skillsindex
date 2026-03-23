import "server-only";

import type { SessionContext } from "@/src/lib/schemas/session";
import { getServerSessionContext } from "@/src/lib/auth/session";

export async function loadProtectedRouteSession(): Promise<SessionContext> {
  return getServerSessionContext();
}
