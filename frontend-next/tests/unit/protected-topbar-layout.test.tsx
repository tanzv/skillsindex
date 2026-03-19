import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProtectedTopbar } from "@/src/components/shared/ProtectedTopbar";
import { buildAccountCenterMenuConfig } from "@/src/components/shared/protectedTopbarConfigs";
import { protectedTopbarMessageFallbacks } from "@/src/lib/i18n/protectedMessages";
import type { SessionContext } from "@/src/lib/schemas/session";
import type { ProtectedTopbarConfig } from "@/src/components/shared/protectedTopbarModel";

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

const config: ProtectedTopbarConfig = {
  entries: [
    {
      id: "overview",
      href: "/admin/overview",
      label: "Overview",
      description: "Open the admin overview route.",
      kind: "primary",
      overflowGroupId: "primary"
    },
    {
      id: "workspace",
      href: "/workspace",
      label: "Workspace",
      description: "Open the workspace route.",
      kind: "access",
      overflowGroupId: "access"
    }
  ],
  primaryGroups: [
    { id: "primary", label: "Primary", tagLabel: "Primary", kind: "primary" },
    { id: "access", label: "Access", tagLabel: "Access", kind: "access" }
  ],
  overflowGroupTitles: {
    primary: "Primary",
    access: "Access"
  },
  overflowGroupOrder: ["primary", "access"],
  overflowTitle: "Overflow",
  overflowHint: "Protected navigation overflow.",
  overflowMetricLabels: {
    visible: "Visible",
    hidden: "Hidden"
  }
};

describe("ProtectedTopbar layout", () => {
  it("renders the primary navigation in the header leading area and keeps the account trigger on the trailing side", () => {
    const markup = renderToStaticMarkup(
      createElement(ProtectedTopbar, {
        pathname: "/admin/overview",
        session,
        brandTitle: "SkillsIndex",
        brandSubtitle: "Admin Overview",
        brandHref: "/admin/overview",
        config,
        accountCenterMenu: buildAccountCenterMenuConfig(protectedTopbarMessageFallbacks),
        dataTestId: "admin-topbar",
        navigationAriaLabel: protectedTopbarMessageFallbacks.navigationAriaLabelAdmin,
        messages: protectedTopbarMessageFallbacks,
        theme: "light",
        onThemeChange: () => {},
        navigationToggleLabel: "Open navigation",
        navigationToggleTestId: "admin-topbar-menu-trigger",
        onOpenNavigation: () => {}
      })
    );

    expect(markup).toContain("admin-topbar-menu-trigger");
    expect(markup).toContain("Open navigation");
    expect(markup).toContain("admin-topbar-account-trigger");
    expect(markup).toContain("workspace-shell-topbar-brand");
    expect(markup).toContain("admin-topbar-header-row");
    expect(markup).toContain("admin-topbar-nav-row");
    expect(markup).toContain("admin-topbar-utility");
    expect(markup).toContain('data-navigation-ready="false"');
    expect(markup.indexOf("admin-topbar-nav-row")).toBeGreaterThan(markup.indexOf("workspace-shell-topbar-brand"));
    expect(markup.indexOf("admin-topbar-account-trigger")).toBeGreaterThan(markup.indexOf("admin-topbar-nav-row"));
  });
});
