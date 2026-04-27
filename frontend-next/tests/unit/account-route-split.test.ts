import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("account route split", () => {
  it("lazy-loads the account center page from the shared account route helper", () => {
    const source = readRepoFile("src/features/accountCenter/renderAccountRoute.tsx");

    expect(source).toContain('await import("./AccountCenterPage")');
    expect(source).not.toContain('from "./AccountCenterPage"');
  });
});
