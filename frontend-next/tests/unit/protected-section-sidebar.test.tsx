import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProtectedSectionSidebar } from "@/src/components/shared/ProtectedSectionSidebar";
import styles from "@/src/components/shared/ProtectedSectionSidebar.module.scss";

describe("ProtectedSectionSidebar", () => {
  it("renders consistent stacked navigation content across protected shells", () => {
    const scenarios = [
      {
        scope: "admin-shell" as const,
        dataTestId: "admin-secondary-sidebar",
        expectedPanelClass: "admin-shell-panel",
        expectedLinkClass: "admin-shell-side-link"
      },
      {
        scope: "workspace-shell" as const,
        dataTestId: "workspace-secondary-sidebar",
        expectedPanelClass: "workspace-shell-panel",
        expectedLinkClass: "workspace-shell-side-link"
      },
      {
        scope: "account-shell" as const,
        dataTestId: "account-secondary-sidebar",
        expectedPanelClass: "account-shell-panel",
        expectedLinkClass: "account-shell-side-link"
      }
    ];

    scenarios.forEach((scenario) => {
      const markup = renderToStaticMarkup(
        createElement(ProtectedSectionSidebar, {
          scope: scenario.scope,
          title: "Control Sections",
          groups: [
            {
              id: "current",
              title: "Overview",
              items: [
                {
                  id: "overview-route",
                  href: "/admin/overview",
                  label: "Overview",
                  note: "Overview route",
                  active: true
                }
              ]
            }
          ],
          dataTestId: scenario.dataTestId
        })
      );

      expect(markup).toContain(scenario.dataTestId);
      expect(markup).toContain(`class="${scenario.expectedPanelClass} `);
      expect(markup).toContain(scenario.expectedLinkClass);
      expect(markup).toContain(styles.linkBody);
      expect(markup).toContain(styles.linkNote);
      expect(markup).toContain("Overview route");
      expect(markup).toContain("Control Sections");
    });
  });
});
