import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("eslint config", () => {
  it("ignores generated output, nested snapshots, and temporary directories", () => {
    const source = readRepoFile("eslint.config.mjs");

    expect(source).toContain(".next/**");
    expect(source).toContain(".next.bak-*/**");
    expect(source).toContain("frontend-next/**");
    expect(source).toContain("test-results/**");
    expect(source).toContain("tmp/**");
    expect(source).toContain("tmp-screens/**");
  });
});
