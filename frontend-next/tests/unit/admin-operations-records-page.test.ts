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
            openRecordEntryAction: "Open Record Entry",
            openRecordDetailAction: "Open Details",
            recordEntryTitle: "Record Entry",
            recordEntryDescription: "Create a new record.",
            recordDetailTitle: "Record Detail",
            recordDetailDescription: "Inspect the selected record without leaving the ledger.",
            rawRecordDetailTitle: "Raw record",
            closePanelAction: "Close Panel",
            saveRecordAction: "Save Record",
            savingRecordAction: "Saving...",
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
  it("defers records sections until live data loads", () => {
    const markup = renderPage();

    expect(markup).toContain("Releases");
    expect(markup).toContain("Track release records.");
    expect(markup).toContain("Refreshing...");
    expect(markup).not.toContain("Releases Ledger");
    expect(markup).not.toContain("Structured operational evidence.");
    expect(markup).not.toContain("No records returned.");
    expect(markup).not.toContain("Open Record Entry");
    expect(markup).not.toContain("Endpoint Status");
  });
});
