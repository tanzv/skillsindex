import { describe, expect, it } from "vitest";

import { resolveAdminPageLoadState } from "@/src/features/admin/adminPageLoadState";

describe("resolveAdminPageLoadState", () => {
  it("keeps the page ready while refreshing existing admin data", () => {
    expect(
      resolveAdminPageLoadState({
        loading: true,
        error: "",
        hasData: true
      })
    ).toBe("ready");
  });

  it("stays in loading before the first admin payload arrives", () => {
    expect(
      resolveAdminPageLoadState({
        loading: true,
        error: "",
        hasData: false
      })
    ).toBe("loading");
  });
});
