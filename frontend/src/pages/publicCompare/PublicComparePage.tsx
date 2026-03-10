import { Alert, Button, Card, Empty, Select, Space, Spin, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { PublicMarketplaceResponse, SessionUser, fetchPublicMarketplace } from "../../lib/api";
import { AppLocale } from "../../lib/i18n";
import {
  PrototypeMetricTable,
  PrototypeMetricTableHead,
  PrototypeMetricTableLabel,
  PrototypeMetricTableRow,
  PrototypeMetricTableValue,
  PrototypeSplitRow,
  PrototypeTwoColumnGrid,
  PrototypeUtilityHeaderActions,
  PrototypeUtilityLoading,
  PrototypeUtilityPanel,
  PrototypeUtilityShell
} from "../prototype/prototypeCssInJs";
import { createPrototypePalette, isLightPrototypePath } from "../prototype/prototypePageTheme";
import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";
import { buildMarketplaceFallback } from "../marketplaceHome/MarketplaceHomePage.fallback";

interface PublicComparePageProps {
  locale: AppLocale;
  locationKey: string;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
}

interface CompareQueryState {
  left: number;
  right: number;
}

function parseQueryState(search: string): CompareQueryState {
  const params = new URLSearchParams(search);
  const left = Number(params.get("left") || params.get("primary") || "0");
  const right = Number(params.get("right") || "0");
  return {
    left: Number.isFinite(left) && left > 0 ? Math.round(left) : 0,
    right: Number.isFinite(right) && right > 0 ? Math.round(right) : 0
  };
}

function buildComparePath(left: number, right: number, basePath = "/compare"): string {
  const params = new URLSearchParams();
  if (left > 0) {
    params.set("left", String(left));
  }
  if (right > 0) {
    params.set("right", String(right));
  }
  const encoded = params.toString();
  return encoded ? `${basePath}?${encoded}` : basePath;
}

const copy = {
  en: {
    title: "Skill Comparison Center",
    subtitle: "Select two skills and compare quality, popularity, and freshness in one place.",
    leftSkill: "Left Skill",
    rightSkill: "Right Skill",
    metric: "Metric",
    stars: "Stars",
    quality: "Quality",
    updated: "Updated",
    source: "Source",
    category: "Category",
    subcategory: "Subcategory",
    tags: "Tags",
    notAvailable: "n/a",
    noSkills: "No public skills available for comparison",
    loading: "Loading comparison data",
    loadError: "Failed to load comparison data",
    openDetail: "Open Detail",
    openMarketplace: "Back to Marketplace",
    openDashboard: "Open Dashboard",
    signIn: "Sign In",
    decidePrimary: "Use as Primary",
    compareMatrix: "Comparison Matrix"
  },
  zh: {
    title: "\u6280\u80fd\u5bf9\u6bd4\u4e2d\u5fc3",
    subtitle: "\u9009\u62e9\u4e24\u4e2a\u6280\u80fd\uff0c\u5bf9\u6bd4\u8d28\u91cf\u3001\u70ed\u5ea6\u4e0e\u66f4\u65b0\u65f6\u6548\u3002",
    leftSkill: "\u5de6\u4fa7\u6280\u80fd",
    rightSkill: "\u53f3\u4fa7\u6280\u80fd",
    metric: "\u6307\u6807",
    stars: "\u661f\u6807",
    quality: "\u8d28\u91cf",
    updated: "\u66f4\u65b0\u65f6\u95f4",
    source: "\u6765\u6e90",
    category: "\u5206\u7c7b",
    subcategory: "\u5b50\u5206\u7c7b",
    tags: "\u6807\u7b7e",
    notAvailable: "\u6682\u65e0",
    noSkills: "\u5f53\u524d\u6ca1\u6709\u53ef\u5bf9\u6bd4\u7684\u516c\u5f00\u6280\u80fd",
    loading: "\u6b63\u5728\u52a0\u8f7d\u5bf9\u6bd4\u6570\u636e",
    loadError: "\u52a0\u8f7d\u5bf9\u6bd4\u6570\u636e\u5931\u8d25",
    openDetail: "\u67e5\u770b\u8be6\u60c5",
    openMarketplace: "\u8fd4\u56de\u5e02\u573a",
    openDashboard: "\u6253\u5f00\u63a7\u5236\u53f0",
    signIn: "\u767b\u5f55",
    decidePrimary: "\u8bbe\u4e3a\u4e3b\u9009",
    compareMatrix: "\u5bf9\u6bd4\u77e9\u9635"
  }
};

type CompareDataMode = "prototype" | "live";

function resolveCompareDataMode(rawMode: string | undefined): CompareDataMode {
  const normalized = String(rawMode || "").trim().toLowerCase();
  return normalized === "live" ? "live" : "prototype";
}

function findSkillByID(payload: PublicMarketplaceResponse | null, skillID: number) {
  if (!payload || skillID <= 0) {
    return null;
  }
  return payload.items.find((item) => item.id === skillID) || null;
}

type CompareSkill = PublicMarketplaceResponse["items"][number];

export default function PublicComparePage({ locale, locationKey, onNavigate, sessionUser }: PublicComparePageProps) {
  const text = copy[locale];
  const currentPath = window.location.pathname;
  const lightMode = isLightPrototypePath(currentPath);
  const palette = useMemo(() => createPrototypePalette(lightMode), [lightMode]);
  const navigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);
  const dataMode = useMemo<CompareDataMode>(() => resolveCompareDataMode(import.meta.env.VITE_MARKETPLACE_HOME_MODE), []);
  const compareBasePath = navigator.toPublic("/compare");
  const [payload, setPayload] = useState<PublicMarketplaceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const queryState = useMemo(() => parseQueryState(window.location.search), [locationKey]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    const fallbackPayload = buildMarketplaceFallback({ sort: "stars", page: 1 }, locale, sessionUser);
    if (dataMode === "prototype") {
      setPayload(fallbackPayload);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    fetchPublicMarketplace({ sort: "stars", page: 1 })
      .then((data) => {
        if (!active) {
          return;
        }
        setPayload(data);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setPayload(fallbackPayload);
        setError("");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [dataMode, locale, sessionUser]);

  const items = payload?.items || [];
  const fallbackLeftID = items[0]?.id || 0;
  const fallbackRightID = items[1]?.id || items[0]?.id || 0;
  const localeTag = locale === "zh" ? "zh-CN" : "en-US";

  const leftID = queryState.left || fallbackLeftID;
  const rightID = queryState.right || (leftID === fallbackRightID ? items[2]?.id || fallbackRightID : fallbackRightID);

  const leftSkill = findSkillByID(payload, leftID) || items[0] || null;
  const rightSkill =
    findSkillByID(payload, rightID) ||
    items.find((item) => item.id !== leftSkill?.id) ||
    leftSkill ||
    null;

  const selectOptions = items.map((item) => ({
    label: `${item.name} (#${item.id})`,
    value: item.id
  }));

  const compareRows = [
    { key: "stars", label: text.stars, left: leftSkill?.star_count, right: rightSkill?.star_count },
    { key: "quality", label: text.quality, left: leftSkill?.quality_score, right: rightSkill?.quality_score },
    {
      key: "updated",
      label: text.updated,
      left: leftSkill ? new Date(leftSkill.updated_at).toLocaleDateString(localeTag) : "",
      right: rightSkill ? new Date(rightSkill.updated_at).toLocaleDateString(localeTag) : ""
    },
    { key: "source", label: text.source, left: leftSkill?.source_type, right: rightSkill?.source_type },
    { key: "category", label: text.category, left: leftSkill?.category, right: rightSkill?.category },
    { key: "subcategory", label: text.subcategory, left: leftSkill?.subcategory, right: rightSkill?.subcategory }
  ];

  function updateSelection(nextLeftID: number, nextRightID: number) {
    onNavigate(buildComparePath(nextLeftID, nextRightID, compareBasePath));
  }

  function renderValue(value: unknown): string {
    if (value === undefined || value === null || value === "") {
      return text.notAvailable;
    }
    return String(value);
  }

  function resolvePrimaryPath() {
    if (leftSkill) {
      return navigator.toPublic(`/skills/${leftSkill.id}`);
    }
    return navigator.toPublic("/");
  }

  function formatUpdatedAt(value: string | undefined): string {
    if (!value) {
      return text.notAvailable;
    }
    return new Date(value).toLocaleDateString(localeTag);
  }

  function renderMetricChip(label: string, value: unknown) {
    return (
      <div
        style={{
          borderRadius: 9,
          border: `1px solid ${palette.cardBorder}`,
          background: lightMode ? "#f8f4eb" : "#17365f",
          padding: "8px 9px",
          display: "grid",
          gap: 2
        }}
      >
        <Typography.Text style={{ color: palette.metricLabel, fontSize: "0.66rem", textTransform: "uppercase", fontWeight: 700 }}>
          {label}
        </Typography.Text>
        <Typography.Text strong style={{ color: palette.cardTitle, fontSize: "0.82rem" }}>
          {renderValue(value)}
        </Typography.Text>
      </div>
    );
  }

  function renderSkillCard(skill: CompareSkill, tagColor: string, onPromote: () => void) {
    return (
      <Card
        variant="borderless"
        style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
        styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
      >
        <PrototypeSplitRow style={{ alignItems: "center" }}>
          <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "1rem" }}>
            {skill.name}
          </Typography.Title>
          <Tag color={tagColor}>#{skill.id}</Tag>
        </PrototypeSplitRow>
        <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.79rem", lineHeight: 1.45 }}>
          {skill.description || text.notAvailable}
        </Typography.Paragraph>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
          {renderMetricChip(text.stars, skill.star_count)}
          {renderMetricChip(text.quality, skill.quality_score)}
          {renderMetricChip(text.updated, formatUpdatedAt(skill.updated_at))}
        </div>
        <Typography.Text style={{ color: palette.metricLabel, fontSize: "0.69rem", textTransform: "uppercase", fontWeight: 700 }}>
          {text.tags}
        </Typography.Text>
        <Space wrap size={[6, 6]}>
          {skill.tags.slice(0, 6).map((tag) => (
            <Tag key={`${skill.id}-${tag}`}>{tag}</Tag>
          ))}
        </Space>
        <Space wrap>
          <Button onClick={() => onNavigate(navigator.toPublic(`/skills/${skill.id}`))}>{text.openDetail}</Button>
          <Button type="primary" onClick={onPromote}>
            {text.decidePrimary}
          </Button>
        </Space>
      </Card>
    );
  }

  return (
    <PrototypeUtilityShell>
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
                fontFamily: "\"Syne\", sans-serif",
                fontSize: "clamp(1.12rem, 2.5vw, 1.72rem)",
                lineHeight: 1.18
              }}
            >
              {text.title}
            </Typography.Title>
            <Typography.Paragraph style={{ margin: 0, color: palette.headerSubtitle, fontSize: "0.82rem", maxWidth: "72ch" }}>
              {text.subtitle}
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

      <PrototypeUtilityPanel>
        <Card
          variant="borderless"
          style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
          styles={{ body: { padding: 12, display: "grid", gap: 10 } }}
        >
          <PrototypeSplitRow style={{ alignItems: "end", gap: 10 }}>
            <div style={{ display: "grid", gap: 5, flex: 1, minWidth: 220 }}>
              <Typography.Text style={{ color: palette.metricLabel, fontSize: "0.69rem", textTransform: "uppercase", fontWeight: 700 }}>
                {text.leftSkill}
              </Typography.Text>
              <Select
                value={leftSkill?.id}
                options={selectOptions}
                onChange={(value) => updateSelection(value, rightSkill?.id || value)}
              />
            </div>
            <div style={{ display: "grid", gap: 5, flex: 1, minWidth: 220 }}>
              <Typography.Text style={{ color: palette.metricLabel, fontSize: "0.69rem", textTransform: "uppercase", fontWeight: 700 }}>
                {text.rightSkill}
              </Typography.Text>
              <Select
                value={rightSkill?.id}
                options={selectOptions}
                onChange={(value) => updateSelection(leftSkill?.id || value, value)}
              />
            </div>
            <Space wrap size={[8, 8]}>
              <Button onClick={() => onNavigate(leftSkill ? navigator.toPublic(`/skills/${leftSkill.id}`) : navigator.toPublic("/"))}>
                {text.openDetail}
              </Button>
              <Button type="primary" onClick={() => onNavigate(resolvePrimaryPath())}>
                {text.decidePrimary}
              </Button>
            </Space>
          </PrototypeSplitRow>
        </Card>

        {loading ? (
          <PrototypeUtilityLoading>
            <Spin description={text.loading} />
          </PrototypeUtilityLoading>
        ) : null}
        {!loading && error ? <Alert type="error" showIcon message={error} /> : null}
        {!loading && !error && items.length === 0 ? <Empty description={text.noSkills} /> : null}

        {!loading && !error && leftSkill && rightSkill ? (
          <PrototypeTwoColumnGrid>
            {renderSkillCard(leftSkill, lightMode ? "geekblue" : "blue", () => updateSelection(leftSkill.id, rightSkill.id))}
            {renderSkillCard(rightSkill, lightMode ? "volcano" : "orange", () => updateSelection(rightSkill.id, leftSkill.id))}
          </PrototypeTwoColumnGrid>
        ) : null}

        {!loading && !error && leftSkill && rightSkill ? (
          <Card
            variant="borderless"
            style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
            styles={{ body: { padding: 12, display: "grid", gap: 12 } }}
          >
            <PrototypeSplitRow style={{ alignItems: "center" }}>
              <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.95rem" }}>
                {text.compareMatrix}
              </Typography.Title>
              <Typography.Text style={{ color: palette.metricLabel, fontSize: "0.74rem" }}>
                #{leftSkill.id} vs #{rightSkill.id}
              </Typography.Text>
            </PrototypeSplitRow>
            <PrototypeMetricTable>
              <PrototypeMetricTableHead>{text.metric}</PrototypeMetricTableHead>
              <PrototypeMetricTableHead>{leftSkill.name}</PrototypeMetricTableHead>
              <PrototypeMetricTableHead>{rightSkill.name}</PrototypeMetricTableHead>
              {compareRows.map((row) => (
                <PrototypeMetricTableRow key={row.key}>
                  <PrototypeMetricTableLabel>{row.label}</PrototypeMetricTableLabel>
                  <PrototypeMetricTableValue>{renderValue(row.left)}</PrototypeMetricTableValue>
                  <PrototypeMetricTableValue>{renderValue(row.right)}</PrototypeMetricTableValue>
                </PrototypeMetricTableRow>
              ))}
            </PrototypeMetricTable>
            <PrototypeSplitRow style={{ alignItems: "center" }}>
              <Typography.Text style={{ color: palette.headerSubtitle, fontSize: "0.75rem" }}>
                {text.leftSkill}: {leftSkill.name}
              </Typography.Text>
              <Space wrap>
                <Button onClick={() => onNavigate(navigator.toPublic(`/skills/${leftSkill.id}`))}>{text.openDetail}</Button>
                <Button type="primary" onClick={() => onNavigate(resolvePrimaryPath())}>
                  {text.decidePrimary}
                </Button>
              </Space>
            </PrototypeSplitRow>
          </Card>
        ) : null}
      </PrototypeUtilityPanel>
    </PrototypeUtilityShell>
  );
}
