import { describe, expect, it } from "vitest";
import { readRepoFile } from "./routeEntrypointTestUtils";

describe("protected theme contract", () => {
  it("defines protected themes through SCSS maps and neutral dark tokens", () => {
    const protectedTheme = readRepoFile("app/protected-theme.scss");

    expect(protectedTheme).toContain('@use "sass:map";');
    expect(protectedTheme).toContain("$protected-theme-light");
    expect(protectedTheme).toContain("$protected-theme-dark");
    expect(protectedTheme).toContain('"protected-shell-bg": #101010');
    expect(protectedTheme).toContain('"protected-shell-surface": #171717');
    expect(protectedTheme).toContain('"protected-shell-text": #e5e5e5');
    expect(protectedTheme).toContain('"protected-topbar-control-bg-active": #e5e5e5');
  });
});
