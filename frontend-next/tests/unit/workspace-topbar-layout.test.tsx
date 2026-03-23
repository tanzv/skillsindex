import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { WorkspaceTopbar } from "@/src/components/shared/WorkspaceTopbar";
import { protectedTopbarMessageFallbacks } from "@/src/lib/i18n/protectedMessages";
import { workspaceMessageFallbacks } from "@/src/lib/i18n/protectedPageMessages.workspace";
import type { SessionContext } from "@/src/lib/schemas/session";

const session: SessionContext = {
  user: {
    id: 1,
    username: "admin",
    displayName: "Admin Operator",
    role: "admin",
    status: "active"
  },
  marketplacePublicAccess: true
};

describe("WorkspaceTopbar layout", () => {
  it("keeps the marketplace shortcut in the trailing utility area", () => {
    const markup = renderToStaticMarkup(
      createElement(WorkspaceTopbar, {
        pathname: "/workspace",
        session,
        brandTitle: "SkillsIndex",
        messages: protectedTopbarMessageFallbacks,
        workspaceMessages: workspaceMessageFallbacks,
        theme: "light",
        onThemeChange: () => {},
        accountMenuTriggerVariant: "avatar",
        onOpenNavigation: () => {},
        navigationToggleLabel: "Open workspace navigation",
        navigationToggleTestId: "workspace-topbar-menu-trigger"
      })
    );

    expect(markup).toContain("Marketplace");
    expect(markup).toContain("workspace-topbar-utility");
    expect(markup).toContain("workspace-topbar-more");
    expect(markup).toContain('data-trigger-variant="avatar"');
    expect(markup).toContain("/brand/skillsindex-wordmark-dark.svg");
    expect(markup).not.toContain("Workspace Overview");
  });
});
