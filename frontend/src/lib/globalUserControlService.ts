import type { AppLocale } from "./i18n";
import type { ThemeMode } from "./themeModePath";

type VoidOrPromise = void | Promise<void>;

export interface GlobalThemeControlService {
  currentMode: ThemeMode;
  canSwitch: boolean;
  switchMode: (nextMode: ThemeMode) => void;
}

export interface GlobalLocaleControlService {
  currentLocale: AppLocale;
  canSwitch: boolean;
  switchLocale: (nextLocale: AppLocale) => void;
}

export interface GlobalAuthControlService {
  canLogout: boolean;
  logout: () => VoidOrPromise;
}

export interface GlobalUserControlService {
  theme: GlobalThemeControlService;
  locale: GlobalLocaleControlService;
  auth: GlobalAuthControlService;
}

export interface CreateGlobalUserControlServiceInput {
  locale: AppLocale;
  themeMode: ThemeMode;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  onLogout?: () => VoidOrPromise;
  logoutDisabled?: boolean;
}

export type GlobalUserControlCommandKey =
  | "theme-dark"
  | "theme-light"
  | "locale-zh"
  | "locale-en"
  | "logout";

export type GlobalUserControlCommandGroup = "theme" | "locale" | "session";

export interface GlobalUserControlCommand {
  key: GlobalUserControlCommandKey;
  group: GlobalUserControlCommandGroup;
  active: boolean;
  disabled: boolean;
  execute: () => VoidOrPromise;
}

function isThemeMode(input: string): input is ThemeMode {
  return input === "dark" || input === "light";
}

function isLocale(input: string): input is AppLocale {
  return input === "en" || input === "zh";
}

export function createGlobalUserControlService({
  locale,
  themeMode,
  onThemeModeChange,
  onLocaleChange,
  onLogout,
  logoutDisabled = false
}: CreateGlobalUserControlServiceInput): GlobalUserControlService {
  const currentMode = themeMode;
  const currentLocale = locale;

  const theme: GlobalThemeControlService = {
    currentMode,
    canSwitch: typeof onThemeModeChange === "function",
    switchMode: (nextMode) => {
      const normalizedMode = String(nextMode || "").trim().toLowerCase();
      if (!isThemeMode(normalizedMode) || normalizedMode === currentMode || !onThemeModeChange) {
        return;
      }
      onThemeModeChange(normalizedMode);
    }
  };

  const localeService: GlobalLocaleControlService = {
    currentLocale,
    canSwitch: typeof onLocaleChange === "function",
    switchLocale: (nextLocale) => {
      const normalizedLocale = String(nextLocale || "").trim().toLowerCase();
      if (!isLocale(normalizedLocale) || normalizedLocale === currentLocale || !onLocaleChange) {
        return;
      }
      onLocaleChange(normalizedLocale);
    }
  };

  const auth: GlobalAuthControlService = {
    canLogout: typeof onLogout === "function" && !logoutDisabled,
    logout: () => {
      if (!onLogout || logoutDisabled) {
        return;
      }
      return onLogout();
    }
  };

  return {
    theme,
    locale: localeService,
    auth
  };
}

export function buildGlobalUserControlCommands(service: GlobalUserControlService): GlobalUserControlCommand[] {
  return [
    {
      key: "theme-dark",
      group: "theme",
      active: service.theme.currentMode === "dark",
      disabled: !service.theme.canSwitch || service.theme.currentMode === "dark",
      execute: () => service.theme.switchMode("dark")
    },
    {
      key: "theme-light",
      group: "theme",
      active: service.theme.currentMode === "light",
      disabled: !service.theme.canSwitch || service.theme.currentMode === "light",
      execute: () => service.theme.switchMode("light")
    },
    {
      key: "locale-zh",
      group: "locale",
      active: service.locale.currentLocale === "zh",
      disabled: !service.locale.canSwitch || service.locale.currentLocale === "zh",
      execute: () => service.locale.switchLocale("zh")
    },
    {
      key: "locale-en",
      group: "locale",
      active: service.locale.currentLocale === "en",
      disabled: !service.locale.canSwitch || service.locale.currentLocale === "en",
      execute: () => service.locale.switchLocale("en")
    },
    {
      key: "logout",
      group: "session",
      active: false,
      disabled: !service.auth.canLogout,
      execute: () => service.auth.logout()
    }
  ];
}
