import { GlobalOutlined, MoonOutlined, SunOutlined, TranslationOutlined } from "@ant-design/icons";
import type { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";

interface MarketplaceHomeLocaleThemeSwitchProps {
  locale: AppLocale;
  currentThemeMode: ThemeMode;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
}

export default function MarketplaceHomeLocaleThemeSwitch({
  locale,
  currentThemeMode,
  onThemeModeChange,
  onLocaleChange
}: MarketplaceHomeLocaleThemeSwitchProps) {
  return (
    <div className="marketplace-topbar-locale-switch" role="group" aria-label="Language switch">
      <div className="marketplace-topbar-theme-switch" role="group" aria-label="Theme switch">
        <button
          type="button"
          className={`is-theme-toggle is-icon-toggle${currentThemeMode === "dark" ? " is-active" : ""}`}
          onClick={() => onThemeModeChange?.("dark")}
          disabled={currentThemeMode === "dark"}
          aria-label="Switch to dark theme"
          title="Dark theme"
          data-testid="topbar-theme-switch-dark"
        >
          <MoonOutlined />
        </button>
        <button
          type="button"
          className={`is-theme-toggle is-icon-toggle${currentThemeMode === "light" ? " is-active" : ""}`}
          onClick={() => onThemeModeChange?.("light")}
          disabled={currentThemeMode === "light"}
          aria-label="Switch to light theme"
          title="Light theme"
          data-testid="topbar-theme-switch-light"
        >
          <SunOutlined />
        </button>
      </div>
      <button
        type="button"
        className={`is-icon-toggle${locale === "zh" ? " is-active" : ""}`}
        onClick={() => onLocaleChange?.("zh")}
        disabled={locale === "zh"}
        aria-label="Switch to Chinese locale"
        title="Chinese"
        data-testid="topbar-locale-switch-zh"
      >
        <TranslationOutlined />
      </button>
      <button
        type="button"
        className={`is-icon-toggle${locale === "en" ? " is-active" : ""}`}
        onClick={() => onLocaleChange?.("en")}
        disabled={locale === "en"}
        aria-label="Switch to English locale"
        title="English"
        data-testid="topbar-locale-switch-en"
      >
        <GlobalOutlined />
      </button>
    </div>
  );
}
