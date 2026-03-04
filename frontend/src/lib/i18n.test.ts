import { describe, expect, it } from "vitest";

import { changeLocale, normalizeLocale, resolveActiveLocale } from "./i18n";

describe("normalizeLocale", () => {
  it("returns en when en is provided", () => {
    expect(normalizeLocale("en")).toBe("en");
  });

  it("returns zh when zh is provided", () => {
    expect(normalizeLocale("zh")).toBe("zh");
  });

  it("falls back to default locale for unsupported values", () => {
    expect(normalizeLocale("fr")).toBe("zh");
    expect(normalizeLocale("")).toBe("zh");
    expect(normalizeLocale(null)).toBe("zh");
    expect(normalizeLocale(undefined)).toBe("zh");
  });
});

describe("i18n framework locale bridge", () => {
  it("changes locale through i18next and resolves active locale", async () => {
    await changeLocale("en");
    expect(resolveActiveLocale()).toBe("en");

    await changeLocale("zh");
    expect(resolveActiveLocale()).toBe("zh");
  });
});
