import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AdminOperationsRecordsPage } from "@/src/features/adminOperations/AdminOperationsRecordsPage";
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
            routeReleasesTitle: "Releases",
            routeReleasesDescription: "Track release records.",
            ledgerTitleSuffix: "Ledger",
            ledgerDescription: "Structured operational evidence.",
            noRecords: "No records returned.",
            recordEntryTitle: "Record Entry",
            recordEntryDescription: "Create a new record.",
            saveRecordAction: "Save Record",
            endpointStatusTitle: "Endpoint Status",
            endpointStatusDescription: "Endpoint details.",
            releaseVersionLabel: "Version",
            releaseVersionPlaceholder: "v1.0.0",
            releaseEnvironmentLabel: "Environment",
            releaseEnvironmentPlaceholder: "production",
            releaseChangeTicketLabel: "Change Ticket",
            releaseChangeTicketPlaceholder: "CHG-001",
            releaseStatusLabel: "Status",
            releaseStatusPlaceholder: "success",
            releaseNoteLabel: "Note",
            releaseNotePlaceholder: "Release note"
          }
        })
      },
      createElement(AdminOperationsRecordsPage, { route: "/admin/ops/releases" })
    )
  );
}

describe("admin operations records page", () => {
  it("renders localized records layout and empty state", () => {
    const markup = renderPage();

    expect(markup).toContain("Releases");
    expect(markup).toContain("Track release records.");
    expect(markup).toContain("Releases Ledger");
    expect(markup).toContain("Structured operational evidence.");
    expect(markup).toContain("No records returned.");
    expect(markup).toContain("Record Entry");
    expect(markup).toContain("Save Record");
    expect(markup).toContain("Endpoint Status");
    expect(markup).toContain("Refreshing...");
  });
});
