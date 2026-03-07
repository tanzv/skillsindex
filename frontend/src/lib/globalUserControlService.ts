import type { AppLocale } from "./i18n";
import type { ThemeMode } from "./themeModePath";
import { buildGlobalUserControlSections } from "./globalUserControlServiceSections";

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

export type GlobalUserControlIconKey =
  | "moon"
  | "sun"
  | "translation"
  | "globe"
  | "logout"
  | "profile"
  | "spark";

export interface GlobalUserControlSectionRef {
  id: string;
  label: string;
  order: number;
}

export interface GlobalUserControlSegmentedOption {
  key: string;
  label: string;
  icon?: GlobalUserControlIconKey;
  active: boolean;
  disabled: boolean;
  execute: () => VoidOrPromise;
}

export interface GlobalUserControlSegmentedGroup {
  key: string;
  label: string;
  options: GlobalUserControlSegmentedOption[];
}

interface GlobalUserControlBaseItem {
  key: string;
  section: GlobalUserControlSectionRef;
  order: number;
}

export interface GlobalUserControlActionItem extends GlobalUserControlBaseItem {
  kind: "action";
  label: string;
  description?: string;
  icon?: GlobalUserControlIconKey;
  active?: boolean;
  disabled: boolean;
  tone?: "default" | "danger";
  execute: () => VoidOrPromise;
}

export interface GlobalUserControlInlineRowItem extends GlobalUserControlBaseItem {
  kind: "inline-row";
  groups: GlobalUserControlSegmentedGroup[];
}

export type GlobalUserControlItem = GlobalUserControlActionItem | GlobalUserControlInlineRowItem;

export interface GlobalUserControlSection {
  id: string;
  label: string;
  items: GlobalUserControlItem[];
}

export interface GlobalUserControlRegistrationContext {
  locale: AppLocale;
  themeMode: ThemeMode;
  theme: GlobalThemeControlService;
  localeControl: GlobalLocaleControlService;
  auth: GlobalAuthControlService;
}

export interface GlobalUserControlRegistration {
  key: string;
  order: number;
  resolve: (context: GlobalUserControlRegistrationContext) => GlobalUserControlItem | GlobalUserControlItem[] | null;
}

export interface GlobalUserControlService {
  localeCode: AppLocale;
  themeMode: ThemeMode;
  theme: GlobalThemeControlService;
  locale: GlobalLocaleControlService;
  auth: GlobalAuthControlService;
  sections: GlobalUserControlSection[];
}

export interface CreateGlobalUserControlServiceInput {
  locale: AppLocale;
  themeMode: ThemeMode;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  onLogout?: () => VoidOrPromise;
  logoutDisabled?: boolean;
  registrations?: GlobalUserControlRegistration[];
}

function isThemeMode(input: string): input is ThemeMode {
  return input === "dark" || input === "light";
}

function isLocale(input: string): input is AppLocale {
  return input === "en" || input === "zh";
}

function buildBaseThemeControlService(
  currentMode: ThemeMode,
  onThemeModeChange?: (nextMode: ThemeMode) => void
): GlobalThemeControlService {
  return {
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
}

function buildBaseLocaleControlService(
  currentLocale: AppLocale,
  onLocaleChange?: (nextLocale: AppLocale) => void
): GlobalLocaleControlService {
  return {
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
}

function buildBaseAuthControlService(
  onLogout?: () => VoidOrPromise,
  logoutDisabled = false
): GlobalAuthControlService {
  return {
    canLogout: typeof onLogout === "function" && !logoutDisabled,
    logout: () => {
      if (!onLogout || logoutDisabled) {
        return;
      }
      return onLogout();
    }
  };
}

export function createGlobalUserControlService({
  locale,
  themeMode,
  onThemeModeChange,
  onLocaleChange,
  onLogout,
  logoutDisabled = false,
  registrations = []
}: CreateGlobalUserControlServiceInput): GlobalUserControlService {
  const theme = buildBaseThemeControlService(themeMode, onThemeModeChange);
  const localeService = buildBaseLocaleControlService(locale, onLocaleChange);
  const auth = buildBaseAuthControlService(onLogout, logoutDisabled);
  const sections = buildGlobalUserControlSections(
    {
      locale,
      themeMode,
      theme,
      localeControl: localeService,
      auth
    },
    registrations
  );

  return {
    localeCode: locale,
    themeMode,
    theme,
    locale: localeService,
    auth,
    sections
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
