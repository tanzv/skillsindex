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

  querySelectorAll() {
    return this.links.filter((link) => {
      const rel = link.getAttribute("rel");
      return rel === "icon" || rel === "shortcut icon";
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

  it("updates existing icon links and removes media constraints", () => {
    const documentRef = createFakeDocument(["icon", "shortcut icon"]);

    syncThemeAwareFavicon(documentRef, "light");

    const links = Array.from(documentRef.head.querySelectorAll()) as FakeLinkElement[];
    expect(links).toHaveLength(2);
    links.forEach((link) => {
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
});
