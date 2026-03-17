import type { AppLocale } from "../../lib/i18n";

export interface OrganizationCenterPageProps {
  locale: AppLocale;
  currentPath: string;
  onNavigate: (path: string) => void;
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
