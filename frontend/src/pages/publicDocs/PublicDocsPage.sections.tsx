import { Button, Card, Tag, Typography } from "antd";

import { PrototypeSplitRow, PrototypeTwoColumnGrid, PrototypeUtilityHeaderActions, PrototypeUtilityPanel } from "../prototype/prototypeCssInJs";
import type { DocsEntry, PublicDocsPageCopyItem } from "./PublicDocsPage.copy";
import type { PrototypePagePalette } from "../prototype/prototypePageTheme";
import type { EndpointMetadata, PublicDocsStats } from "./PublicDocsPage.types";

interface PublicDocsHeroCardProps {
  text: PublicDocsPageCopyItem;
  palette: PrototypePagePalette;
  stats: PublicDocsStats;
  isSessionUser: boolean;
  onOpenMarketplace: () => void;
  onOpenDashboard: () => void;
}

interface PublicDocsCatalogCardProps {
  text: PublicDocsPageCopyItem;
  palette: PrototypePagePalette;
  docsByKey: Map<string, DocsEntry>;
  onOpenExternal: (path: string) => void;
  onOpenInApp: (path: string) => void;
}

interface PublicDocsQuickActionsCardProps {
  text: PublicDocsPageCopyItem;
  palette: PrototypePagePalette;
  onOpenExternal: (path: string) => void;
  onOpenInApp: (path: string) => void;
}

interface PublicDocsEndpointMetadataCardProps {
  text: PublicDocsPageCopyItem;
  palette: PrototypePagePalette;
  endpointMetadata: EndpointMetadata[];
}

const flatCardStyle = {
  borderRadius: 14,
  border: "none",
  background: "color-mix(in srgb, var(--si-color-surface) 72%, transparent)",
  boxShadow: "none"
} as const;

const mutedPanelStyle = {
  borderRadius: 10,
  border: "none",
  background: "color-mix(in srgb, var(--si-color-muted-surface) 52%, transparent)",
  padding: 10,
  display: "grid",
  gap: 8
} as const;

export function PublicDocsHeroCard({
  text,
  palette,
  stats,
  isSessionUser,
  onOpenMarketplace,
  onOpenDashboard
}: PublicDocsHeroCardProps) {
  const metrics = [
    { label: text.metricTotalDocs, value: stats.totalDocs },
    { label: text.metricSpecs, value: stats.specDocs },
    { label: text.metricTools, value: stats.interactiveTools },
    { label: text.metricInApp, value: stats.inAppRoutes }
  ];

  return (
    <Card
      variant="borderless"
      style={{
        borderRadius: 16,
        border: "none",
        background: "color-mix(in srgb, var(--si-color-panel) 82%, transparent)",
        boxShadow: "none",
        backdropFilter: "blur(10px) saturate(120%)"
      }}
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
            {text.title}
          </Typography.Title>
          <Typography.Paragraph
            style={{
              margin: 0,
              color: palette.headerSubtitle,
              fontSize: "0.82rem",
              maxWidth: "72ch"
            }}
          >
            {text.subtitle}
          </Typography.Paragraph>
          <Typography.Text
            style={{
              color: palette.headerSubtitle,
              fontSize: "0.78rem",
              letterSpacing: "0.02em"
            }}
          >
            {text.summaryTitle}: {text.summarySubtitle}
          </Typography.Text>
        </div>
        <PrototypeUtilityHeaderActions>
          <Button onClick={onOpenMarketplace}>{text.openMarketplace}</Button>
          <Button type="primary" onClick={onOpenDashboard}>
            {isSessionUser ? text.openDashboard : text.signIn}
          </Button>
        </PrototypeUtilityHeaderActions>
      </PrototypeSplitRow>
      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 10
        }}
      >
        {metrics.map((metric) => (
          <div
            key={metric.label}
            style={{
              borderRadius: 12,
              border: "none",
              background: "color-mix(in srgb, var(--si-color-muted-surface) 52%, transparent)",
              padding: "10px 12px",
              display: "grid",
              gap: 3
            }}
          >
            <Typography.Text
              style={{
                color: palette.metricLabel,
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}
            >
              {metric.label}
            </Typography.Text>
            <Typography.Text
              style={{
                color: palette.metricValue,
                fontSize: "1.2rem",
                fontWeight: 700
              }}
            >
              {metric.value}
            </Typography.Text>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function PublicDocsCatalogCard({ text, palette, docsByKey, onOpenExternal, onOpenInApp }: PublicDocsCatalogCardProps) {
  return (
    <Card variant="borderless" style={flatCardStyle} title={text.docsSectionTitle} styles={{ body: { display: "grid", gap: 12 } }}>
      {text.categories.map((category) => (
        <div
          key={category.key}
          style={{
            borderRadius: 12,
            border: "none",
            background: "color-mix(in srgb, var(--si-color-muted-surface) 52%, transparent)",
            padding: 10,
            display: "grid",
            gap: 10
          }}
        >
          <div style={{ display: "grid", gap: 4 }}>
            <Typography.Text style={{ color: palette.headerTitle, fontSize: "0.85rem", fontWeight: 700 }}>
              {category.title}
            </Typography.Text>
            <Typography.Text style={{ color: palette.headerSubtitle, fontSize: "0.76rem", lineHeight: 1.45 }}>
              {category.summary}
            </Typography.Text>
          </div>
          {category.docsKeys
            .map((docsKey) => docsByKey.get(docsKey))
            .filter((entry): entry is DocsEntry => Boolean(entry))
            .map((entry) => (
              <div
                key={entry.key}
                style={{
                  borderRadius: 10,
                  border: "none",
                  background: "color-mix(in srgb, var(--si-color-surface) 66%, transparent)",
                  padding: 10,
                  display: "grid",
                  gap: 8
                }}
              >
                <PrototypeSplitRow>
                  <Typography.Text style={{ color: palette.cardTitle, fontWeight: 700 }}>{entry.title}</Typography.Text>
                  <Tag color="blue">{entry.badge}</Tag>
                </PrototypeSplitRow>
                <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.8rem", lineHeight: 1.45 }}>
                  {entry.summary}
                </Typography.Paragraph>
                <PrototypeUtilityHeaderActions>
                  <Button type="primary" onClick={() => onOpenExternal(entry.path)}>
                    {text.openLink}
                  </Button>
                  <Button onClick={() => (entry.appPath ? onOpenInApp(entry.appPath) : onOpenExternal(entry.path))}>{text.openInApp}</Button>
                </PrototypeUtilityHeaderActions>
              </div>
            ))}
        </div>
      ))}
    </Card>
  );
}

export function PublicDocsQuickActionsCard({ text, palette, onOpenExternal, onOpenInApp }: PublicDocsQuickActionsCardProps) {
  return (
    <Card variant="borderless" style={flatCardStyle} title={text.quickActionsTitle} styles={{ body: { display: "grid", gap: 10 } }}>
      {text.quickActions.map((action) => (
        <div key={action.key} style={mutedPanelStyle}>
          <Typography.Text style={{ color: palette.headerTitle, fontWeight: 700 }}>{action.title}</Typography.Text>
          <Typography.Text style={{ color: palette.headerSubtitle, fontSize: "0.77rem", lineHeight: 1.45 }}>{action.summary}</Typography.Text>
          <Button type="primary" onClick={() => (action.inApp ? onOpenInApp(action.path) : onOpenExternal(action.path))}>
            {action.inApp ? text.openInApp : text.openLink}
          </Button>
        </div>
      ))}
    </Card>
  );
}

export function PublicDocsEndpointMetadataCard({ text, palette, endpointMetadata }: PublicDocsEndpointMetadataCardProps) {
  return (
    <Card variant="borderless" style={flatCardStyle} title={text.endpointMetadataTitle} styles={{ body: { display: "grid", gap: 10 } }}>
      {endpointMetadata.map((meta) => (
        <div
          key={meta.key}
          style={{
            borderRadius: 10,
            border: "none",
            background: "color-mix(in srgb, var(--si-color-muted-surface) 52%, transparent)",
            padding: 10,
            display: "grid",
            gap: 4
          }}
        >
          <Typography.Text
            style={{
              color: palette.metricLabel,
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}
          >
            {meta.label}
          </Typography.Text>
          <Typography.Text style={{ color: palette.metricValue, fontSize: "0.78rem", wordBreak: "break-all" }}>{meta.value}</Typography.Text>
          <Typography.Text style={{ color: palette.headerSubtitle, fontSize: "0.75rem", lineHeight: 1.4 }}>{meta.summary}</Typography.Text>
        </div>
      ))}
    </Card>
  );
}

interface PublicDocsMainPanelProps {
  text: PublicDocsPageCopyItem;
  palette: PrototypePagePalette;
  docsByKey: Map<string, DocsEntry>;
  endpointMetadata: EndpointMetadata[];
  onOpenExternal: (path: string) => void;
  onOpenInApp: (path: string) => void;
}

export function PublicDocsMainPanel({
  text,
  palette,
  docsByKey,
  endpointMetadata,
  onOpenExternal,
  onOpenInApp
}: PublicDocsMainPanelProps) {
  return (
    <PrototypeUtilityPanel style={{ background: "transparent", border: "none", padding: 0 }}>
      <PrototypeTwoColumnGrid>
        <PublicDocsCatalogCard text={text} palette={palette} docsByKey={docsByKey} onOpenExternal={onOpenExternal} onOpenInApp={onOpenInApp} />
        <div style={{ display: "grid", gap: 10 }}>
          <PublicDocsQuickActionsCard text={text} palette={palette} onOpenExternal={onOpenExternal} onOpenInApp={onOpenInApp} />
          <PublicDocsEndpointMetadataCard text={text} palette={palette} endpointMetadata={endpointMetadata} />
        </div>
      </PrototypeTwoColumnGrid>
    </PrototypeUtilityPanel>
  );
}
