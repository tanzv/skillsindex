import { describe, expect, it } from "vitest";

import { isLightPrototypePathname, isPublicExperienceRoute, resolveAppBodyClassName } from "./AppRoot.shared";

describe("isPublicExperienceRoute", () => {
  it("treats marketplace and prototype surfaces as public experience routes", () => {
    expect(isPublicExperienceRoute("/")).toBe(true);
    expect(isPublicExperienceRoute("/results")).toBe(true);
    expect(isPublicExperienceRoute("/docs")).toBe(true);
    expect(isPublicExperienceRoute("/prototype")).toBe(true);
  });

  it("does not treat login or protected routes as public experience routes", () => {
    expect(isPublicExperienceRoute("/login")).toBe(false);
    expect(isPublicExperienceRoute("/workspace")).toBe(false);
    expect(isPublicExperienceRoute("/admin/overview")).toBe(false);
    expect(isPublicExperienceRoute("/account/profile")).toBe(false);
  });
});

describe("isLightPrototypePathname", () => {
  it("detects prefixed light-mode paths", () => {
    expect(isLightPrototypePathname("/light/docs")).toBe(true);
    expect(isLightPrototypePathname("/mobile/light/rankings")).toBe(true);
  });

  it("ignores dark-mode and unprefixed paths", () => {
    expect(isLightPrototypePathname("/docs")).toBe(false);
    expect(isLightPrototypePathname("/mobile/rankings")).toBe(false);
  });
});

describe("resolveAppBodyClassName", () => {
  it("maps login pages to login body classes with light-mode awareness", () => {
    expect(resolveAppBodyClassName("/login", "/login")).toBe("page-login-react");
    expect(resolveAppBodyClassName("/login", "/light/login")).toBe("page-login-react-light");
  });

  it("maps public experience routes to home body classes", () => {
    expect(resolveAppBodyClassName("/docs", "/docs")).toBe("page-home-react");
    expect(resolveAppBodyClassName("/prototype", "/mobile/light/workspace")).toBe("page-home-react-light");
  });

  it("maps protected routes to account or admin body classes", () => {
    expect(resolveAppBodyClassName("/account/profile", "/account/profile")).toBe("page-account-react");
    expect(resolveAppBodyClassName("/workspace", "/workspace")).toBe("page-admin-react");
    expect(resolveAppBodyClassName("/admin/overview", "/admin/overview")).toBe("page-admin-react");
  });
});
