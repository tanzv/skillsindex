import { Alert, Button, Card, Empty, Segmented, Space, Spin, Table, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { MarketplaceSkill, PublicMarketplaceResponse, SessionUser } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import { buildLightTopbarPrimaryActions, buildLightTopbarUtilityActions } from "./MarketplaceHomePage.lightTopbar";
import { buildMarketplaceFallback } from "./MarketplaceHomePage.fallback";
import PublicStandardTopbar from "./PublicStandardTopbar";
import {
  PrototypeSplitRow,
  PrototypeUtilityHeaderActions,
  PrototypeUtilityLoading,
  PrototypeUtilityPanel,
  PrototypeUtilityShell
} from "./prototypeCssInJs";
import { loadMarketplaceWithFallback, resolvePrototypeDataMode } from "./prototypeDataFallback";
import { createPrototypePalette, isLightPrototypePath } from "./prototypePageTheme";
import { createPublicPageNavigator } from "./publicPageNavigation";

export interface PublicRankingPageProps {
  locale: AppLocale;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
}

export type RankingSortKey = "stars" | "quality";

interface RankingPageCopy {
  title: string;
  subtitle: string;
  sortByLabel: string;
  sortByStars: string;
  sortByQuality: string;
  rankLabel: string;
  skillLabel: string;
  categoryLabel: string;
  starsLabel: string;
  qualityLabel: string;
  updatedLabel: string;
  viewCategories: string;
  noData: string;
  loadError: string;
  topbar: {
    categoryNav: string;
    downloadRankingNav: string;
    signedIn: string;
    signedOut: string;
    openWorkspace: string;
    signIn: string;
  };
}

const rankingPageCopy: Record<AppLocale, RankingPageCopy> = {
  en: {
    title: "Top Skills Ranking",
    subtitle: "Monitor the highest-performing skills by popularity and quality.",
    sortByLabel: "Sort by",
    sortByStars: "Stars",
    sortByQuality: "Quality",
    rankLabel: "Rank",
    skillLabel: "Skill Name",
    categoryLabel: "Category",
    starsLabel: "Stars",
    qualityLabel: "Quality",
    updatedLabel: "Updated",
    viewCategories: "View Categories",
    noData: "No ranking data is available.",
    loadError: "Failed to load ranking data.",
    topbar: {
      categoryNav: "Categories",
      downloadRankingNav: "Download Ranking",
      signedIn: "Signed in",
      signedOut: "Guest mode",
      openWorkspace: "Open Workspace",
      signIn: "Sign In"
    }
  },
  zh: {
    title: "Top Skills Ranking",
    subtitle: "Monitor the highest-performing skills by popularity and quality.",
    sortByLabel: "Sort by",
    sortByStars: "Stars",
    sortByQuality: "Quality",
    rankLabel: "Rank",
    skillLabel: "Skill Name",
    categoryLabel: "Category",
    starsLabel: "Stars",
    qualityLabel: "Quality",
    updatedLabel: "Updated",
    viewCategories: "View Categories",
    noData: "No ranking data is available.",
    loadError: "Failed to load ranking data.",
    topbar: {
      categoryNav: "Categories",
      downloadRankingNav: "Download Ranking",
      signedIn: "Signed in",
      signedOut: "Guest mode",
      openWorkspace: "Open Workspace",
      signIn: "Sign In"
    }
  }
};

export function sortRankingItems(items: MarketplaceSkill[], sortKey: RankingSortKey): MarketplaceSkill[] {
  const sorted = [...items];
  if (sortKey === "stars") {
    sorted.sort(
      (left, right) =>
        right.star_count - left.star_count || right.quality_score - left.quality_score || right.id - left.id
    );
    return sorted;
  }

  sorted.sort(
    (left, right) =>
      right.quality_score - left.quality_score || right.star_count - left.star_count || right.id - left.id
  );
  return sorted;
}

export function buildRankingCategoriesPath(pathname: string): string {
  return createPublicPageNavigator(pathname).toPublic("/categories");
}

export function buildRankingSkillPath(pathname: string, skillID: number): string {
  return createPublicPageNavigator(pathname).toPublic(`/skills/${skillID}`);
}

export function resolveRankingSourceItems(
  payload: PublicMarketplaceResponse | null,
  fallbackPayload: PublicMarketplaceResponse
): MarketplaceSkill[] {
  if (payload?.items && payload.items.length > 0) {
    return payload.items;
  }
  return fallbackPayload.items;
}

function formatRankingUpdatedAt(value: string, locale: AppLocale): string {
  const localeTag = locale === "zh" ? "zh-CN" : "en-US";
  return new Date(value).toLocaleDateString(localeTag, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

export default function PublicRankingPage({ locale, onNavigate, sessionUser }: PublicRankingPageProps) {
  const currentPath = window.location.pathname;
  const text = rankingPageCopy[locale];
  const [sortKey, setSortKey] = useState<RankingSortKey>("stars");
  const lightTheme = isLightPrototypePath(currentPath);
  const palette = useMemo(() => createPrototypePalette(lightTheme), [lightTheme]);
  const navigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);
  const dataMode = useMemo(() => resolvePrototypeDataMode(import.meta.env.VITE_MARKETPLACE_HOME_MODE), []);
  const fallbackPayload = useMemo(
    () => buildMarketplaceFallback({ sort: "stars", page: 1 }, locale, sessionUser),
    [locale, sessionUser]
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [payload, setPayload] = useState<PublicMarketplaceResponse | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorMessage("");

    loadMarketplaceWithFallback({
      query: { sort: "stars", page: 1 },
      locale,
      sessionUser,
      mode: dataMode
    })
      .then((result) => {
        if (!active) {
          return;
        }
        setPayload(result.payload);
        setErrorMessage(result.degraded ? result.errorMessage || text.loadError : "");
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        setPayload(fallbackPayload);
        setErrorMessage(error instanceof Error ? error.message : text.loadError);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [dataMode, fallbackPayload, locale, sessionUser, text.loadError]);

  const sourceItems = useMemo(() => resolveRankingSourceItems(payload, fallbackPayload), [fallbackPayload, payload]);

  const rankedItems = useMemo(() => {
    return sortRankingItems(sourceItems, sortKey).slice(0, 10);
  }, [sourceItems, sortKey]);

  const topbarPrimaryActions = useMemo(
    () =>
      buildLightTopbarPrimaryActions({
        onNavigate,
        toPublicPath: navigator.toPublic,
        labels: {
          categoryNav: text.topbar.categoryNav,
          downloadRankingNav: text.topbar.downloadRankingNav
        },
        activeActionID: "download-ranking"
      }),
    [navigator.toPublic, onNavigate, text.topbar.categoryNav, text.topbar.downloadRankingNav]
  );

  const topbarUtilityActions = useMemo(
    () =>
      buildLightTopbarUtilityActions({
        onNavigate,
        toPublicPath: navigator.toPublic,
        hasSessionUser: Boolean(sessionUser)
      }),
    [navigator.toPublic, onNavigate, sessionUser]
  );

  return (
    <div className={`prototype-shell${lightTheme ? " marketplace-home-stage is-light-stage" : " marketplace-home-stage"}`}>
      <PublicStandardTopbar
        shellClassName="animated-fade-down"
        dataAnimated
        brandTitle="SkillsIndex"
        brandSubtitle="User Portal"
        onBrandClick={() => onNavigate(navigator.toPublic("/"))}
        isLightTheme={lightTheme}
        primaryActions={topbarPrimaryActions}
        utilityActions={topbarUtilityActions}
        statusLabel={sessionUser ? text.topbar.signedIn : text.topbar.signedOut}
        ctaLabel={sessionUser ? text.topbar.openWorkspace : text.topbar.signIn}
        onCtaClick={() => onNavigate(sessionUser ? navigator.toPublic("/workspace") : navigator.toPublic("/login"))}
      />

      <PrototypeUtilityShell>
        {errorMessage ? <Alert type="warning" showIcon message={errorMessage} /> : null}

        {loading ? (
          <PrototypeUtilityPanel>
            <PrototypeUtilityLoading>
              <Spin size="large" />
            </PrototypeUtilityLoading>
          </PrototypeUtilityPanel>
        ) : null}

        {!loading ? (
        <PrototypeUtilityPanel style={{ background: palette.cardBackground, borderColor: palette.cardBorder }}>
          <PrototypeSplitRow>
            <div>
              <Typography.Title level={3} style={{ margin: 0, color: palette.cardTitle }}>
                {text.title}
              </Typography.Title>
              <Typography.Paragraph style={{ marginTop: 8, marginBottom: 0, color: palette.cardText }}>
                {text.subtitle}
              </Typography.Paragraph>
            </div>

            <PrototypeUtilityHeaderActions>
              <Button onClick={() => onNavigate(buildRankingCategoriesPath(currentPath))}>{text.viewCategories}</Button>
            </PrototypeUtilityHeaderActions>
          </PrototypeSplitRow>

          <Space size={10} align="center" wrap>
            <Typography.Text style={{ color: palette.metricLabel }}>{text.sortByLabel}</Typography.Text>
            <Segmented
              options={[
                { label: text.sortByStars, value: "stars" },
                { label: text.sortByQuality, value: "quality" }
              ]}
              value={sortKey}
              onChange={(value) => setSortKey(value as RankingSortKey)}
            />
          </Space>

          {rankedItems.length === 0 ? (
            <Card variant="borderless">
              <Empty description={text.noData} />
            </Card>
          ) : (
            <Table
              size="small"
              rowKey={(item) => item.id}
              pagination={false}
              dataSource={rankedItems}
              columns={[
                {
                  title: text.rankLabel,
                  width: 72,
                  render: (_value: unknown, _record: MarketplaceSkill, index: number) => (
                    <Tag color="cyan">#{index + 1}</Tag>
                  )
                },
                {
                  title: text.skillLabel,
                  dataIndex: "name",
                  render: (_value: string, record: MarketplaceSkill) => (
                    <Button type="link" onClick={() => onNavigate(buildRankingSkillPath(currentPath, record.id))}>
                      {record.name}
                    </Button>
                  )
                },
                {
                  title: text.categoryLabel,
                  dataIndex: "category",
                  render: (value: string, record: MarketplaceSkill) => `${value} / ${record.subcategory}`
                },
                {
                  title: text.starsLabel,
                  dataIndex: "star_count",
                  sorter: false
                },
                {
                  title: text.qualityLabel,
                  dataIndex: "quality_score",
                  render: (value: number) => value.toFixed(1)
                },
                {
                  title: text.updatedLabel,
                  dataIndex: "updated_at",
                  render: (value: string) => formatRankingUpdatedAt(value, locale)
                }
              ]}
            />
          )}
        </PrototypeUtilityPanel>
        ) : null}
      </PrototypeUtilityShell>
    </div>
  );
}
