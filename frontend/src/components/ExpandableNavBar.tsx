import { useMemo, useState } from "react";
import styled from "@emotion/styled";
import {
  resolveAvatarInitials,
  resolveVisibleNavigationItems,
  type ExpandableNavItem
} from "./ExpandableNavBar.helpers";

export interface ExpandableNavUserInfo {
  displayName: string;
  subtitle?: string;
  avatarUrl?: string;
  avatarAlt?: string;
  avatarFallbackText?: string;
}

export interface ExpandableNavBarProps {
  items: ExpandableNavItem[];
  userInfo: ExpandableNavUserInfo;
  collapsedVisibleCount?: number;
  defaultExpanded?: boolean;
  navAriaLabel?: string;
  moreLabel?: string;
  lessLabel?: string;
  className?: string;
  onToggleExpand?: (isExpanded: boolean) => void;
}

const Root = styled.header`
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(15, 23, 42, 0.62);
  backdrop-filter: blur(10px);
`;

const NavigationBlock = styled.div`
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
`;

const NavigationList = styled.nav<{ $expanded: boolean }>`
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: ${({ $expanded }) => ($expanded ? "wrap" : "nowrap")};
  overflow: hidden;
`;

const navActionStyles = `
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 6px 12px;
  border-radius: 9px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(15, 23, 42, 0.22);
  color: #f8fafc;
  font-size: 0.86rem;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.26);
    border-color: rgba(96, 165, 250, 0.65);
  }

  &[aria-current="page"] {
    background: rgba(96, 165, 250, 0.34);
    border-color: rgba(147, 197, 253, 0.75);
    color: #eff6ff;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const NavigationButton = styled.button`
  ${navActionStyles}
`;

const NavigationLink = styled.a`
  ${navActionStyles}
`;

const ExpandToggleButton = styled.button`
  flex: 0 0 auto;
  min-height: 34px;
  padding: 6px 12px;
  border-radius: 9px;
  border: 1px dashed rgba(148, 163, 184, 0.5);
  background: rgba(15, 23, 42, 0.16);
  color: #dbeafe;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: rgba(59, 130, 246, 0.18);
    border-color: rgba(96, 165, 250, 0.72);
  }
`;

const UserBlock = styled.section`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 38px;
`;

const AvatarCircle = styled.span`
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(191, 219, 254, 0.52);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.8), rgba(14, 116, 144, 0.78));
  color: #f8fafc;
  font-size: 0.76rem;
  font-weight: 700;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
`;

const UserMeta = styled.div`
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 2px;
  min-width: 0;
`;

const UserName = styled.strong`
  margin: 0;
  color: #f8fafc;
  font-size: 0.85rem;
  line-height: 1.2;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserSubtitle = styled.small`
  margin: 0;
  color: rgba(226, 232, 240, 0.84);
  font-size: 0.74rem;
  line-height: 1.2;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default function ExpandableNavBar({
  items,
  userInfo,
  collapsedVisibleCount = 6,
  defaultExpanded = false,
  navAriaLabel = "Main navigation",
  moreLabel = "More",
  lessLabel = "Less",
  className,
  onToggleExpand
}: ExpandableNavBarProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const visibilityState = useMemo(
    () => resolveVisibleNavigationItems(items, isExpanded, collapsedVisibleCount),
    [collapsedVisibleCount, isExpanded, items]
  );
  const avatarInitials = resolveAvatarInitials(userInfo.displayName, userInfo.avatarFallbackText);

  function handleToggleExpand(): void {
    setIsExpanded((prevExpanded) => {
      const nextExpanded = !prevExpanded;
      if (onToggleExpand) {
        onToggleExpand(nextExpanded);
      }
      return nextExpanded;
    });
  }

  function renderNavigationItem(item: ExpandableNavItem) {
    const ariaLabel = item.ariaLabel || item.label;
    if (item.href && !item.disabled) {
      return (
        <NavigationLink
          key={item.id}
          href={item.href}
          aria-label={ariaLabel}
          aria-current={item.active ? "page" : undefined}
          onClick={item.onClick}
        >
          {item.label}
        </NavigationLink>
      );
    }

    return (
      <NavigationButton
        key={item.id}
        type="button"
        aria-label={ariaLabel}
        aria-current={item.active ? "page" : undefined}
        disabled={Boolean(item.disabled)}
        onClick={item.onClick}
      >
        {item.label}
      </NavigationButton>
    );
  }

  return (
    <Root className={className} data-testid="expandable-nav-bar">
      <NavigationBlock>
        <NavigationList $expanded={isExpanded} aria-label={navAriaLabel}>
          {visibilityState.visibleItems.map((item) => renderNavigationItem(item))}
        </NavigationList>

        {visibilityState.showToggle ? (
          <ExpandToggleButton
            type="button"
            aria-expanded={isExpanded}
            data-testid="expandable-nav-toggle"
            onClick={handleToggleExpand}
          >
            {isExpanded ? lessLabel : `${moreLabel} (${visibilityState.hiddenItems.length})`}
          </ExpandToggleButton>
        ) : null}
      </NavigationBlock>

      <UserBlock aria-label="Current user">
        <AvatarCircle>
          {userInfo.avatarUrl ? (
            <AvatarImage
              src={userInfo.avatarUrl}
              alt={userInfo.avatarAlt || `${userInfo.displayName} avatar`}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            avatarInitials
          )}
        </AvatarCircle>

        <UserMeta>
          <UserName title={userInfo.displayName}>{userInfo.displayName}</UserName>
          {userInfo.subtitle ? <UserSubtitle title={userInfo.subtitle}>{userInfo.subtitle}</UserSubtitle> : null}
        </UserMeta>
      </UserBlock>
    </Root>
  );
}
