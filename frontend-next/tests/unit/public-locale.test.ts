import { describe, expect, it } from "vitest";

import {
  formatPublicDate,
  normalizePublicLocale,
  resolvePreferredPublicLocale
} from "@/src/lib/i18n/publicLocale";

describe("public locale helpers", () => {
  it("normalizes supported locales and falls back to the default locale", () => {
    expect(normalizePublicLocale("en")).toBe("en");
    expect(normalizePublicLocale("zh")).toBe("zh");
    expect(normalizePublicLocale("de")).toBe("zh");
    expect(normalizePublicLocale(null)).toBe("zh");
  });

  it("resolves locale from accept-language values", () => {
    expect(resolvePreferredPublicLocale("zh-CN,zh;q=0.9,en;q=0.8")).toBe("zh");
    expect(resolvePreferredPublicLocale("en-US,en;q=0.7")).toBe("en");
    expect(resolvePreferredPublicLocale("fr-FR,fr;q=0.9")).toBe("zh");
  });

  it("formats dates using the selected locale", () => {
    expect(formatPublicDate("2026-03-14T12:00:00Z", "en")).toContain("2026");
    expect(formatPublicDate("2026-03-14T12:00:00Z", "zh")).toContain("2026");
  });
});
