import { redirect } from "next/navigation";

import { buildLoginRedirectPath } from "./loginPaths";
import type { SessionContext } from "../schemas/session";

export { buildLoginRedirectPath } from "./loginPaths";

export function requireRouteSession(context: SessionContext, targetPath: string): void {
  if (!context.user) {
    redirect(buildLoginRedirectPath(targetPath));
  }
}
