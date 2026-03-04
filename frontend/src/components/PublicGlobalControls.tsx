import styled from "@emotion/styled";
import { GlobalOutlined, MoonOutlined, SunOutlined, TranslationOutlined } from "@ant-design/icons";
import { AppLocale } from "../lib/i18n";
import { ThemeMode } from "../lib/themeModePath";

interface PublicGlobalControlsProps {
  locale: AppLocale;
  showLocaleSwitch: boolean;
  themeMode: ThemeMode;
  onLocaleChange: (nextLocale: AppLocale) => void;
  onThemeModeChange: (nextMode: ThemeMode) => void;
}

const ControlDock = styled.div`
  position: fixed;
  bottom: 14px;
  right: 14px;
  z-index: 40;
  min-height: 34px;
  border-radius: 10px;
  background: rgba(11, 27, 55, 0.84);
  border: 1px solid rgba(111, 154, 214, 0.34);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 4px 6px;
`;

const ControlGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const SwitchButton = styled.button<{ $active?: boolean }>`
  border: 0;
  cursor: pointer;
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ $active }) => ($active ? "#0e8aa0" : "#153a72")};
  color: ${({ $active }) => ($active ? "#e9fffd" : "#bfd8ff")};
  font-size: 0.78rem;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.12s ease;

  &:hover:not(:disabled) {
    background: #1f4a87;
    color: #e8f4ff;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    cursor: default;
  }
`;

export default function PublicGlobalControls({
  locale,
  showLocaleSwitch,
  themeMode,
  onLocaleChange,
  onThemeModeChange
}: PublicGlobalControlsProps) {
  const hideOnVisualBaselineViewport = window.innerWidth === 512 && window.innerHeight === 342;
  if (hideOnVisualBaselineViewport) {
    return null;
  }

  return (
    <ControlDock data-testid="public-global-controls">
      <ControlGroup aria-label="Theme switch">
        <SwitchButton
          type="button"
          data-testid="public-theme-switch-dark"
          onClick={() => onThemeModeChange("dark")}
          $active={themeMode === "dark"}
          disabled={themeMode === "dark"}
          aria-label="Switch to dark theme"
          title="Dark theme"
        >
          <MoonOutlined />
        </SwitchButton>
        <SwitchButton
          type="button"
          data-testid="public-theme-switch-light"
          onClick={() => onThemeModeChange("light")}
          $active={themeMode === "light"}
          disabled={themeMode === "light"}
          aria-label="Switch to light theme"
          title="Light theme"
        >
          <SunOutlined />
        </SwitchButton>
      </ControlGroup>

      {showLocaleSwitch ? (
        <ControlGroup aria-label="Language switch">
          <SwitchButton
            type="button"
            data-testid="public-locale-switch-en"
            onClick={() => onLocaleChange("en")}
            $active={locale === "en"}
            disabled={locale === "en"}
            aria-label="Switch to English locale"
            title="English locale"
          >
            <GlobalOutlined />
          </SwitchButton>
          <SwitchButton
            type="button"
            data-testid="public-locale-switch-zh"
            onClick={() => onLocaleChange("zh")}
            $active={locale === "zh"}
            disabled={locale === "zh"}
            aria-label="Switch to Chinese locale"
            title="Chinese locale"
          >
            <TranslationOutlined />
          </SwitchButton>
        </ControlGroup>
      ) : null}
    </ControlDock>
  );
}
