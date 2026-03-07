import { createGlobalNavigationRegistry } from "./globalNavigationRegistry";
import type {
  GlobalUserControlItem,
  GlobalUserControlRegistration,
  GlobalUserControlRegistrationContext,
  GlobalUserControlSection,
  GlobalUserControlSectionRef
} from "./globalUserControlService";

interface GlobalUserControlLocaleText {
  preferencesSection: string;
  sessionSection: string;
  themeGroup: string;
  languageGroup: string;
  darkTheme: string;
  lightTheme: string;
  chineseLocale: string;
  englishLocale: string;
  signOut: string;
  signOutDescription: string;
}

interface GlobalUserControlResolvedSection {
  id: string;
  label: string;
  order: number;
  items: GlobalUserControlItem[];
}

interface GlobalUserControlResolvedRegistration {
  key: string;
  order: number;
  item: GlobalUserControlItem;
}

function resolveGlobalUserControlLocaleText(locale: GlobalUserControlRegistrationContext["locale"]): GlobalUserControlLocaleText {
  if (locale === "zh") {
    return {
      preferencesSection: "\u504f\u597d\u8bbe\u7f6e",
      sessionSection: "\u4f1a\u8bdd\u4e0e\u5b89\u5168",
      themeGroup: "\u4e3b\u9898",
      languageGroup: "\u8bed\u8a00",
      darkTheme: "\u6697\u8272",
      lightTheme: "\u4eae\u8272",
      chineseLocale: "\u4e2d\u6587",
      englishLocale: "EN",
      signOut: "\u6ce8\u9500",
      signOutDescription: "\u9000\u51fa\u5f53\u524d\u767b\u5f55\u4f1a\u8bdd"
    };
  }

  return {
    preferencesSection: "Preferences",
    sessionSection: "Session",
    themeGroup: "Theme",
    languageGroup: "Language",
    darkTheme: "Dark",
    lightTheme: "Light",
    chineseLocale: "ZH",
    englishLocale: "EN",
    signOut: "Sign Out",
    signOutDescription: "End the current authenticated session"
  };
}

function createDefaultGlobalUserControlRegistrations(
  locale: GlobalUserControlRegistrationContext["locale"]
): GlobalUserControlRegistration[] {
  const text = resolveGlobalUserControlLocaleText(locale);

  return [
    {
      key: "default-preferences-row",
      order: 10,
      resolve: ({ theme, localeControl }) => ({
        kind: "inline-row",
        key: "preferences-inline-row",
        section: {
          id: "preferences",
          label: text.preferencesSection,
          order: 10
        },
        order: 10,
        groups: [
          {
            key: "theme",
            label: text.themeGroup,
            options: [
              {
                key: "theme-dark",
                label: text.darkTheme,
                icon: "moon",
                active: theme.currentMode === "dark",
                disabled: !theme.canSwitch || theme.currentMode === "dark",
                execute: () => theme.switchMode("dark")
              },
              {
                key: "theme-light",
                label: text.lightTheme,
                icon: "sun",
                active: theme.currentMode === "light",
                disabled: !theme.canSwitch || theme.currentMode === "light",
                execute: () => theme.switchMode("light")
              }
            ]
          },
          {
            key: "language",
            label: text.languageGroup,
            options: [
              {
                key: "locale-zh",
                label: text.chineseLocale,
                icon: "translation",
                active: localeControl.currentLocale === "zh",
                disabled: !localeControl.canSwitch || localeControl.currentLocale === "zh",
                execute: () => localeControl.switchLocale("zh")
              },
              {
                key: "locale-en",
                label: text.englishLocale,
                icon: "globe",
                active: localeControl.currentLocale === "en",
                disabled: !localeControl.canSwitch || localeControl.currentLocale === "en",
                execute: () => localeControl.switchLocale("en")
              }
            ]
          }
        ]
      })
    },
    {
      key: "default-session-logout",
      order: 20,
      resolve: ({ auth }) => ({
        kind: "action",
        key: "session-logout",
        section: {
          id: "session",
          label: text.sessionSection,
          order: 20
        },
        order: 10,
        label: text.signOut,
        description: text.signOutDescription,
        icon: "logout",
        tone: "danger",
        active: false,
        disabled: !auth.canLogout,
        execute: () => auth.logout()
      })
    }
  ];
}

function normalizeRegistrationKey(rawKey: string): string {
  return String(rawKey || "").trim();
}

function resolveRegisteredGlobalUserControlItems(
  context: GlobalUserControlRegistrationContext,
  registrations: GlobalUserControlRegistration[]
): GlobalUserControlResolvedRegistration[] {
  const resolved: GlobalUserControlResolvedRegistration[] = [];

  for (const registration of registrations) {
    const normalizedRegistrationKey = normalizeRegistrationKey(registration.key);
    if (!normalizedRegistrationKey) {
      continue;
    }

    const entry = registration.resolve(context);
    if (!entry) {
      continue;
    }

    const items = Array.isArray(entry) ? entry : [entry];
    for (const item of items) {
      const normalizedItemKey = normalizeRegistrationKey(item.key);
      if (!normalizedItemKey) {
        continue;
      }
      resolved.push({
        key: `${normalizedRegistrationKey}:${normalizedItemKey}`,
        order: registration.order,
        item: {
          ...item,
          key: normalizedItemKey
        }
      });
    }
  }

  return resolved;
}

function createResolvedSection(section: GlobalUserControlSectionRef, item: GlobalUserControlItem): GlobalUserControlResolvedSection {
  return {
    id: section.id,
    label: section.label,
    order: section.order,
    items: [item]
  };
}

function sortSectionItems(items: GlobalUserControlItem[]): GlobalUserControlItem[] {
  return [...items].sort((left, right) => {
    if (left.order === right.order) {
      return left.key.localeCompare(right.key);
    }
    return left.order - right.order;
  });
}

function toSectionOutput(section: GlobalUserControlResolvedSection): GlobalUserControlSection {
  return {
    id: section.id,
    label: section.label,
    items: sortSectionItems(section.items)
  };
}

export function buildGlobalUserControlSections(
  context: GlobalUserControlRegistrationContext,
  extraRegistrations: GlobalUserControlRegistration[] = []
): GlobalUserControlSection[] {
  const registry = createGlobalNavigationRegistry<"user-control", GlobalUserControlResolvedRegistration>();
  const registrations = [...createDefaultGlobalUserControlRegistrations(context.locale), ...extraRegistrations];
  const resolvedRegistrations = resolveRegisteredGlobalUserControlItems(context, registrations);

  for (const resolvedRegistration of resolvedRegistrations) {
    registry.register({
      key: resolvedRegistration.key,
      slot: "user-control",
      order: resolvedRegistration.order * 1000 + resolvedRegistration.item.order,
      item: resolvedRegistration
    });
  }

  const sectionMap = new Map<string, GlobalUserControlResolvedSection>();

  for (const resolvedRegistration of registry.resolve("user-control")) {
    const currentSection = sectionMap.get(resolvedRegistration.item.section.id);
    if (currentSection) {
      currentSection.items.push(resolvedRegistration.item);
      continue;
    }

    sectionMap.set(
      resolvedRegistration.item.section.id,
      createResolvedSection(resolvedRegistration.item.section, resolvedRegistration.item)
    );
  }

  return Array.from(sectionMap.values())
    .sort((left, right) => {
      if (left.order === right.order) {
        return left.id.localeCompare(right.id);
      }
      return left.order - right.order;
    })
    .map(toSectionOutput);
}
