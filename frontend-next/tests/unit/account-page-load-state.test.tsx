import { describe, expect, it } from "vitest";

import { resolveAccountPageLoadState } from "@/src/features/accountCenter/accountPageLoadState";

describe("resolveAccountPageLoadState", () => {
  it("keeps the page ready while background refreshes run against existing data", () => {
    expect(
      resolveAccountPageLoadState({
        loading: true,
        error: "",
        hasData: true
      })
    ).toBe("ready");
  });

  it("uses the loading state before any account data is available", () => {
    expect(
      resolveAccountPageLoadState({
        loading: true,
        error: "",
        hasData: false
      })
    ).toBe("loading");
  });
});
