export const publicHomeRoute = "/" as const;
export const publicSearchRoute = "/search" as const;
export const publicResultsRoute = "/results" as const;
export const publicCategoriesRoute = "/categories" as const;
export const publicCompareRoute = "/compare" as const;
export const publicRankingsRoute = "/rankings" as const;
export const publicRolloutRoute = "/rollout" as const;
export const publicTimelineRoute = "/timeline" as const;
export const publicGovernanceRoute = "/governance" as const;
export const publicDocsRoute = "/docs" as const;
export const publicAboutRoute = "/about" as const;
export const publicLoginRoute = "/login" as const;
export const publicSkillsRoutePrefix = "/skills" as const;
export const publicStatesRoutePrefix = "/states" as const;

export const publicRouteEntries = [
  publicHomeRoute,
  publicSearchRoute,
  publicResultsRoute,
  publicCategoriesRoute,
  publicCompareRoute,
  publicRankingsRoute,
  publicRolloutRoute,
  publicTimelineRoute,
  publicGovernanceRoute,
  publicDocsRoute,
  publicAboutRoute,
  publicLoginRoute
] as const;

export const canonicalPublicRoutePrefixes = [
  publicHomeRoute,
  publicResultsRoute,
  publicCategoriesRoute,
  publicRankingsRoute,
  publicRolloutRoute,
  publicTimelineRoute,
  publicGovernanceRoute,
  publicDocsRoute,
  publicAboutRoute,
  publicLoginRoute,
  publicSkillsRoutePrefix,
  publicStatesRoutePrefix
] as const;

export const compatibilityPublicRoutePrefixes = [publicSearchRoute, publicCompareRoute] as const;

export const publicAnonymousRoutePrefixes = [...canonicalPublicRoutePrefixes, ...compatibilityPublicRoutePrefixes] as const;

export const publicDocsRoutePrefixes = [publicAboutRoute, publicDocsRoute, publicGovernanceRoute, publicRolloutRoute, publicTimelineRoute, publicStatesRoutePrefix] as const;
export const publicRankingsRoutePrefixes = [publicRankingsRoute, publicCompareRoute] as const;
export const publicResultsRoutePrefixes = [publicResultsRoute, publicSearchRoute] as const;
export const publicCategoriesRoutePrefixes = [publicCategoriesRoute] as const;
export const publicSkillDetailRoutePrefixes = [publicSkillsRoutePrefix] as const;

export const publicMarketplaceTopNavMatchPrefixes = [
  publicHomeRoute,
  ...compatibilityPublicRoutePrefixes,
  publicResultsRoute,
  publicCategoriesRoute,
  publicSkillsRoutePrefix,
  publicRankingsRoute,
  publicRolloutRoute,
  publicTimelineRoute,
  publicGovernanceRoute,
  publicStatesRoutePrefix
] as const;

export const publicDocsTopNavMatchPrefixes = [publicDocsRoute, publicAboutRoute] as const;
