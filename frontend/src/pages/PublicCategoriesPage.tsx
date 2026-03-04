import { Alert, Button, Card, Empty, Tag, Typography } from "antd";
import { useMemo } from "react";
import type { PublicMarketplaceResponse, SessionUser } from "../lib/api";
import type { AppLocale } from "../lib/i18n";
import { buildMarketplaceFallback } from "./MarketplaceHomePage.fallback";
import type { TopbarActionItem } from "./MarketplaceHomePage.lightTopbar";
import PublicStandardTopbar from "./PublicStandardTopbar";
import {
  PrototypeSplitRow,
  PrototypeUtilityHeaderActions,
  PrototypeUtilityPanel,
  PrototypeUtilityShell,
  PrototypeTwoColumnGrid
} from "./prototypeCssInJs";
import { createPrototypePalette, isLightPrototypePath } from "./prototypePageTheme";
import { createPublicPageNavigator } from "./publicPageNavigation";

interface PublicCategoriesPageProps {
  locale: AppLocale;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
  payloadOverride?: PublicMarketplaceResponse | null;
}

interface LocalizedCopy {
  pageTitle: string;
  pageSubtitle: string;
  openMarketplace: string;
  openDashboard: string;
  signIn: string;
  rankings: string;
  categoriesTab: string;
  categoriesStatus: string;
  topSubcategories: string;
  noDescription: string;
  emptyState: string;
  loadError: string;
}

interface CategoryCardViewModel {
  slug: string;
  name: string;
  description: string;
  count: number;
  topSubcategories: Array<{ slug: string; name: string; count: number }>;
}

interface PayloadResolution {
  payload: PublicMarketplaceResponse;
  errorMessage: string;
}

const copy: Record<AppLocale, LocalizedCopy> = {
  en: {
    pageTitle: "Category Overview",
    pageSubtitle: "Browse skills by category and jump straight into curated result sets.",
    openMarketplace: "Back to Marketplace",
    openDashboard: "Open Dashboard",
    signIn: "Sign In",
    rankings: "Open Rankings",
    categoriesTab: "Categories",
    categoriesStatus: "Overview",
    topSubcategories: "Top Subcategories",
    noDescription: "No category description available",
    emptyState: "No categories are available",
    loadError: "Unable to resolve category payload"
  },
  zh: {
    pageTitle: "Category Overview",
    pageSubtitle: "Browse skills by category and jump straight into curated result sets.",
    openMarketplace: "Back to Marketplace",
    openDashboard: "Open Dashboard",
    signIn: "Sign In",
    rankings: "Open Rankings",
    categoriesTab: "Categories",
    categoriesStatus: "Overview",
    topSubcategories: "Top Subcategories",
    noDescription: "No category description available",
    emptyState: "No categories are available",
    loadError: "Unable to resolve category payload"
  }
};

function createEmptyMarketplacePayload(): PublicMarketplaceResponse {
  return {
    filters: {
      q: "",
      tags: "",
      category: "",
      subcategory: "",
      sort: "recent",
      mode: "keyword"
    },
    stats: {
      total_skills: 0,
      matching_skills: 0
    },
    pagination: {
      page: 1,
      page_size: 24,
      total_items: 0,
      total_pages: 1,
      prev_page: 0,
      next_page: 0
    },
    categories: [],
    top_tags: [],
    items: [],
    session_user: null,
    can_access_dashboard: false
  };
}

function resolveCategoryDescription(description: string, fallbackLabel: string): string {
  const normalized = String(description || "").trim();
  return normalized || fallbackLabel;
}

export function resolveCategoryCardsFromPayload(
  payload: PublicMarketplaceResponse,
  fallbackDescription: string
): CategoryCardViewModel[] {
  if (!payload || !Array.isArray(payload.categories)) {
    return [];
  }

  return payload.categories.map((category) => ({
    slug: String(category.slug || "").trim(),
    name: String(category.name || "").trim() || "Uncategorized",
    description: resolveCategoryDescription(category.description, fallbackDescription),
    count: Number.isFinite(category.count) ? category.count : 0,
    topSubcategories: (Array.isArray(category.subcategories) ? category.subcategories : [])
      .slice(0, 3)
      .map((subcategory) => ({
        slug: String(subcategory.slug || "").trim(),
        name: String(subcategory.name || "").trim() || "General",
        count: Number.isFinite(subcategory.count) ? subcategory.count : 0
      }))
  }));
}

export function buildCategoryResultsPath(categorySlug: string): string {
  const params = new URLSearchParams();
  params.set("category", String(categorySlug || "").trim());
  params.set("page", "1");
  return `/results?${params.toString()}`;
}

export function resolveCategoryPublicPath(currentPath: string, categorySlug: string): string {
  const navigator = createPublicPageNavigator(currentPath);
  return navigator.toPublic(buildCategoryResultsPath(categorySlug));
}

export function resolveRankingsPublicPath(currentPath: string): string {
  return createPublicPageNavigator(currentPath).toPublic("/rankings");
}

function resolvePayload(locale: AppLocale, sessionUser: SessionUser | null, payloadOverride?: PublicMarketplaceResponse | null): PayloadResolution {
  if (payloadOverride) {
    return {
      payload: payloadOverride,
      errorMessage: ""
    };
  }

  try {
    return {
      payload: buildMarketplaceFallback({ page: 1, sort: "recent" }, locale, sessionUser),
      errorMessage: ""
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      payload: createEmptyMarketplacePayload(),
      errorMessage
    };
  }
}

export default function PublicCategoriesPage({ locale, onNavigate, sessionUser, payloadOverride }: PublicCategoriesPageProps) {
  const text = copy[locale];
  const currentPath = window.location.pathname;
  const isLightTheme = isLightPrototypePath(currentPath);
  const palette = useMemo(() => createPrototypePalette(isLightTheme), [isLightTheme]);
  const navigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);

  const payloadResolution = useMemo(
    () => resolvePayload(locale, sessionUser, payloadOverride),
    [locale, sessionUser, payloadOverride]
  );

  const categoryCards = useMemo(
    () => resolveCategoryCardsFromPayload(payloadResolution.payload, text.noDescription),
    [payloadResolution.payload, text.noDescription]
  );

  const primaryActions = useMemo<TopbarActionItem[]>(
    () => [
      {
        id: "categories",
        label: text.categoriesTab,
        active: true,
        onClick: () => undefined
      },
      {
        id: "rankings",
        label: text.rankings,
        onClick: () => onNavigate(resolveRankingsPublicPath(currentPath))
      }
    ],
    [text.categoriesTab, text.rankings, onNavigate, currentPath]
  );

  function navigateToCategory(categorySlug: string): void {
    const normalizedSlug = String(categorySlug || "").trim();
    if (!normalizedSlug) {
      return;
    }
    onNavigate(navigator.toPublic(buildCategoryResultsPath(normalizedSlug)));
  }

  return (
    <>
      <PublicStandardTopbar
        brandTitle="SkillsIndex"
        brandSubtitle={text.pageTitle}
        onBrandClick={() => onNavigate(navigator.toPublic("/"))}
        isLightTheme={isLightTheme}
        primaryActions={primaryActions}
        statusLabel={text.categoriesStatus}
        ctaLabel={text.rankings}
        onCtaClick={() => onNavigate(resolveRankingsPublicPath(currentPath))}
      />

      <PrototypeUtilityShell>
        {payloadResolution.errorMessage ? (
          <Alert type="warning" showIcon message={text.loadError} description={payloadResolution.errorMessage} />
        ) : null}

        <Card
          variant="borderless"
          style={{ borderRadius: 16, border: `1px solid ${palette.headerBorder}`, background: palette.headerBackground }}
          styles={{ body: { padding: "14px 16px" } }}
        >
          <PrototypeSplitRow>
            <div style={{ display: "grid", gap: 6 }}>
              <Typography.Title
                level={2}
                style={{
                  margin: 0,
                  color: palette.headerTitle,
                  fontFamily: '"Syne", sans-serif',
                  fontSize: "clamp(1.12rem, 2.5vw, 1.72rem)",
                  lineHeight: 1.18
                }}
              >
                {text.pageTitle}
              </Typography.Title>
              <Typography.Paragraph style={{ margin: 0, color: palette.headerSubtitle, fontSize: "0.82rem", maxWidth: "72ch" }}>
                {text.pageSubtitle}
              </Typography.Paragraph>
            </div>

            <PrototypeUtilityHeaderActions>
              <Button onClick={() => onNavigate(navigator.toPublic("/"))}>{text.openMarketplace}</Button>
              <Button
                type="primary"
                onClick={() => onNavigate(sessionUser ? navigator.toAdmin("/admin/overview") : navigator.toPublic("/login"))}
              >
                {sessionUser ? text.openDashboard : text.signIn}
              </Button>
            </PrototypeUtilityHeaderActions>
          </PrototypeSplitRow>
        </Card>

        {categoryCards.length === 0 ? (
          <PrototypeUtilityPanel>
            <Empty description={text.emptyState} />
          </PrototypeUtilityPanel>
        ) : (
          <PrototypeTwoColumnGrid>
            {categoryCards.map((category) => (
              <Card
                key={category.slug || category.name}
                variant="borderless"
                hoverable
                style={{
                  borderRadius: 14,
                  border: `1px solid ${palette.cardBorder}`,
                  background: palette.cardBackground,
                  cursor: category.slug ? "pointer" : "default"
                }}
                styles={{ body: { padding: 14, display: "grid", gap: 10 } }}
                onClick={() => navigateToCategory(category.slug)}
              >
                <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "1.02rem" }}>
                  {category.name}
                </Typography.Title>
                <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.82rem", lineHeight: 1.45 }}>
                  {category.description}
                </Typography.Paragraph>
                <Typography.Text style={{ color: palette.metricLabel, fontSize: "0.76rem", textTransform: "uppercase", fontWeight: 700 }}>
                  Count: {category.count}
                </Typography.Text>

                <div style={{ display: "grid", gap: 6 }}>
                  <Typography.Text style={{ color: palette.metricLabel, fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>
                    {text.topSubcategories}
                  </Typography.Text>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {category.topSubcategories.length > 0 ? (
                      category.topSubcategories.map((subcategory) => (
                        <Tag key={`${category.slug}-${subcategory.slug}`} color={isLightTheme ? "geekblue" : "blue"}>
                          {subcategory.name} ({subcategory.count})
                        </Tag>
                      ))
                    ) : (
                      <Tag>{text.noDescription}</Tag>
                    )}
                  </div>
                </div>

                <Button
                  type="link"
                  style={{ padding: 0, justifySelf: "start" }}
                  onClick={(event) => {
                    event.stopPropagation();
                    navigateToCategory(category.slug);
                  }}
                >
                  {buildCategoryResultsPath(category.slug)}
                </Button>
              </Card>
            ))}
          </PrototypeTwoColumnGrid>
        )}
      </PrototypeUtilityShell>
    </>
  );
}
