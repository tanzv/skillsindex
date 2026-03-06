export interface ExpandableNavItem {
  id: string;
  label: string;
  ariaLabel?: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}

export interface ExpandableNavVisibleState {
  visibleItems: ExpandableNavItem[];
  hiddenItems: ExpandableNavItem[];
  showToggle: boolean;
}

const DEFAULT_COLLAPSED_VISIBLE_COUNT = 6;
const MIN_VISIBLE_ITEM_COUNT = 1;

export function normalizeCollapsedVisibleCount(collapsedVisibleCount: number | undefined): number {
  if (!Number.isFinite(collapsedVisibleCount)) {
    return DEFAULT_COLLAPSED_VISIBLE_COUNT;
  }
  return Math.max(MIN_VISIBLE_ITEM_COUNT, Math.floor(collapsedVisibleCount as number));
}

export function resolveVisibleNavigationItems(
  items: ExpandableNavItem[],
  isExpanded: boolean,
  collapsedVisibleCount: number | undefined
): ExpandableNavVisibleState {
  const normalizedVisibleCount = normalizeCollapsedVisibleCount(collapsedVisibleCount);
  const hasOverflow = items.length > normalizedVisibleCount;

  if (!hasOverflow || isExpanded) {
    return {
      visibleItems: items,
      hiddenItems: [],
      showToggle: hasOverflow
    };
  }

  return {
    visibleItems: items.slice(0, normalizedVisibleCount),
    hiddenItems: items.slice(normalizedVisibleCount),
    showToggle: true
  };
}

export function resolveAvatarInitials(displayName: string, fallback = "U"): string {
  const fallbackValue = String(fallback || "U")
    .trim()
    .toUpperCase()
    .slice(0, 2) || "U";
  const sanitizedName = String(displayName || "").trim();
  if (!sanitizedName) {
    return fallbackValue;
  }

  const parts = sanitizedName
    .split(/\s+/)
    .map((segment) => segment.replace(/[^A-Za-z0-9]/g, ""))
    .filter(Boolean);

  if (parts.length >= 2) {
    const initials = `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return /^[A-Z0-9]{2}$/.test(initials) ? initials : fallbackValue;
  }

  if (parts.length === 1) {
    const token = parts[0].toUpperCase();
    if (!/^[A-Z0-9]+$/.test(token)) {
      return fallbackValue;
    }
    return token.slice(0, 2) || fallbackValue;
  }

  return fallbackValue;
}
