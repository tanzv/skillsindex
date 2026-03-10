import {
  DownOutlined,
  GlobalOutlined,
  LogoutOutlined,
  MoonOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  SunOutlined,
  TranslationOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Dropdown, type DropdownProps } from "antd";
import { useCallback, useMemo } from "react";

import type {
  GlobalUserControlActionItem,
  GlobalUserControlIconKey,
  GlobalUserControlInlineRowItem,
  GlobalUserControlSection,
  GlobalUserControlService
} from "../lib/globalUserControlService";
import { resolveAvatarInitials } from "./ExpandableNavBar.helpers";

export interface GlobalUserControlDropdownProps {
  service: GlobalUserControlService;
  displayName: string;
  subtitle?: string;
  avatarFallback?: string;
  triggerAriaLabel?: string;
  triggerDataTestId?: string;
  overlayClassName?: string;
  triggerClassName?: string;
  avatarClassName?: string;
  metaClassName?: string;
  iconClassName?: string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  placement?: DropdownProps["placement"];
}

function resolvePanelAriaLabel(locale: GlobalUserControlService["localeCode"]): string {
  return locale === "zh" ? "\u7528\u6237\u4e2d\u5fc3\u9762\u677f" : "User center panel";
}

function resolveIcon(icon: GlobalUserControlIconKey | undefined): JSX.Element | null {
  if (icon === "moon") {
    return <MoonOutlined />;
  }
  if (icon === "sun") {
    return <SunOutlined />;
  }
  if (icon === "translation") {
    return <TranslationOutlined />;
  }
  if (icon === "globe") {
    return <GlobalOutlined />;
  }
  if (icon === "logout") {
    return <LogoutOutlined />;
  }
  if (icon === "profile") {
    return <UserOutlined />;
  }
  if (icon === "spark") {
    return <SafetyCertificateOutlined />;
  }
  return null;
}

function renderSectionItem(
  item: GlobalUserControlActionItem | GlobalUserControlInlineRowItem,
  onActionExecute: (execute: () => void | Promise<void>) => void
): JSX.Element {
  if (item.kind === "inline-row") {
    return (
      <div key={item.key} className="workspace-topbar-user-inline-row" data-item-key={item.key}>
        {item.groups.map((group) => (
          <div key={group.key} className="workspace-topbar-user-segmented-group" data-group-key={group.key}>
            <span className="workspace-topbar-user-segmented-label">{group.label}</span>
            <div className="workspace-topbar-user-segmented-options" role="group" aria-label={group.label}>
              {group.options.map((option) => {
                const optionIcon = resolveIcon(option.icon);
                const optionClassName = [
                  "workspace-topbar-user-segmented-option",
                  option.active ? "is-active" : "",
                  option.disabled ? "is-disabled" : ""
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={option.key}
                    type="button"
                    className={optionClassName}
                    onClick={() => onActionExecute(option.execute)}
                    disabled={option.disabled}
                    aria-pressed={option.active}
                  >
                    {optionIcon ? <span className="workspace-topbar-user-segmented-option-icon">{optionIcon}</span> : null}
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const icon = resolveIcon(item.icon);
  const actionClassName = [
    "workspace-topbar-user-action",
    item.active ? "is-active" : "",
    item.tone === "danger" ? "is-danger" : "",
    item.disabled ? "is-disabled" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      key={item.key}
      type="button"
      className={actionClassName}
      onClick={() => onActionExecute(item.execute)}
      disabled={item.disabled}
    >
      <span className="workspace-topbar-user-action-leading">
        {icon ? <span className="workspace-topbar-user-action-icon">{icon}</span> : null}
        <span className="workspace-topbar-user-action-copy">
          <strong>{item.label}</strong>
          {item.description ? <small>{item.description}</small> : null}
        </span>
      </span>
      <RightOutlined className="workspace-topbar-user-action-arrow" />
    </button>
  );
}

function renderSections(
  sections: GlobalUserControlSection[],
  onActionExecute: (execute: () => void | Promise<void>) => void
): JSX.Element[] {
  return sections.map((section) => (
    <section key={section.id} className="workspace-topbar-user-section" data-section-id={section.id}>
      <p className="workspace-topbar-user-section-label">{section.label}</p>
      <div className="workspace-topbar-user-section-body">
        {section.items.map((item) => renderSectionItem(item, onActionExecute))}
      </div>
    </section>
  ));
}

export default function GlobalUserControlDropdown({
  service,
  displayName,
  subtitle = "",
  avatarFallback = "WU",
  triggerAriaLabel,
  triggerDataTestId = "workspace-user-center-trigger",
  overlayClassName = "workspace-topbar-user-dropdown",
  triggerClassName = "workspace-topbar-user-trigger",
  avatarClassName = "workspace-topbar-avatar",
  metaClassName = "workspace-topbar-user-meta",
  iconClassName = "workspace-topbar-user-icon",
  onOpenChange,
  open,
  placement = "bottomRight"
}: GlobalUserControlDropdownProps) {
  const initials = useMemo(() => resolveAvatarInitials(displayName, avatarFallback), [avatarFallback, displayName]);
  const resolvedTriggerClassName = [triggerClassName, open ? "is-open" : ""].filter(Boolean).join(" ");
  const panelAriaLabel = useMemo(() => resolvePanelAriaLabel(service.localeCode), [service.localeCode]);
  const effectiveTriggerAriaLabel = triggerAriaLabel || panelAriaLabel;

  const handleActionExecute = useCallback((execute: () => void | Promise<void>): void => {
    onOpenChange?.(false);
    void execute();
  }, [onOpenChange]);

  const panelContent = useMemo(
    () => (
      <div className="workspace-topbar-user-panel" data-testid="workspace-user-center-panel" role="dialog" aria-label={panelAriaLabel}>
        <div className="workspace-topbar-user-panel-header">
          <span className={`${avatarClassName} is-panel-avatar`} aria-hidden="true">
            {initials}
          </span>
          <div className="workspace-topbar-user-panel-meta">
            <strong>{displayName}</strong>
            {subtitle ? <small>{subtitle}</small> : null}
          </div>
        </div>
        <div className="workspace-topbar-user-panel-sections">{renderSections(service.sections, handleActionExecute)}</div>
      </div>
    ),
    [avatarClassName, displayName, handleActionExecute, initials, panelAriaLabel, service.sections, subtitle]
  );

  return (
    <Dropdown
      menu={{ items: [] }}
      popupRender={() => panelContent}
      trigger={["click"]}
      placement={placement}
      classNames={{ root: overlayClassName }}
      onOpenChange={onOpenChange}
      open={open}
      destroyOnHidden={false}
    >
      <button
        type="button"
        className={resolvedTriggerClassName}
        aria-label={effectiveTriggerAriaLabel}
        aria-haspopup="dialog"
        aria-expanded={open === undefined ? undefined : open}
        data-testid={triggerDataTestId}
      >
        <span className={avatarClassName} aria-hidden="true">
          {initials}
        </span>
        <span className={metaClassName}>
          <strong>{displayName}</strong>
          {subtitle ? <small>{subtitle}</small> : null}
        </span>
        <DownOutlined className={iconClassName} />
      </button>
    </Dropdown>
  );
}
