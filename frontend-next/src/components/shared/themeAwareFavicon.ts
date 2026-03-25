"use client";

import { useEffect } from "react";

export type ThemeAwareFaviconPreference = "light" | "dark";

const THEME_AWARE_FAVICON_TYPE = "image/svg+xml";
const THEME_AWARE_FAVICON_SELECTOR = 'link[data-theme-favicon="true"][rel="icon"], link[data-theme-favicon="true"][rel="shortcut icon"]';

export function resolveThemeAwareFaviconHref(theme: ThemeAwareFaviconPreference) {
  return theme === "light" ? "/brand/skillsindex-tab-light.svg" : "/brand/skillsindex-tab-dark.svg";
}

function createThemeAwareFaviconLink(documentRef: Document, rel: string) {
  const link = documentRef.createElement("link");
  link.setAttribute("rel", rel);
  link.setAttribute("data-theme-favicon", "true");
  documentRef.head.appendChild(link);
  return link;
}

function ensureThemeAwareFaviconLinks(documentRef: Document) {
  const existingLinks = Array.from(documentRef.head.querySelectorAll<HTMLLinkElement>(THEME_AWARE_FAVICON_SELECTOR));
  const linksByRel = new Map(existingLinks.map((link) => [link.getAttribute("rel"), link]));

  for (const rel of ["icon", "shortcut icon"]) {
    if (!linksByRel.has(rel)) {
      linksByRel.set(rel, createThemeAwareFaviconLink(documentRef, rel));
    }
  }

  return Array.from(linksByRel.values());
}

export function syncThemeAwareFavicon(documentRef: Document, theme: ThemeAwareFaviconPreference) {
  const href = resolveThemeAwareFaviconHref(theme);
  const existingLinks = ensureThemeAwareFaviconLinks(documentRef);

  existingLinks.forEach((link) => {
    link.setAttribute("href", href);
    link.setAttribute("type", THEME_AWARE_FAVICON_TYPE);
    link.removeAttribute("media");
    link.setAttribute("data-theme-favicon", "true");
  });
}

export function useThemeAwareFavicon(theme: ThemeAwareFaviconPreference) {
  useEffect(() => {
    syncThemeAwareFavicon(document, theme);
  }, [theme]);
}
