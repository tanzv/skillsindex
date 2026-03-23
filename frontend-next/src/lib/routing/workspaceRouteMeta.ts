import type { WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";
import { workspaceMessageFallbacks } from "@/src/lib/i18n/protectedPageMessages.workspace";
import {
  workspaceActionsRoute,
  workspaceActivityRoute,
  workspaceOverviewRoute,
  workspacePolicyRoute,
  workspaceQueueRoute,
  workspaceRunbookRoute
} from "@/src/lib/routing/protectedSurfaceLinks";
import { workspaceRoutes, type WorkspaceRoute } from "@/src/lib/routing/routes";

export interface WorkspaceRouteMeta {
  title: string;
  description: string;
}

export type WorkspaceRouteMarketplaceQuery = Record<string, string>;

type WorkspaceRouteMetaMessages = Pick<
  WorkspaceMessages,
  | "routeOverviewTitle"
  | "routeOverviewDescription"
  | "routeActivityTitle"
  | "routeActivityDescription"
  | "routeQueueTitle"
  | "routeQueueDescription"
  | "routePolicyTitle"
  | "routePolicyDescription"
  | "routeRunbookTitle"
  | "routeRunbookDescription"
  | "routeActionsTitle"
  | "routeActionsDescription"
>;

type WorkspaceRouteNavigationMessages = Pick<
  WorkspaceMessages,
  | "navOverviewLabel"
  | "navOverviewDescription"
  | "navActivityLabel"
  | "navActivityDescription"
  | "navQueueLabel"
  | "navQueueDescription"
  | "navPolicyLabel"
  | "navPolicyDescription"
  | "navRunbookLabel"
  | "navRunbookDescription"
  | "navActionsLabel"
  | "navActionsDescription"
>;

interface WorkspaceRouteDescriptor {
  route: WorkspaceRoute;
  marketplaceQuery: WorkspaceRouteMarketplaceQuery;
  resolveMeta: (messages: WorkspaceRouteMetaMessages) => WorkspaceRouteMeta;
  resolveNavigationLabel: (messages: WorkspaceRouteNavigationMessages) => string;
  resolveNavigationDescription: (messages: WorkspaceRouteNavigationMessages) => string;
}

const workspaceRouteDescriptors = [
  {
    route: workspaceOverviewRoute,
    marketplaceQuery: {
      sort: "recent",
      page: "1",
      page_size: "12"
    },
    resolveMeta: (messages) => ({
      title: messages.routeOverviewTitle,
      description: messages.routeOverviewDescription
    }),
    resolveNavigationLabel: (messages) => messages.navOverviewLabel,
    resolveNavigationDescription: (messages) => messages.navOverviewDescription
  },
  {
    route: workspaceActivityRoute,
    marketplaceQuery: {
      sort: "recent",
      page: "1",
      page_size: "8"
    },
    resolveMeta: (messages) => ({
      title: messages.routeActivityTitle,
      description: messages.routeActivityDescription
    }),
    resolveNavigationLabel: (messages) => messages.navActivityLabel,
    resolveNavigationDescription: (messages) => messages.navActivityDescription
  },
  {
    route: workspaceQueueRoute,
    marketplaceQuery: {
      sort: "recent",
      page: "1",
      page_size: "12"
    },
    resolveMeta: (messages) => ({
      title: messages.routeQueueTitle,
      description: messages.routeQueueDescription
    }),
    resolveNavigationLabel: (messages) => messages.navQueueLabel,
    resolveNavigationDescription: (messages) => messages.navQueueDescription
  },
  {
    route: workspacePolicyRoute,
    marketplaceQuery: {
      sort: "quality",
      page: "1",
      page_size: "10"
    },
    resolveMeta: (messages) => ({
      title: messages.routePolicyTitle,
      description: messages.routePolicyDescription
    }),
    resolveNavigationLabel: (messages) => messages.navPolicyLabel,
    resolveNavigationDescription: (messages) => messages.navPolicyDescription
  },
  {
    route: workspaceRunbookRoute,
    marketplaceQuery: {
      sort: "quality",
      page: "1",
      page_size: "8"
    },
    resolveMeta: (messages) => ({
      title: messages.routeRunbookTitle,
      description: messages.routeRunbookDescription
    }),
    resolveNavigationLabel: (messages) => messages.navRunbookLabel,
    resolveNavigationDescription: (messages) => messages.navRunbookDescription
  },
  {
    route: workspaceActionsRoute,
    marketplaceQuery: {
      sort: "recent",
      page: "1",
      page_size: "6"
    },
    resolveMeta: (messages) => ({
      title: messages.routeActionsTitle,
      description: messages.routeActionsDescription
    }),
    resolveNavigationLabel: (messages) => messages.navActionsLabel,
    resolveNavigationDescription: (messages) => messages.navActionsDescription
  }
] as const satisfies readonly WorkspaceRouteDescriptor[];

function buildWorkspaceRouteRecord<Value>(
  resolveValue: (descriptor: WorkspaceRouteDescriptor) => Value
): Record<WorkspaceRoute, Value> {
  return Object.fromEntries(
    workspaceRouteDescriptors.map((descriptor) => [descriptor.route, resolveValue(descriptor)])
  ) as Record<WorkspaceRoute, Value>;
}

const workspaceRouteDescriptorByRoute = buildWorkspaceRouteRecord((descriptor) => descriptor);
const workspaceRouteLookup = new Set<string>(workspaceRoutes);

export function isWorkspaceRoute(pathname: string): pathname is WorkspaceRoute {
  return workspaceRouteLookup.has(pathname);
}

export function resolveWorkspaceRoute(pathname: string): WorkspaceRoute {
  return isWorkspaceRoute(pathname) ? pathname : workspaceOverviewRoute;
}

export function listWorkspaceRouteEntries(): WorkspaceRoute[] {
  return workspaceRouteDescriptors.map((descriptor) => descriptor.route);
}

export function resolveWorkspaceRouteMeta(
  route: WorkspaceRoute,
  messages: WorkspaceRouteMetaMessages
): WorkspaceRouteMeta {
  return workspaceRouteDescriptorByRoute[route].resolveMeta(messages);
}

export function buildWorkspaceRouteMeta(messages: WorkspaceMessages): Record<WorkspaceRoute, WorkspaceRouteMeta> {
  return buildWorkspaceRouteRecord((descriptor) => descriptor.resolveMeta(messages));
}

export function resolveWorkspaceNavigationLabel(
  route: WorkspaceRoute,
  messages: WorkspaceRouteNavigationMessages
): string {
  return workspaceRouteDescriptorByRoute[route].resolveNavigationLabel(messages);
}

export function resolveWorkspaceNavigationDescription(
  route: WorkspaceRoute,
  messages: WorkspaceRouteNavigationMessages
): string {
  return workspaceRouteDescriptorByRoute[route].resolveNavigationDescription(messages);
}

export function resolveWorkspaceMarketplaceQuery(
  route: WorkspaceRoute
): WorkspaceRouteMarketplaceQuery {
  return { ...workspaceRouteDescriptorByRoute[route].marketplaceQuery };
}

export const workspaceRouteMeta = buildWorkspaceRouteMeta(workspaceMessageFallbacks);
