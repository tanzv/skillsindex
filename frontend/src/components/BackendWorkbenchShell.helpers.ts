import type { ProtectedWorkbenchSection } from "../app/protectedWorkbenchConfig";

export interface PrimaryNavSectionsLayout {
  visibleSections: ProtectedWorkbenchSection[];
  hiddenSections: ProtectedWorkbenchSection[];
}

export function resolvePrimaryNavVisibleCount(viewportWidth: number, sectionCount: number): number {
  if (sectionCount <= 0) {
    return 0;
  }
  if (viewportWidth >= 1440) {
    return sectionCount;
  }
  if (viewportWidth >= 1280) {
    return Math.min(sectionCount, 5);
  }
  if (viewportWidth >= 1120) {
    return Math.min(sectionCount, 4);
  }
  return Math.min(sectionCount, 3);
}

export function splitPrimaryNavSections(
  sections: ProtectedWorkbenchSection[],
  activeSectionID: ProtectedWorkbenchSection["id"],
  viewportWidth: number
): PrimaryNavSectionsLayout {
  const visibleCount = resolvePrimaryNavVisibleCount(viewportWidth, sections.length);
  if (visibleCount >= sections.length) {
    return {
      visibleSections: sections,
      hiddenSections: []
    };
  }

  const activeIndex = sections.findIndex((section) => section.id === activeSectionID);
  const activeSection = activeIndex >= 0 ? sections[activeIndex] : null;
  const leadingVisible = sections.slice(0, visibleCount);
  const activeAlreadyVisible = leadingVisible.some((section) => section.id === activeSectionID);

  if (!activeSection || activeAlreadyVisible) {
    return {
      visibleSections: leadingVisible,
      hiddenSections: sections.slice(visibleCount)
    };
  }

  const visibleSections = [...sections.slice(0, Math.max(visibleCount - 1, 0)), activeSection].sort(
    (left, right) => sections.indexOf(left) - sections.indexOf(right)
  );
  const visibleIDs = new Set(visibleSections.map((section) => section.id));

  return {
    visibleSections,
    hiddenSections: sections.filter((section) => !visibleIDs.has(section.id))
  };
}

export function buildSecondaryNavGlyph(label: string): string {
  const normalized = label
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (normalized.length === 0) {
    return "?";
  }

  if (normalized.length === 1) {
    return normalized[0].slice(0, 2).toUpperCase();
  }

  return normalized
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}
