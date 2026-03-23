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

describe("admin operations page", () => {
  it("defers release gate panels until live data loads", () => {
    const markup = renderPage();

    expect(markup).toContain("Release Gates");
    expect(markup).toContain("Validate release readiness.");
    expect(markup).toContain("Refreshing...");
    expect(markup).not.toContain("Run Gates");
    expect(markup).not.toContain("Gate Checks");
    expect(markup).not.toContain("Snapshot Summary");
    expect(markup).not.toContain("Overall State");
    expect(markup).not.toContain("Generated At");
  });
});
