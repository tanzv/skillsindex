import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";

export function resolveLoginHomePath(pathname: string): string {
  return createPublicPageNavigator(pathname).toPublic("/");
}
