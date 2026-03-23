export { accountWorkbenchDefinitions } from "./accountDefinitions";
import { adminRenderableWorkbenchRoutePaths } from "@/src/lib/routing/adminRouteRegistry";

import { adminWorkbenchDefinitions } from "./adminDefinitions";
import type { WorkbenchDefinition } from "./types";

export { adminWorkbenchDefinitions };

export interface AdminWorkbenchRouteContract {
  route: string;
  renderMode: "page" | "definition-only";
  definition: WorkbenchDefinition;
}

const renderableAdminWorkbenchRouteLookup = new Set<string>(adminRenderableWorkbenchRoutePaths);

function resolveAdminWorkbenchRenderMode(route: string): AdminWorkbenchRouteContract["renderMode"] {
  return renderableAdminWorkbenchRouteLookup.has(route) ? "page" : "definition-only";
}

export function listAdminWorkbenchRouteContracts(): AdminWorkbenchRouteContract[] {
  return Object.entries(adminWorkbenchDefinitions)
    .map(([route, definition]) => ({
      route,
      renderMode: resolveAdminWorkbenchRenderMode(route),
      definition
    }))
    .sort((left, right) => left.route.localeCompare(right.route));
}

export function resolveAdminWorkbenchRouteContract(route: string): AdminWorkbenchRouteContract | null {
  const definition = adminWorkbenchDefinitions[route];
  if (!definition) {
    return null;
  }

  return {
    route,
    renderMode: resolveAdminWorkbenchRenderMode(route),
    definition
  };
}

export function resolveAdminWorkbenchDefinition(route: string) {
  return resolveAdminWorkbenchRouteContract(route)?.definition || null;
}

export function resolveAdminRenderableWorkbenchDefinition(route: string) {
  const contract = resolveAdminWorkbenchRouteContract(route);
  if (!contract || contract.renderMode !== "page") {
    return null;
  }

  return contract.definition;
}
