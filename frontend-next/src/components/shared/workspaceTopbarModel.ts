import {
  buildProtectedTopbarEntries,
  buildProtectedTopbarModel,
  resolveProtectedPrimaryShellWidth,
  resolveProtectedResponsivePrimaryVisibleCount,
  type ProtectedTopbarEntry,
  type ProtectedTopbarModel
} from "./protectedTopbarModel";
import { workspaceProtectedTopbarConfig } from "./protectedTopbarConfigs";

export type WorkspaceTopbarEntry = ProtectedTopbarEntry;
export type WorkspaceTopbarModel = ProtectedTopbarModel;

export function resolveWorkspacePrimaryShellWidth(viewportWidth: number | null | undefined): number | null {
  return resolveProtectedPrimaryShellWidth(viewportWidth);
}

export function resolveWorkspaceResponsivePrimaryVisibleCount(shellWidth: number | null | undefined): number {
  return resolveProtectedResponsivePrimaryVisibleCount(shellWidth);
}

export function buildWorkspaceTopbarEntries(pathname: string): WorkspaceTopbarEntry[] {
  return buildProtectedTopbarEntries(pathname, workspaceProtectedTopbarConfig);
}

export function buildWorkspaceTopbarModel(pathname: string, maxVisibleCount?: number): WorkspaceTopbarModel {
  return buildProtectedTopbarModel(pathname, workspaceProtectedTopbarConfig, maxVisibleCount);
}
