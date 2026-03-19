import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AdminOverviewPage } from "@/src/features/adminOverview/AdminOverviewPage";
import { ProtectedI18nProvider } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

function renderPage() {
  return renderToStaticMarkup(
    createElement(
      ProtectedI18nProvider,
      {
        locale: "en",
        messages: createProtectedPageTestMessages({
          adminCommon: {
            refresh: "Refresh",
            refreshing: "Refreshing..."
          },
          adminOverview: {
            heroKicker: "Admin Command",
            pageTitle: "Admin Overview",
            pageDescription: "Platform control summary.",
            distributionTitle: "Distribution",
            navigationTitle: "Navigation",
            capabilityTitle: "Capability Envelope",
            readinessTitle: "Operational Readiness",
            openIntakeAction: "Open Intake",
            openAlertsAction: "Open Alerts"
          }
        })
      },
      createElement(AdminOverviewPage)
    )
  );
}

describe("admin overview page", () => {
  it("renders localized overview sections", () => {
    const markup = renderPage();

    expect(markup).toContain("Admin Overview");
    expect(markup).toContain("Platform control summary.");
    expect(markup).toContain("Distribution");
    expect(markup).toContain("Navigation");
    expect(markup).toContain("Capability Envelope");
    expect(markup).toContain("Operational Readiness");
    expect(markup).toContain("Open Intake");
    expect(markup).toContain("Open Alerts");
    expect(markup).toContain("Refreshing...");
  });
});
