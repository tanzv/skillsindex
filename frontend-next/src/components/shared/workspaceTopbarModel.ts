import { protectedTopbarMessageFallbacks } from "@/src/lib/i18n/protectedMessages";
import { workspaceMessageFallbacks, type WorkspaceMessages } from "@/src/lib/i18n/protectedPageMessages.workspace";

import {
  buildProtectedTopbarEntries,
  buildProtectedTopbarModel,
  resolveProtectedPrimaryShellWidth,
  resolveProtectedResponsivePrimaryVisibleCount,
  type ProtectedTopbarEntry,
  type ProtectedTopbarModel
} from "./protectedTopbarModel";
import { buildWorkspaceProtectedTopbarConfig } from "./protectedTopbarConfigs";

export type WorkspaceTopbarEntry = ProtectedTopbarEntry;
export type WorkspaceTopbarModel = ProtectedTopbarModel;

export function resolveWorkspacePrimaryShellWidth(viewportWidth: number | null | undefined): number | null {
  return resolveProtectedPrimaryShellWidth(viewportWidth);
}

export function resolveWorkspaceResponsivePrimaryVisibleCount(shellWidth: number | null | undefined): number {
  return resolveProtectedResponsivePrimaryVisibleCount(shellWidth);
}

export function buildWorkspaceTopbarEntries(pathname: string, messages: WorkspaceMessages = workspaceMessageFallbacks): WorkspaceTopbarEntry[] {
  return buildProtectedTopbarEntries(pathname, buildWorkspaceProtectedTopbarConfig(messages, protectedTopbarMessageFallbacks));
}

export function buildWorkspaceTopbarModel(
  pathname: string,
  maxVisibleCount?: number,
  messages: WorkspaceMessages = workspaceMessageFallbacks
): WorkspaceTopbarModel {
  return buildProtectedTopbarModel(
    pathname,
    buildWorkspaceProtectedTopbarConfig(messages, protectedTopbarMessageFallbacks),
    maxVisibleCount
  );
}
