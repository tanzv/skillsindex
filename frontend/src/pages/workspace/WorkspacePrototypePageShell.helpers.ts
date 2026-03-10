export type WorkspaceShellSidebarMode = "auto" | "default" | "secondary";
export type WorkspaceShellLayoutVariant = "default" | "full-width";

interface ResolveWorkspacePrototypeLayoutVariantInput {
  layoutVariant?: WorkspaceShellLayoutVariant;
  shouldRenderSecondarySidebar: boolean;
}

export function resolveWorkspacePrototypeLayoutVariant({
  layoutVariant,
  shouldRenderSecondarySidebar
}: ResolveWorkspacePrototypeLayoutVariantInput): WorkspaceShellLayoutVariant {
  if (layoutVariant) {
    return layoutVariant;
  }

  return shouldRenderSecondarySidebar ? "full-width" : "default";
}
