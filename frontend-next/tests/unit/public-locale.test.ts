import { describe, expect, it, vi } from "vitest";

import {
  applyBrowserPublicLocale,
  buildBrowserLocaleReloadTarget,
  persistBrowserPublicLocale
} from "@/src/lib/i18n/publicLocale";

describe("publicLocale browser helpers", () => {
  it("persists locale preference to storage, cookie, and document language", () => {
    const storage = { setItem: vi.fn() };
    const documentRef = {
      cookie: "",
      documentElement: { lang: "en" }
    };

    const locale = persistBrowserPublicLocale("zh", storage, documentRef);

    expect(locale).toBe("zh");
    expect(storage.setItem).toHaveBeenCalledWith("skillsindex.locale", "zh");
    expect(documentRef.cookie).toContain("skillsindex_locale=zh");
    expect(documentRef.documentElement.lang).toBe("zh");
  });

  it("builds a same-route reload target from the active browser location", () => {
    expect(
      buildBrowserLocaleReloadTarget({
        pathname: "/workspace",
        search: "?tab=profile",
        hash: "#details",
        assign: () => {}
      })
    ).toBe("/workspace?tab=profile#details");
  });

  it("reloads the current route after persisting the locale change", () => {
    const storage = { setItem: vi.fn() };
    const documentRef = {
      cookie: "",
      documentElement: { lang: "en" }
    };
    const locationRef = {
      pathname: "/workspace",
      search: "?tab=profile",
      hash: "#details",
      assign: vi.fn()
    };

    const locale = applyBrowserPublicLocale("zh", {
      storage,
      documentRef,
      locationRef
    });

    expect(locale).toBe("zh");
    expect(locationRef.assign).toHaveBeenCalledWith("/workspace?tab=profile#details");
  });
});
