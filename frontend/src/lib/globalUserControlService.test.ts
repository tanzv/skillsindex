import { describe, expect, it, vi } from "vitest";

import {
  buildGlobalUserControlCommands,
  createGlobalUserControlService
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
  });
});
