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

function expectMarkupToContainAll(markup: string, fragments: string[]) {
  for (const fragment of fragments) {
    expect(markup).toContain(fragment);
  }
}

function expectMarkupToExcludeAll(markup: string, fragments: string[]) {
  for (const fragment of fragments) {
    expect(markup).not.toContain(fragment);
  }
}

describe("admin overview page", () => {
  it("renders the load-state contract until live overview data becomes ready", () => {
    const markup = renderPage();

    expectMarkupToContainAll(markup, [
      "Admin Command",
      "Admin Overview",
      "Platform control summary.",
      "Refreshing..."
    ]);
    expectMarkupToExcludeAll(markup, [
      'data-testid="admin-overview-stage"',
      'data-testid="admin-overview-actions"',
      'data-testid="admin-overview-nav-grid"',
      "Distribution",
      "Navigation",
      "Capability Envelope",
      "Operational Readiness",
      "Open Intake",
      "Open Alerts"
    ]);
  });
});
