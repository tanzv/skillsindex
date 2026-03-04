import { createPublicPageNavigator } from "./publicPageNavigation";

export function resolveLoginHomePath(pathname: string): string {
  return createPublicPageNavigator(pathname).toPublic("/");
}
