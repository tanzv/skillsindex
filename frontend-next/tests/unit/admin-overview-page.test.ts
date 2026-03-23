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
  it("defers overview sections until live data loads", () => {
    const markup = renderPage();

    expect(markup).toContain("Admin Overview");
    expect(markup).toContain("Platform control summary.");
    expect(markup).toContain("Refreshing...");
    expect(markup).not.toContain("Distribution");
    expect(markup).not.toContain("Navigation");
    expect(markup).not.toContain("Capability Envelope");
    expect(markup).not.toContain("Operational Readiness");
    expect(markup).not.toContain("Open Intake");
    expect(markup).not.toContain("Open Alerts");
  });
});
