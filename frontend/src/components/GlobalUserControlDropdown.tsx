import {
  GlobalOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  TranslationOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Dropdown, type MenuProps } from "antd";
import { useMemo } from "react";

import {
  buildGlobalUserControlCommands,
  type GlobalUserControlCommand,
  type GlobalUserControlCommandKey,
  type GlobalUserControlService
} from "../lib/globalUserControlService";
import { resolveAvatarInitials } from "./ExpandableNavBar.helpers";

interface GlobalUserControlLabels {
  themeGroup: string;
  localeGroup: string;
  sessionGroup: string;
  darkTheme: string;
  lightTheme: string;
  chineseLocale: string;
  englishLocale: string;
  signOut: string;
}

const defaultLabels: GlobalUserControlLabels = {
  themeGroup: "Theme",
  localeGroup: "Language",
  sessionGroup: "Session",
  darkTheme: "Dark Theme",
  lightTheme: "Light Theme",
  chineseLocale: "Chinese",
  englishLocale: "English",
  signOut: "Sign Out"
};

const commandIconMap: Record<GlobalUserControlCommandKey, JSX.Element> = {
  "theme-dark": <MoonOutlined />,
  "theme-light": <SunOutlined />,
  "locale-zh": <TranslationOutlined />,
  "locale-en": <GlobalOutlined />,
  logout: <LogoutOutlined />
};

const commandGroupOrder: GlobalUserControlCommand["group"][] = ["theme", "locale", "session"];

export interface GlobalUserControlDropdownProps {
  service: GlobalUserControlService;
  displayName: string;
  subtitle?: string;
  avatarFallback?: string;
  labels?: Partial<GlobalUserControlLabels>;
  triggerAriaLabel?: string;
  triggerDataTestId?: string;
  overlayClassName?: string;
  triggerClassName?: string;
  avatarClassName?: string;
  metaClassName?: string;
  iconClassName?: string;
  menuGroupClassName?: string;
  menuItemClassName?: string;
}

function resolveGroupLabel(
  group: GlobalUserControlCommand["group"],
  labels: GlobalUserControlLabels
): string {
  if (group === "theme") {
    return labels.themeGroup;
  }
  if (group === "locale") {
    return labels.localeGroup;
  }
  return labels.sessionGroup;
}

function resolveCommandLabel(
  key: GlobalUserControlCommandKey,
  labels: GlobalUserControlLabels
): string {
  if (key === "theme-dark") {
    return labels.darkTheme;
  }
  if (key === "theme-light") {
    return labels.lightTheme;
  }
  if (key === "locale-zh") {
    return labels.chineseLocale;
  }
  if (key === "locale-en") {
    return labels.englishLocale;
  }
  return labels.signOut;
}

function buildMenuItems(
  commands: GlobalUserControlCommand[],
  labels: GlobalUserControlLabels,
  menuGroupClassName: string,
  menuItemClassName: string
): MenuProps["items"] {
  const groupedCommands = new Map<GlobalUserControlCommand["group"], GlobalUserControlCommand[]>();
  for (const command of commands) {
    const currentGroupCommands = groupedCommands.get(command.group) || [];
    currentGroupCommands.push(command);
    groupedCommands.set(command.group, currentGroupCommands);
  }

  return commandGroupOrder
    .map((group) => {
      const items = groupedCommands.get(group) || [];
      if (items.length === 0) {
        return null;
      }
      return {
        type: "group" as const,
        label: <span className={menuGroupClassName}>{resolveGroupLabel(group, labels)}</span>,
        children: items.map((command) => ({
          key: command.key,
          icon: commandIconMap[command.key],
          disabled: command.disabled,
          label: (
            <span className={`${menuItemClassName}${command.active ? " is-active" : ""}`}>
              {resolveCommandLabel(command.key, labels)}
            </span>
          )
        }))
      };
    })
    .filter(Boolean);
}

export default function GlobalUserControlDropdown({
  service,
  displayName,
  subtitle = "",
  avatarFallback = "WU",
  labels,
  triggerAriaLabel = "Open user center menu",
  triggerDataTestId = "workspace-user-center-trigger",
  overlayClassName = "workspace-topbar-user-dropdown",
  triggerClassName = "workspace-topbar-user-trigger",
  avatarClassName = "workspace-topbar-avatar",
  metaClassName = "workspace-topbar-user-meta",
  iconClassName = "workspace-topbar-user-icon",
  menuGroupClassName = "workspace-topbar-user-menu-group",
  menuItemClassName = "workspace-topbar-user-menu-item"
}: GlobalUserControlDropdownProps) {
  const resolvedLabels: GlobalUserControlLabels = useMemo(
    () => ({ ...defaultLabels, ...(labels || {}) }),
    [labels]
  );
  const userCommands = useMemo(() => buildGlobalUserControlCommands(service), [service]);
  const commandByKey = useMemo(
    () => new Map(userCommands.map((command) => [command.key, command])),
    [userCommands]
  );
  const menuItems = useMemo(
    () => buildMenuItems(userCommands, resolvedLabels, menuGroupClassName, menuItemClassName),
    [menuGroupClassName, menuItemClassName, resolvedLabels, userCommands]
  );
  const initials = useMemo(() => resolveAvatarInitials(displayName, avatarFallback), [avatarFallback, displayName]);

  const menu = useMemo<MenuProps>(
    () => ({
      items: menuItems,
      onClick: ({ key }) => {
        const command = commandByKey.get(String(key) as GlobalUserControlCommandKey);
        if (!command || command.disabled) {
          return;
        }
        void command.execute();
      }
    }),
    [commandByKey, menuItems]
  );

  return (
    <Dropdown menu={menu} trigger={["click"]} placement="bottomLeft" classNames={{ root: overlayClassName }}>
      <button
        type="button"
        className={triggerClassName}
        aria-label={triggerAriaLabel}
        data-testid={triggerDataTestId}
      >
        <span className={avatarClassName} aria-hidden="true">
          {initials}
        </span>
        <span className={metaClassName}>
          <strong>{displayName}</strong>
          {subtitle ? <small>{subtitle}</small> : null}
        </span>
        <UserOutlined className={iconClassName} />
      </button>
    </Dropdown>
  );
}
