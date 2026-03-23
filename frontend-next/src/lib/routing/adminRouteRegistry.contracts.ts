import type { AdminNavigationMessages } from "@/src/lib/i18n/protectedMessages";

export type AdminRouteGroupId = "overview" | "catalog" | "operations" | "users" | "security";

export type AdminRouteLabelResolver = (messages: AdminNavigationMessages) => string;

export type AdminRouteRenderTarget =
  | "overview"
  | "ingestion"
  | "catalog"
  | "integrations"
  | "organizations"
  | "moderation"
  | "access"
  | "accounts"
  | "apikeys"
  | "ops-dashboard"
  | "ops-records"
  | "workbench";

export interface AdminRouteDescriptorDefinition {
  path: string;
  groupId: AdminRouteGroupId;
  label: AdminRouteLabelResolver;
  description: AdminRouteLabelResolver;
  renderTarget: AdminRouteRenderTarget;
  endpoint?: string;
  quickLink?: boolean;
  hiddenFromNavigation?: boolean;
}

export interface AdminRouteDefinition {
  path: string;
  groupId: AdminRouteGroupId;
  renderTarget: AdminRouteRenderTarget;
  endpoint?: string;
  quickLink: boolean;
  hiddenFromNavigation: boolean;
}

export interface AdminRouteDescriptor {
  path: string;
  groupId: AdminRouteGroupId;
  label: string;
  description: string;
  renderTarget: AdminRouteRenderTarget;
  endpoint?: string;
  quickLink: boolean;
  hiddenFromNavigation: boolean;
}

export interface AdminRouteGroupDefinition {
  id: AdminRouteGroupId;
  label: AdminRouteLabelResolver;
}
