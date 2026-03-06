import type { SessionUser } from "../lib/api";
import type { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";

export interface OrganizationCenterPageProps {
  locale: AppLocale;
  currentPath: string;
  onNavigate: (path: string) => void;
  sessionUser?: SessionUser | null;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
  onLogout?: () => Promise<void> | void;
}

export interface OrganizationItem {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  organization_id: number;
  user_id: number;
  username: string;
  user_role: string;
  user_status: string;
  role: string;
  created_at: string;
  updated_at: string;
}
