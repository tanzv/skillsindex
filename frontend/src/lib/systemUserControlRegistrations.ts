import { normalizeAppRoute } from "./appPathnameResolver";
import type { AppLocale } from "./i18n";
import type {
  GlobalUserControlActionItem,
  GlobalUserControlRegistration,
  GlobalUserControlSectionRef
} from "./globalUserControlService";

interface SystemUserControlCopy {
  sectionLabel: string;
  accountCenterLabel: string;
  accountCenterDescription: string;
  securityLabel: string;
  securityDescription: string;
  sessionsLabel: string;
  sessionsDescription: string;
  credentialsLabel: string;
  credentialsDescription: string;
}

export interface CreateSystemUserControlRegistrationsInput {
  onNavigate: (path: string) => void;
  currentPath?: string;
  profilePath?: string;
  securityPath?: string;
  sessionsPath?: string;
  credentialsPath?: string;
}

interface UserControlRouteItem {
  key: string;
  order: number;
  label: string;
  description: string;
  icon?: GlobalUserControlActionItem["icon"];
  targetPath: string;
}

const ACCOUNT_SECTION_ORDER = 15;
const DEFAULT_PROFILE_PATH = "/account/profile";
const DEFAULT_SECURITY_PATH = "/account/security";
const DEFAULT_SESSIONS_PATH = "/account/sessions";
const DEFAULT_CREDENTIALS_PATH = "/account/api-credentials";

function resolveSystemUserControlCopy(locale: AppLocale): SystemUserControlCopy {
  if (locale === "zh") {
    return {
      sectionLabel: "\u8d26\u6237",
      accountCenterLabel: "\u8d26\u6237\u4e2d\u5fc3",
      accountCenterDescription: "\u7ba1\u7406\u4e2a\u4eba\u8d44\u6599\u4e0e\u8054\u7cfb\u65b9\u5f0f",
      securityLabel: "\u5b89\u5168\u8bbe\u7f6e",
      securityDescription: "\u68c0\u67e5\u5bc6\u7801\u7b56\u7565\u4e0e\u9a8c\u8bc1\u8bbe\u7f6e",
      sessionsLabel: "\u4f1a\u8bdd\u7ba1\u7406",
      sessionsDescription: "\u67e5\u770b\u6d3b\u8dc3\u8bbe\u5907\u5e76\u64a4\u9500\u5386\u53f2\u4f1a\u8bdd",
      credentialsLabel: "API \u51ed\u8bc1",
      credentialsDescription: "\u521b\u5efa\u548c\u7ef4\u62a4\u7528\u4e8e OpenAPI \u7684\u4e2a\u4eba\u51ed\u8bc1"
    };
  }

  return {
    sectionLabel: "Account",
    accountCenterLabel: "Account Center",
    accountCenterDescription: "Manage profile details and contact information",
    securityLabel: "Security",
    securityDescription: "Review password controls and authentication settings",
    sessionsLabel: "Sessions",
    sessionsDescription: "Inspect active devices and revoke existing sessions",
    credentialsLabel: "API Credentials",
    credentialsDescription: "Create and manage personal OpenAPI credentials"
  };
}

function stripAccountRouteFamilyPrefix(pathname: string): string {
  return pathname.replace(/^\/(?:mobile\/(?:light\/)?|light\/)(?=account(?:\/|$))/, "/");
}

function resolveActiveRoute(currentPath: string | undefined): string {
  const normalizedPath = stripAccountRouteFamilyPrefix(String(currentPath || "").trim());
  if (!normalizedPath) {
    return "";
  }

  try {
    return normalizeAppRoute(normalizedPath);
  } catch {
    return normalizedPath;
  }
}

function createAccountSection(locale: AppLocale): GlobalUserControlSectionRef {
  const copy = resolveSystemUserControlCopy(locale);

  return {
    id: "account",
    label: copy.sectionLabel,
    order: ACCOUNT_SECTION_ORDER
  };
}

function createRouteActionItem(
  section: GlobalUserControlSectionRef,
  routeItem: UserControlRouteItem,
  activeRoute: string,
  onNavigate: (path: string) => void
): GlobalUserControlActionItem {
  return {
    kind: "action",
    key: routeItem.key,
    section,
    order: routeItem.order,
    label: routeItem.label,
    description: routeItem.description,
    icon: routeItem.icon,
    active: activeRoute === routeItem.targetPath,
    disabled: false,
    execute: () => onNavigate(routeItem.targetPath)
  };
}

export function createSystemUserControlRegistrations({
  onNavigate,
  currentPath,
  profilePath = DEFAULT_PROFILE_PATH,
  securityPath = DEFAULT_SECURITY_PATH,
  sessionsPath = DEFAULT_SESSIONS_PATH,
  credentialsPath = DEFAULT_CREDENTIALS_PATH
}: CreateSystemUserControlRegistrationsInput): GlobalUserControlRegistration[] {
  const activeRoute = resolveActiveRoute(currentPath);

  return [
    {
      key: "system-account-navigation",
      order: ACCOUNT_SECTION_ORDER,
      resolve: ({ locale }) => {
        const copy = resolveSystemUserControlCopy(locale);
        const section = createAccountSection(locale);
        const routeItems: UserControlRouteItem[] = [
          {
            key: "account-center",
            order: 10,
            label: copy.accountCenterLabel,
            description: copy.accountCenterDescription,
            icon: "profile",
            targetPath: profilePath
          },
          {
            key: "account-security",
            order: 20,
            label: copy.securityLabel,
            description: copy.securityDescription,
            icon: "spark",
            targetPath: securityPath
          },
          {
            key: "account-sessions",
            order: 30,
            label: copy.sessionsLabel,
            description: copy.sessionsDescription,
            targetPath: sessionsPath
          },
          {
            key: "account-api-credentials",
            order: 40,
            label: copy.credentialsLabel,
            description: copy.credentialsDescription,
            icon: "spark",
            targetPath: credentialsPath
          }
        ];

        return routeItems.map((routeItem) => createRouteActionItem(section, routeItem, activeRoute, onNavigate));
      }
    }
  ];
}
