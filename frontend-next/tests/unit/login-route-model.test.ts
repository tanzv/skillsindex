import { describe, expect, it } from "vitest";

import {
  normalizeLoginRedirectTarget,
  resolveLoginRedirectTarget,
  resolveLoginRouteLocale
} from "@/src/features/auth/loginRouteModel";

describe("resolveLoginRedirectTarget", () => {
  it("returns the redirect query when it is a string", () => {
    expect(resolveLoginRedirectTarget({ redirect: "/workspace/activity" })).toBe("/workspace/activity");
  });

  it("falls back to the default workspace route for missing or invalid redirect values", () => {
    expect(resolveLoginRedirectTarget({})).toBe("/workspace");
    expect(resolveLoginRedirectTarget({ redirect: ["/workspace/activity"] })).toBe("/workspace");
  });
});

describe("normalizeLoginRedirectTarget", () => {
  it("keeps rooted in-app redirects", () => {
    expect(normalizeLoginRedirectTarget("/admin/overview")).toBe("/admin/overview");
  });

  it("rejects invalid redirect paths", () => {
    expect(normalizeLoginRedirectTarget("https://example.com")).toBe("/workspace");
    expect(normalizeLoginRedirectTarget("//example.com")).toBe("/workspace");
  });
});

describe("resolveLoginRouteLocale", () => {
  it("prefers the locale cookie when it is supported", () => {
    expect(resolveLoginRouteLocale("zh", "en-US,en;q=0.9")).toBe("zh");
  });

  it("falls back to the accept-language header when the cookie is missing", () => {
    expect(resolveLoginRouteLocale(undefined, "zh-CN,zh;q=0.9,en;q=0.8")).toBe("zh");
  });

  it("normalizes unsupported inputs to the default locale", () => {
    expect(resolveLoginRouteLocale("fr", null)).toBe("zh");
  });
});
