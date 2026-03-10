import { Button, Card, Empty, Segmented, Space, Tag, Typography } from "antd";

import type { AppLocale } from "../../lib/i18n";
import type { RankingPageCopy } from "./PublicRankingPage.copy";
import { formatRankingCompactNumber, formatRankingUpdatedAt, type RankingSections, type RankingSortKey, type RankingSummaryMetrics } from "./PublicRankingPage.helpers";
import { PrototypeSplitRow, PrototypeUtilityHeaderActions } from "../prototype/prototypeCssInJs";
import {
  rankingDefaultRankTagStyle,
  rankingMetricTagStyle,
  rankingPanelStyle,
  rankingRowCardStyle,
  rankingSectionCardStyle,
  rankingTopRankTagStyle,
  rankingValueTagStyle
} from "./PublicRankingPage.styles";

interface PublicRankingContentPanelProps {
  text: RankingPageCopy;
  locale: AppLocale;
  isMobileLayout: boolean;
  sortKey: RankingSortKey;
  rankingSummary: RankingSummaryMetrics;
  rankingSections: RankingSections;
  rankedItemsCount: number;
  categoriesPath: string;
  onSortKeyChange: (nextSortKey: RankingSortKey) => void;
  onNavigate: (path: string) => void;
  toSkillPath: (skillID: number) => string;
}

export function PublicRankingContentPanel({
  text,
  locale,
  isMobileLayout,
  sortKey,
  rankingSummary,
  rankingSections,
  rankedItemsCount,
  categoriesPath,
  onSortKeyChange,
  onNavigate,
  toSkillPath
}: PublicRankingContentPanelProps) {
  return (
    <Card variant="borderless" style={rankingPanelStyle}>
      <PrototypeSplitRow>
        <div style={{ display: "grid", gap: 8 }}>
          <Typography.Title level={2} style={{ margin: 0, color: "var(--si-color-text-primary)" }}>
            {text.title}
          </Typography.Title>
          <Typography.Paragraph style={{ margin: 0, color: "var(--si-color-text-secondary)", maxWidth: "72ch" }}>
            {text.subtitle}
          </Typography.Paragraph>
          <Space size={8} wrap>
            <Tag style={rankingMetricTagStyle}>{`${text.totalComparedLabel}: ${rankingSummary.totalCompared}`}</Tag>
            <Tag style={rankingMetricTagStyle}>{`${text.topStarsMetricLabel}: ${formatRankingCompactNumber(rankingSummary.topStars)}`}</Tag>
            <Tag style={rankingMetricTagStyle}>{`${text.topQualityMetricLabel}: ${rankingSummary.topQuality.toFixed(1)}`}</Tag>
            <Tag style={rankingMetricTagStyle}>{`${text.averageQualityMetricLabel}: ${rankingSummary.averageQuality.toFixed(1)}`}</Tag>
          </Space>
        </div>

        <PrototypeUtilityHeaderActions>
          <Button
            onClick={() => onNavigate(categoriesPath)}
            style={{
              border: "none",
              background: "color-mix(in srgb, var(--si-color-muted-surface) 70%, transparent)",
              color: "var(--si-color-text-primary)"
            }}
          >
            {text.viewCategories}
          </Button>
        </PrototypeUtilityHeaderActions>
      </PrototypeSplitRow>

      <Space size={10} align="center" wrap>
        <Typography.Text style={{ color: "var(--si-color-text-secondary)" }}>{text.sortByLabel}</Typography.Text>
        <Segmented
          options={[
            { label: text.sortByStars, value: "stars" },
            { label: text.sortByQuality, value: "quality" }
          ]}
          value={sortKey}
          onChange={(value) => onSortKeyChange(value as RankingSortKey)}
        />
      </Space>

      {rankedItemsCount === 0 ? (
        <Card variant="borderless" style={rankingSectionCardStyle}>
          <Empty description={text.noData} />
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <Card
            variant="borderless"
            style={rankingSectionCardStyle}
            styles={{ body: { padding: 14, display: "grid", gap: 10 } }}
          >
            <Typography.Text strong style={{ color: "var(--si-color-text-primary)" }}>
              {text.topThreeLabel}
            </Typography.Text>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobileLayout ? "1fr" : "repeat(3, minmax(0, 1fr))",
                gap: 10
              }}
            >
              {rankingSections.highlightedItems.map((item, index) => (
                <Card
                  key={`ranking-highlight-${item.id}`}
                  variant="borderless"
                  style={rankingRowCardStyle}
                  styles={{ body: { padding: 12, display: "grid", gap: 8 } }}
                >
                  <Space size={8} align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                    <Tag style={index === 0 ? rankingTopRankTagStyle : rankingDefaultRankTagStyle}>{`#${index + 1}`}</Tag>
                    <Typography.Text style={{ color: "var(--si-color-text-secondary)" }}>
                      {`${text.starsLabel} ${formatRankingCompactNumber(item.star_count)}`}
                    </Typography.Text>
                  </Space>

                  <Button
                    type="link"
                    onClick={() => onNavigate(toSkillPath(item.id))}
                    data-testid="ranking-highlight-skill-button"
                    style={{
                      padding: 0,
                      justifyContent: "flex-start",
                      color: "var(--si-color-text-primary)",
                      fontWeight: 700,
                      textWrap: "pretty"
                    }}
                  >
                    {item.name}
                  </Button>

                  <Typography.Text style={{ color: "var(--si-color-text-secondary)" }}>
                    {`${item.category} / ${item.subcategory}`}
                  </Typography.Text>
                  <Space size={8} wrap>
                    <Tag style={rankingValueTagStyle}>{`${text.qualityLabel} ${item.quality_score.toFixed(1)}`}</Tag>
                    <Tag style={rankingMetricTagStyle}>{`${text.updatedLabel} ${formatRankingUpdatedAt(item.updated_at, locale)}`}</Tag>
                  </Space>
                </Card>
              ))}
            </div>
          </Card>

          {rankingSections.listItems.length > 0 ? (
            <Card
              variant="borderless"
              style={rankingSectionCardStyle}
              styles={{ body: { padding: 14, display: "grid", gap: 8 } }}
            >
              <Typography.Text strong style={{ color: "var(--si-color-text-primary)" }}>
                {text.fullRankingLabel}
              </Typography.Text>

              {!isMobileLayout ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "72px minmax(0, 1.8fr) minmax(0, 1.1fr) 100px 100px 120px 112px",
                    gap: 8,
                    alignItems: "center",
                    color: "var(--si-color-text-secondary)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                    padding: "0 6px"
                  }}
                >
                  <span>{text.rankLabel}</span>
                  <span>{text.skillLabel}</span>
                  <span>{text.categoryLabel}</span>
                  <span>{text.starsLabel}</span>
                  <span>{text.qualityLabel}</span>
                  <span>{text.updatedLabel}</span>
                  <span />
                </div>
              ) : null}

              <div style={{ display: "grid", gap: 8 }}>
                {rankingSections.listItems.map((item, index) => {
                  const rankNumber = rankingSections.highlightedItems.length + index + 1;
                  return (
                    <Card
                      key={`ranking-row-${item.id}`}
                      variant="borderless"
                      style={rankingRowCardStyle}
                      styles={{ body: { padding: 10 } }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: isMobileLayout
                            ? "minmax(0, 1fr)"
                            : "72px minmax(0, 1.8fr) minmax(0, 1.1fr) 100px 100px 120px 112px",
                          gap: 8,
                          alignItems: "center"
                        }}
                      >
                        <Tag style={rankingDefaultRankTagStyle}>{`#${rankNumber}`}</Tag>
                        <Button
                          type="link"
                          onClick={() => onNavigate(toSkillPath(item.id))}
                          style={{
                            padding: 0,
                            justifyContent: "flex-start",
                            color: "var(--si-color-text-primary)",
                            fontWeight: 700
                          }}
                        >
                          {item.name}
                        </Button>
                        <Typography.Text style={{ color: "var(--si-color-text-secondary)" }}>
                          {`${item.category} / ${item.subcategory}`}
                        </Typography.Text>
                        <Typography.Text style={{ color: "var(--si-color-text-primary)" }}>
                          {formatRankingCompactNumber(item.star_count)}
                        </Typography.Text>
                        <Typography.Text style={{ color: "var(--si-color-text-primary)" }}>{item.quality_score.toFixed(1)}</Typography.Text>
                        <Typography.Text style={{ color: "var(--si-color-text-secondary)" }}>
                          {formatRankingUpdatedAt(item.updated_at, locale)}
                        </Typography.Text>
                        <Button
                          type="default"
                          size="small"
                          data-testid="ranking-open-skill-button"
                          onClick={() => onNavigate(toSkillPath(item.id))}
                          style={{
                            border: "none",
                            background: "color-mix(in srgb, var(--si-color-muted-surface) 70%, transparent)",
                            color: "var(--si-color-text-primary)"
                          }}
                        >
                          {text.openSkillLabel}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          ) : null}
        </div>
      )}
    </Card>
  );
}
