import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AdminOperationsPage } from "@/src/features/adminOperations/AdminOperationsPage";
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
            adminEyebrow: "Admin",
            refresh: "Refresh",
            refreshing: "Refreshing..."
          },
          adminOperations: {
            routeReleaseGatesTitle: "Release Gates",
            routeReleaseGatesDescription: "Validate release readiness.",
            runGatesAction: "Run Gates",
            gateChecksTitle: "Gate Checks",
            snapshotSummaryTitle: "Snapshot Summary",
            snapshotSummaryDescription: "Release gate snapshot.",
            overallStateLabel: "Overall State",
            generatedAtLabel: "Generated At",
            stateBlocked: "Blocked",
            valueNotAvailable: "n/a"
          }
        })
      },
      createElement(AdminOperationsPage, { route: "/admin/ops/release-gates" })
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

describe("admin operations page", () => {
  it("renders the release-gates load-state contract until live data becomes ready", () => {
    const markup = renderPage();

    expectMarkupToContainAll(markup, [
      "Admin",
      "Release Gates",
      "Validate release readiness.",
      "Refreshing..."
    ]);
    expectMarkupToExcludeAll(markup, [
      "Run Gates",
      "Gate Checks",
      "Snapshot Summary",
      "Overall State",
      "Generated At"
    ]);
  });
});
