import { describe, expect, it, vi } from "vitest";

import {
  buildGlobalUserControlCommands,
  createGlobalUserControlService,
  type GlobalUserControlRegistration
} from "./globalUserControlService";

describe("globalUserControlService", () => {
  it("builds executable commands for theme, locale, and logout", async () => {
    const onThemeModeChange = vi.fn();
    const onLocaleChange = vi.fn();
    const onLogout = vi.fn();

    const service = createGlobalUserControlService({
      locale: "zh",
      themeMode: "dark",
      onThemeModeChange,
      onLocaleChange,
      onLogout
    });

    const commands = buildGlobalUserControlCommands(service);
    const themeDark = commands.find((command) => command.key === "theme-dark");
    const themeLight = commands.find((command) => command.key === "theme-light");
    const localeZh = commands.find((command) => command.key === "locale-zh");
    const localeEn = commands.find((command) => command.key === "locale-en");
    const logout = commands.find((command) => command.key === "logout");

    expect(themeDark?.disabled).toBe(true);
    expect(themeLight?.disabled).toBe(false);
    expect(localeZh?.disabled).toBe(true);
    expect(localeEn?.disabled).toBe(false);
    expect(logout?.disabled).toBe(false);

    themeDark?.execute();
    themeLight?.execute();
    localeZh?.execute();
    localeEn?.execute();
    await logout?.execute();

    expect(onThemeModeChange).toHaveBeenCalledTimes(1);
    expect(onThemeModeChange).toHaveBeenCalledWith("light");
    expect(onLocaleChange).toHaveBeenCalledTimes(1);
    expect(onLocaleChange).toHaveBeenCalledWith("en");
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("builds default sections with an inline preferences row and session action", () => {
    const service = createGlobalUserControlService({
      locale: "en",
      themeMode: "light",
      onThemeModeChange: vi.fn(),
      onLocaleChange: vi.fn(),
      onLogout: vi.fn()
    });

    expect(service.sections.map((section) => section.id)).toEqual(["preferences", "session"]);

    const preferencesSection = service.sections[0];
    const preferencesItem = preferencesSection?.items[0];
    expect(preferencesItem?.kind).toBe("inline-row");
    if (!preferencesItem || preferencesItem.kind !== "inline-row") {
      throw new Error("Expected inline-row preferences item");
    }

    expect(preferencesItem.groups.map((group) => group.key)).toEqual(["theme", "language"]);
    expect(preferencesItem.groups[0]?.options.map((option) => option.key)).toEqual(["theme-dark", "theme-light"]);
    expect(preferencesItem.groups[1]?.options.map((option) => option.key)).toEqual(["locale-zh", "locale-en"]);
    expect(preferencesItem.groups[0]?.options[1]?.active).toBe(true);
    expect(preferencesItem.groups[1]?.options[1]?.active).toBe(true);

    const sessionSection = service.sections[1];
    const logoutItem = sessionSection?.items[0];
    expect(logoutItem?.kind).toBe("action");
    if (!logoutItem || logoutItem.kind !== "action") {
      throw new Error("Expected action item for session section");
    }
    expect(logoutItem.label).toBe("Sign Out");
    expect(logoutItem.disabled).toBe(false);
  });

  it("merges custom registrations into ordered sections", () => {
    const registrations: GlobalUserControlRegistration[] = [
      {
        key: "workspace-shortcuts",
        order: 15,
        resolve: () => ({
          kind: "action",
          key: "account-center",
          section: {
            id: "workspace",
            label: "Workspace",
            order: 15
          },
          order: 10,
          label: "Account Center",
          description: "Open profile and security settings",
          icon: "profile",
          disabled: false,
          execute: () => undefined
        })
      },
      {
        key: "workspace-audit",
        order: 16,
        resolve: () => ({
          kind: "action",
          key: "recent-events",
          section: {
            id: "workspace",
            label: "Workspace",
            order: 15
          },
          order: 20,
          label: "Recent Events",
          disabled: false,
          execute: () => undefined
        })
      }
    ];

    const service = createGlobalUserControlService({
      locale: "en",
      themeMode: "dark",
      registrations
    });

    expect(service.sections.map((section) => section.id)).toEqual(["preferences", "workspace", "session"]);
    expect(service.sections[1]?.items.map((item) => item.key)).toEqual(["account-center", "recent-events"]);
  });

  it("disables commands when callbacks are missing", () => {
    const service = createGlobalUserControlService({
      locale: "en",
      themeMode: "light"
    });

    const commands = buildGlobalUserControlCommands(service);
    expect(commands.every((command) => command.disabled)).toBe(true);
  });

  it("disables logout command when logout is explicitly disabled", async () => {
    const onLogout = vi.fn();
    const service = createGlobalUserControlService({
      locale: "en",
      themeMode: "dark",
      onLogout,
      logoutDisabled: true
    });

    const commands = buildGlobalUserControlCommands(service);
    const logoutCommand = commands.find((command) => command.key === "logout");
    expect(logoutCommand?.disabled).toBe(true);

    await logoutCommand?.execute();
    expect(onLogout).not.toHaveBeenCalled();

    const sessionItem = service.sections[1]?.items[0];
    expect(sessionItem?.kind).toBe("action");
    if (!sessionItem || sessionItem.kind !== "action") {
      throw new Error("Expected action item for session section");
    }
    expect(sessionItem.disabled).toBe(true);
  });
});
