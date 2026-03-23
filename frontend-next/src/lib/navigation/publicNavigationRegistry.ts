import {
  publicAboutRoute,
  publicCategoriesRoute,
  publicCategoriesRoutePrefixes,
  publicDocsRoute,
  publicDocsRoutePrefixes,
  publicGovernanceRoute,
  publicHomeRoute,
  publicLoginRoute,
  publicRankingsRoute,
  publicRankingsRoutePrefixes,
  publicResultsRoutePrefixes,
  publicRolloutRoute,
  publicSkillDetailRoutePrefixes,
  publicStatesRoutePrefix,
  publicTimelineRoute
} from "@/src/lib/routing/publicRouteRegistry";

export type PublicTopbarNavSectionId = "categories" | "rankings" | "docs";
export type PublicRouteStageId = "landing" | "categories" | "rankings" | "skill-detail" | "results" | "access" | "marketplace";
export type PublicShellRouteKind = "landing" | "section" | "skill-detail" | "narrative" | "default";
export type PublicTopbarRoutePresetVariant = "landing" | "market" | "skill-detail";
export type PublicTopbarBreadcrumbKind = "results" | "categories-index" | "category-detail" | "rankings" | "skill-detail";
export type PublicNarrativeRouteId = "about" | "docs" | "governance" | "rollout" | "timeline" | "states";

export interface PublicTopbarRoutePresetDescriptor {
  variant: PublicTopbarRoutePresetVariant;
  stageId?: Extract<PublicRouteStageId, "categories" | "rankings" | "results" | "skill-detail">;
  breadcrumbKind?: PublicTopbarBreadcrumbKind;
}

export interface PublicNarrativeRouteDescriptor {
  id: PublicNarrativeRouteId;
  corePath: string;
  navSection: PublicTopbarNavSectionId | null;
  shellRouteKind: Extract<PublicShellRouteKind, "narrative" | "default">;
}

interface PublicTopbarNavRegistration {
  id: PublicTopbarNavSectionId;
  href: string;
  matchPrefixes: string[];
}

const publicTopbarNavRegistrations: PublicTopbarNavRegistration[] = [
  {
    id: "categories",
    href: publicCategoriesRoute,
    matchPrefixes: [...publicCategoriesRoutePrefixes]
  },
  {
    id: "rankings",
    href: publicRankingsRoute,
    matchPrefixes: [...publicRankingsRoutePrefixes]
  },
  {
    id: "docs",
    href: publicDocsRoute,
    matchPrefixes: [...publicDocsRoutePrefixes]
  }
];

const publicNarrativeRouteDescriptors: PublicNarrativeRouteDescriptor[] = [
  {
    id: "about",
    corePath: publicAboutRoute,
    navSection: "docs",
    shellRouteKind: "narrative"
  },
  {
    id: "docs",
    corePath: publicDocsRoute,
    navSection: "docs",
    shellRouteKind: "narrative"
  },
  {
    id: "governance",
    corePath: publicGovernanceRoute,
    navSection: "docs",
    shellRouteKind: "narrative"
  },
  {
    id: "rollout",
    corePath: publicRolloutRoute,
    navSection: "docs",
    shellRouteKind: "narrative"
  },
  {
    id: "timeline",
    corePath: publicTimelineRoute,
    navSection: "docs",
    shellRouteKind: "narrative"
  },
  {
    id: "states",
    corePath: publicStatesRoutePrefix,
    navSection: "docs",
    shellRouteKind: "default"
  }
];

const publicNarrativeRoutePrefixes = publicNarrativeRouteDescriptors
  .filter((descriptor) => descriptor.shellRouteKind === "narrative")
  .map((descriptor) => descriptor.corePath);

function matchesPublicRoute(corePath: string, matchPrefixes: readonly string[]): boolean {
  return matchPrefixes.some((matchPrefix) => corePath === matchPrefix || corePath.startsWith(`${matchPrefix}/`));
}

export function listPublicNarrativeRouteDescriptors(): ReadonlyArray<PublicNarrativeRouteDescriptor> {
  return publicNarrativeRouteDescriptors;
}

export function resolvePublicNarrativeRouteDescriptorById(routeId: PublicNarrativeRouteId): PublicNarrativeRouteDescriptor | null {
  return publicNarrativeRouteDescriptors.find((descriptor) => descriptor.id === routeId) || null;
}

export function resolvePublicNarrativeRouteDescriptor(corePath: string): PublicNarrativeRouteDescriptor | null {
  return publicNarrativeRouteDescriptors.find((descriptor) => matchesPublicRoute(corePath, [descriptor.corePath])) || null;
}

export function resolvePublicTopbarNavSection(corePath: string): PublicTopbarNavSectionId | null {
  return publicTopbarNavRegistrations.find((registration) => matchesPublicRoute(corePath, registration.matchPrefixes))?.id || null;
}

export function isPublicTopbarNavSectionActive(corePath: string, sectionId: PublicTopbarNavSectionId): boolean {
  return resolvePublicTopbarNavSection(corePath) === sectionId;
}

export function listPublicTopbarNavRegistrations(): ReadonlyArray<PublicTopbarNavRegistration> {
  return publicTopbarNavRegistrations;
}

export function resolvePublicRouteStage(corePath: string): PublicRouteStageId {
  if (corePath === publicHomeRoute) {
    return "landing";
  }

  if (matchesPublicRoute(corePath, publicCategoriesRoutePrefixes)) {
    return "categories";
  }

  if (matchesPublicRoute(corePath, publicRankingsRoutePrefixes)) {
    return "rankings";
  }

  if (matchesPublicRoute(corePath, publicSkillDetailRoutePrefixes)) {
    return "skill-detail";
  }

  if (matchesPublicRoute(corePath, publicResultsRoutePrefixes)) {
    return "results";
  }

  if (corePath === publicLoginRoute) {
    return "access";
  }

  return "marketplace";
}

export function resolvePublicShellRouteKind(corePath: string): PublicShellRouteKind {
  if (corePath === publicHomeRoute) {
    return "landing";
  }

  if (
    matchesPublicRoute(corePath, [...publicCategoriesRoutePrefixes, ...publicRankingsRoutePrefixes, ...publicResultsRoutePrefixes])
  ) {
    return "section";
  }

  if (matchesPublicRoute(corePath, publicSkillDetailRoutePrefixes)) {
    return "skill-detail";
  }

  if (matchesPublicRoute(corePath, publicNarrativeRoutePrefixes)) {
    return "narrative";
  }

  return "default";
}

export function resolvePublicTopbarRoutePresetDescriptor(corePath: string): PublicTopbarRoutePresetDescriptor | null {
  if (corePath === publicHomeRoute) {
    return { variant: "landing" };
  }

  if (corePath === publicCategoriesRoute) {
    return {
      variant: "market",
      stageId: "categories",
      breadcrumbKind: "categories-index"
    };
  }

  if (matchesPublicRoute(corePath, publicCategoriesRoutePrefixes) && corePath.startsWith(`${publicCategoriesRoute}/`)) {
    return {
      variant: "market",
      stageId: "categories",
      breadcrumbKind: "category-detail"
    };
  }

  if (matchesPublicRoute(corePath, publicRankingsRoutePrefixes)) {
    return {
      variant: "market",
      stageId: "rankings",
      breadcrumbKind: "rankings"
    };
  }

  if (matchesPublicRoute(corePath, publicSkillDetailRoutePrefixes)) {
    return {
      variant: "skill-detail",
      stageId: "skill-detail",
      breadcrumbKind: "skill-detail"
    };
  }

  if (matchesPublicRoute(corePath, publicResultsRoutePrefixes)) {
    return {
      variant: "market",
      stageId: "results",
      breadcrumbKind: "results"
    };
  }

  return null;
}
