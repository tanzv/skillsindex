import { ConfigProvider } from "antd";

import type { SessionUser } from "../lib/api";
import type { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";
import type { ProtectedRoute } from "../appNavigationConfig";

import AppProtectedRouteView from "./AppProtectedRouteView";
import AppProtectedWorkbenchLayout from "./AppProtectedWorkbenchLayout";
import type { AppTextDictionary } from "./AppRoot.shared";

interface AppProtectedRouteRendererProps {
  route: ProtectedRoute;
  locale: AppLocale;
  themeMode: ThemeMode;
  submitLoading: boolean;
  sessionUser: SessionUser;
  text: AppTextDictionary;
  onNavigate: (path: string) => void;
  onLocaleChange: (nextLocale: AppLocale) => void;
  onThemeModeChange: (nextMode: ThemeMode) => void;
  onLogout: () => void;
}

const protectedTheme = {
  token: {
    colorPrimary: "#0e8aa0",
    borderRadius: 12,
    fontFamily: '"Noto Sans SC", "Manrope", sans-serif'
  }
};

export default function AppProtectedRouteRenderer(props: AppProtectedRouteRendererProps) {
  return (
    <ConfigProvider theme={protectedTheme}>
      <AppProtectedWorkbenchLayout
        route={props.route}
        locale={props.locale}
        themeMode={props.themeMode}
        submitLoading={props.submitLoading}
        sessionUser={props.sessionUser}
        text={props.text}
        onNavigate={props.onNavigate}
        onLocaleChange={props.onLocaleChange}
        onThemeModeChange={props.onThemeModeChange}
        onLogout={props.onLogout}
      >
        <AppProtectedRouteView
          route={props.route}
          locale={props.locale}
          sessionUser={props.sessionUser}
          onNavigate={props.onNavigate}
          onLocaleChange={props.onLocaleChange}
          onThemeModeChange={props.onThemeModeChange}
          onLogout={props.onLogout}
        />
      </AppProtectedWorkbenchLayout>
    </ConfigProvider>
  );
}
