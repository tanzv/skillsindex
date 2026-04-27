import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("admin route lazy imports", () => {
  it("keeps renderAdminRoute free of static feature page imports so one admin page does not eagerly pull the whole family", () => {
    const source = readRepoFile("src/features/admin/renderAdminRoute.tsx");

    expect(source).toContain('await import("../adminOverview/AdminOverviewPage")');
    expect(source).toContain('await import("../adminIngestion/AdminIngestionPage")');
    expect(source).toContain('await import("../adminOperations/AdminOperationsRecordsPage")');
    expect(source).not.toContain('from "../adminOverview/AdminOverviewPage"');
    expect(source).not.toContain('from "../adminIngestion/AdminIngestionPage"');
    expect(source).not.toContain('from "../adminOperations/AdminOperationsRecordsPage"');
  });
});
