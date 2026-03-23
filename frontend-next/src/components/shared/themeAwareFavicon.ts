"use client";

import { useEffect } from "react";

export type ThemeAwareFaviconPreference = "light" | "dark";

const THEME_AWARE_FAVICON_TYPE = "image/svg+xml";

export function resolveThemeAwareFaviconHref(theme: ThemeAwareFaviconPreference) {
  return theme === "light" ? "/brand/skillsindex-tab-light.svg" : "/brand/skillsindex-tab-dark.svg";
}

function createThemeAwareFaviconLink(documentRef: Document, rel: string, href: string) {
  const link = documentRef.createElement("link");
  link.setAttribute("rel", rel);
  link.setAttribute("type", THEME_AWARE_FAVICON_TYPE);
  link.setAttribute("href", href);
  link.setAttribute("data-theme-favicon", "true");
  documentRef.head.appendChild(link);
}

export function syncThemeAwareFavicon(documentRef: Document, theme: ThemeAwareFaviconPreference) {
  const href = resolveThemeAwareFaviconHref(theme);
  const existingLinks = Array.from(
    documentRef.head.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="shortcut icon"]')
  );

  if (existingLinks.length === 0) {
    createThemeAwareFaviconLink(documentRef, "icon", href);
    createThemeAwareFaviconLink(documentRef, "shortcut icon", href);
    return;
  }

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
