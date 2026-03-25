import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProtectedTopbar } from "@/src/components/shared/ProtectedTopbar";
import { buildAccountCenterMenuConfig } from "@/src/components/shared/protectedTopbarConfigs";
import { protectedTopbarMessageFallbacks } from "@/src/lib/i18n/protectedMessages";
import type { ProtectedTopbarConfig } from "@/src/lib/navigation/protectedTopbarContracts";
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
    expect(markup).toContain('data-trigger-variant="pill"');
    expect(markup).toContain("admin-topbar-header-row");
    expect(markup).toContain("admin-topbar-nav-row");
    expect(markup).toContain("admin-topbar-utility");
    expect(markup).toContain('data-navigation-ready="false"');
    expect(markup).toContain("Open SkillsIndex home");
    expect(markup).toContain("SkillsIndex control hub");
    expect(markup).toContain("/brand/skillsindex-wordmark-dark.svg");
    expect(markup).toContain('alt="SkillsIndex wordmark"');
    expect(markup).not.toContain("Admin Overview");
    expect(markup.indexOf("admin-topbar-nav-row")).toBeGreaterThan(markup.indexOf("SkillsIndex"));
    expect(markup.indexOf("admin-topbar-account-trigger")).toBeGreaterThan(markup.indexOf("admin-topbar-nav-row"));
  });

  it("renders the overflow panel from the shared overflow component when hidden routes exist", () => {
    const overflowConfig: ProtectedTopbarConfig = {
      ...config,
      entries: [
        ...config.entries,
        {
          id: "catalog",
          href: "/admin/catalog",
          label: "Catalog",
          description: "Open the admin catalog route.",
          kind: "primary",
          overflowGroupId: "primary"
        },
        {
          id: "jobs",
          href: "/admin/jobs",
          label: "Jobs",
          description: "Open the admin jobs route.",
          kind: "primary",
          overflowGroupId: "primary"
        },
        {
          id: "audit",
          href: "/admin/audit",
          label: "Audit",
          description: "Open the admin audit route.",
          kind: "primary",
          overflowGroupId: "primary"
        }
      ]
    };

    const markup = renderToStaticMarkup(
      createElement(ProtectedTopbar, {
        pathname: "/admin/overview",
        session,
        brandTitle: "SkillsIndex",
        brandSubtitle: "Admin Overview",
        brandHref: "/admin/overview",
        config: overflowConfig,
        accountCenterMenu: buildAccountCenterMenuConfig(protectedTopbarMessageFallbacks),
        dataTestId: "admin-topbar",
        navigationAriaLabel: protectedTopbarMessageFallbacks.navigationAriaLabelAdmin,
        messages: protectedTopbarMessageFallbacks,
        theme: "light",
        onThemeChange: () => {},
        defaultOverflowExpanded: true,
        onOpenNavigation: () => {}
      })
    );

    expect(markup).toContain("admin-topbar-overflow-panel");
    expect(markup).toContain("admin-topbar-overflow-group-access");
    expect(markup).toContain("Open the workspace route.");
    expect(markup).toContain('role="menu"');
  });
});
