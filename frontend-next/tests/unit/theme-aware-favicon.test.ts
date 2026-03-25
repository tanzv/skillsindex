import { describe, expect, it } from "vitest";

import { resolveThemeAwareFaviconHref, syncThemeAwareFavicon } from "@/src/components/shared/themeAwareFavicon";

class FakeLinkElement {
  private readonly attributes = new Map<string, string>();

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name: string) {
    this.attributes.delete(name);
  }

  hasAttribute(name: string) {
    return this.attributes.has(name);
  }
}

class FakeHeadElement {
  readonly links: FakeLinkElement[] = [];

  appendChild(link: FakeLinkElement) {
    this.links.push(link);
  }

  querySelectorAll(selector?: string) {
    const themeAwareOnly = String(selector || "").includes('data-theme-favicon="true"');

    return this.links.filter((link) => {
      const rel = link.getAttribute("rel");
      if (rel !== "icon" && rel !== "shortcut icon") {
        return false;
      }

      if (!themeAwareOnly) {
        return true;
      }

      return link.getAttribute("data-theme-favicon") === "true";
    });
  }
}

function createFakeDocument(existingRels: string[] = []) {
  const head = new FakeHeadElement();

  existingRels.forEach((rel) => {
    const link = new FakeLinkElement();
    link.setAttribute("rel", rel);
    link.setAttribute("href", "/icon.svg");
    if (rel === "icon") {
      link.setAttribute("media", "(prefers-color-scheme: dark)");
    }
    head.appendChild(link);
  });

  return {
    head,
    createElement() {
      return new FakeLinkElement();
    }
  } as unknown as Document;
}

describe("themeAwareFavicon", () => {
  it("resolves the expected favicon asset for each theme", () => {
    expect(resolveThemeAwareFaviconHref("light")).toBe("/brand/skillsindex-tab-light.svg");
    expect(resolveThemeAwareFaviconHref("dark")).toBe("/brand/skillsindex-tab-dark.svg");
  });

  it("creates dedicated theme-aware icon links without overwriting the shared fallback icon", () => {
    const documentRef = createFakeDocument(["icon", "shortcut icon"]);

    syncThemeAwareFavicon(documentRef, "light");

    const links = Array.from(documentRef.head.querySelectorAll()) as FakeLinkElement[];
    const themeAwareLinks = links.filter((link) => link.getAttribute("data-theme-favicon") === "true");
    const fallbackLinks = links.filter((link) => link.getAttribute("data-theme-favicon") !== "true");

    expect(links).toHaveLength(4);
    expect(fallbackLinks).toHaveLength(2);
    fallbackLinks.forEach((link) => {
      expect(link.getAttribute("href")).toBe("/icon.svg");
    });

    expect(themeAwareLinks).toHaveLength(2);
    themeAwareLinks.forEach((link) => {
      expect(link.getAttribute("href")).toBe("/brand/skillsindex-tab-light.svg");
      expect(link.getAttribute("type")).toBe("image/svg+xml");
      expect(link.hasAttribute("media")).toBe(false);
      expect(link.getAttribute("data-theme-favicon")).toBe("true");
    });
  });

  it("creates icon links when none exist", () => {
    const documentRef = createFakeDocument();

    syncThemeAwareFavicon(documentRef, "dark");

    const links = Array.from(documentRef.head.querySelectorAll()) as FakeLinkElement[];
    expect(links).toHaveLength(2);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/brand/skillsindex-tab-dark.svg",
      "/brand/skillsindex-tab-dark.svg"
    ]);
  });

  it("updates only managed theme-aware links on subsequent syncs", () => {
    const documentRef = createFakeDocument(["icon"]);

    syncThemeAwareFavicon(documentRef, "light");
    syncThemeAwareFavicon(documentRef, "dark");

    const links = Array.from(documentRef.head.querySelectorAll()) as FakeLinkElement[];
    const fallbackLink = links.find((link) => link.getAttribute("data-theme-favicon") !== "true");
    const themeAwareLinks = links.filter((link) => link.getAttribute("data-theme-favicon") === "true");

    expect(fallbackLink?.getAttribute("href")).toBe("/icon.svg");
    expect(themeAwareLinks).toHaveLength(2);
    expect(themeAwareLinks.map((link) => link.getAttribute("href"))).toEqual([
      "/brand/skillsindex-tab-dark.svg",
      "/brand/skillsindex-tab-dark.svg"
    ]);
  });
});
