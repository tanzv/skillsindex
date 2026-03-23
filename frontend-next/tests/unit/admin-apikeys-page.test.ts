import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AdminAPIKeysPage } from "@/src/features/adminApiKeys/AdminAPIKeysPage";
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
            refreshing: "Refreshing...",
            clear: "Clear"
          },
          adminApiKeys: {
            pageTitle: "API Keys",
            pageDescription: "Manage API credentials.",
            inventoryTitle: "Key Inventory",
            createTitle: "Create Key",
            ownerSummaryTitle: "Owner Summary",
            createAction: "Create Key"
          }
        })
      },
      createElement(AdminAPIKeysPage)
    )
  );
}

describe("admin api keys page", () => {
  it("defers api key sections until live data loads", () => {
    const markup = renderPage();

    expect(markup).toContain("API Keys");
    expect(markup).toContain("Manage API credentials.");
    expect(markup).toContain("Refreshing...");
    expect(markup).not.toContain("Key Inventory");
    expect(markup).not.toContain("Create Key");
    expect(markup).not.toContain("Owner Summary");
  });
});
