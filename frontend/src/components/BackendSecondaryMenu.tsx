import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Menu } from "antd";

import type { NavigationItem, ProtectedRoute } from "../appNavigationConfig";

import { buildSecondaryNavGlyph } from "./BackendWorkbenchShell.helpers";

interface BackendSecondaryMenuProps {
  activeRoute: ProtectedRoute;
  sectionLabel: string;
  items: NavigationItem[];
  collapsed: boolean;
  canCollapse: boolean;
  onNavigate: (path: ProtectedRoute) => void;
  onToggleCollapse: () => void;
}

export default function BackendSecondaryMenu({
  activeRoute,
  sectionLabel,
  items,
  collapsed,
  canCollapse,
  onNavigate,
  onToggleCollapse
}: BackendSecondaryMenuProps) {
  return (
    <aside
      className={`backend-secondary-nav${collapsed ? " is-collapsed" : ""}`}
      aria-label="Backend secondary navigation"
    >
      <div className="backend-secondary-header">
        <div className="backend-secondary-header-row">
          <div className="backend-secondary-heading">
            <span className="backend-secondary-eyebrow">Current Domain</span>
            <p className="backend-secondary-title">{sectionLabel}</p>
          </div>
          {canCollapse ? (
            <button
              type="button"
              className="backend-secondary-collapse-toggle"
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand section sidebar" : "Collapse section sidebar"}
              data-testid="backend-secondary-collapse-toggle"
              onClick={onToggleCollapse}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
          ) : null}
        </div>
      </div>
      <Menu
        className="backend-secondary-list"
        mode="inline"
        inlineCollapsed={collapsed}
        inlineIndent={0}
        selectedKeys={[activeRoute]}
        onClick={({ key }) => onNavigate(key as ProtectedRoute)}
        items={items.map((item) => {
          const active = item.path === activeRoute;

          return {
            key: item.path,
            className: active ? "backend-secondary-item active" : "backend-secondary-item",
            icon: (
              <span className="backend-secondary-item-glyph" aria-hidden="true">
                {buildSecondaryNavGlyph(item.title)}
              </span>
            ),
            label: (
              <span
                className="backend-secondary-item-copy"
                aria-current={active ? "page" : undefined}
                aria-label={`${item.title}. ${item.subtitle}`}
              >
                <strong>{item.title}</strong>
                <span>{item.subtitle}</span>
              </span>
            ),
            title: item.title
          };
        })}
      />
    </aside>
  );
}
