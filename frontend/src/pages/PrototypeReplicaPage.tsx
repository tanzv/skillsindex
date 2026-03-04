import { Button, Card, Empty, Select, Tag, Typography } from "antd";
import { useMemo } from "react";
import { SessionUser } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import {
  PrototypeCatalogEntry,
  groupPrototypeEntriesByRoutePrefix,
  instantiatePrototypeRoute,
  prototypeCatalog
} from "../lib/prototypeCatalog";
import {
  PrototypeMetaGrid,
  PrototypeRelatedGrid,
  PrototypeSplitRow,
  PrototypeUtilityHeaderActions,
  PrototypeUtilityPanel,
  PrototypeUtilityShell
} from "./prototypeCssInJs";
import { createPrototypePalette, isLightPrototypePath } from "./prototypePageTheme";

interface PrototypeReplicaPageProps {
  locale: AppLocale;
  currentPath: string;
  entry: PrototypeCatalogEntry;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
}

function normalizedRoute(routePattern: string): string {
  return instantiatePrototypeRoute(routePattern);
}

function resolveRouteFamilyPrefix(routePattern: string): string {
  const route = normalizedRoute(routePattern);
  if (route.startsWith("/mobile/light/admin")) {
    return "/mobile/light/admin";
  }
  if (route.startsWith("/mobile/admin")) {
    return "/mobile/admin";
  }
  if (route.startsWith("/light/admin")) {
    return "/light/admin";
  }
  if (route.startsWith("/admin")) {
    return "/admin";
  }
  if (route.startsWith("/mobile/light")) {
    return "/mobile/light";
  }
  if (route.startsWith("/mobile")) {
    return "/mobile";
  }
  if (route.startsWith("/light")) {
    return "/light";
  }
  if (route.startsWith("/skills")) {
    return "/skills";
  }
  return "/";
}

const copy = {
  en: {
    title: "Prototype Replica",
    subtitle:
      "This route is now mapped in React and rendered from the prototype catalog, including direct navigation between related prototype pages.",
    routeLabel: "Route",
    keyLabel: "Prototype Key",
    familyLabel: "Route Family",
    openDashboard: "Open Dashboard",
    signIn: "Sign In",
    openMarketplace: "Marketplace",
    openDocs: "Docs",
    openCompare: "Compare",
    catalogJump: "Catalog Jump",
    relatedRoutes: "Related Prototype Routes",
    noRelatedRoutes: "No related routes in this family",
    previewMissing: "Preview image is not available for this prototype route",
    openRoute: "Open Route",
    routeCount: "Catalog Size",
    current: "Current",
    activeSession: "Active Session",
    guestSession: "Guest"
  },
  zh: {
    title: "\u539f\u578b\u590d\u523b\u9875",
    subtitle:
      "\u5f53\u524d\u8def\u7531\u5df2\u63a5\u5165 React\uff0c\u5e76\u57fa\u4e8e\u539f\u578b\u76ee\u5f55\u6e32\u67d3\uff0c\u53ef\u5728\u76f8\u5173\u539f\u578b\u9875\u4e4b\u95f4\u76f4\u63a5\u8df3\u8f6c\u3002",
    routeLabel: "\u8def\u7531",
    keyLabel: "\u539f\u578b\u952e",
    familyLabel: "\u8def\u7531\u7ec4",
    openDashboard: "\u6253\u5f00\u63a7\u5236\u53f0",
    signIn: "\u767b\u5f55",
    openMarketplace: "\u5e02\u573a",
    openDocs: "\u6587\u6863",
    openCompare: "\u5bf9\u6bd4",
    catalogJump: "\u76ee\u5f55\u8df3\u8f6c",
    relatedRoutes: "\u540c\u7ec4\u539f\u578b\u8def\u7531",
    noRelatedRoutes: "\u8be5\u7ec4\u6682\u65e0\u5176\u4ed6\u8def\u7531",
    previewMissing: "\u8be5\u539f\u578b\u8def\u7531\u6682\u65e0\u9884\u89c8\u56fe",
    openRoute: "\u6253\u5f00",
    routeCount: "\u76ee\u5f55\u603b\u91cf",
    current: "\u5f53\u524d",
    activeSession: "\u5df2\u767b\u5f55",
    guestSession: "\u8bbf\u5ba2"
  }
};

export default function PrototypeReplicaPage({
  locale,
  currentPath,
  entry,
  onNavigate,
  sessionUser
}: PrototypeReplicaPageProps) {
  const text = copy[locale];
  const lightMode = useMemo(() => isLightPrototypePath(currentPath), [currentPath]);
  const palette = useMemo(() => createPrototypePalette(lightMode), [lightMode]);
  const familyPrefix = resolveRouteFamilyPrefix(entry.primaryRoute);

  const relatedRoutes = useMemo(
    () =>
      groupPrototypeEntriesByRoutePrefix(familyPrefix)
        .filter((item) => item.key !== entry.key)
        .slice(0, 18),
    [familyPrefix, entry.key]
  );

  const catalogOptions = useMemo(
    () =>
      prototypeCatalog.map((item) => ({
        label: `${item.name} · ${instantiatePrototypeRoute(item.primaryRoute)}`,
        value: instantiatePrototypeRoute(item.primaryRoute)
      })),
    []
  );

  const targetRoute = instantiatePrototypeRoute(entry.primaryRoute);

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
            <Button onClick={() => onNavigate("/")}>{text.openMarketplace}</Button>
            <Button onClick={() => onNavigate("/compare")}>{text.openCompare}</Button>
            <Button onClick={() => onNavigate("/docs")}>{text.openDocs}</Button>
            <Button type="primary" onClick={() => onNavigate(sessionUser ? "/admin/overview" : "/login")}>
              {sessionUser ? text.openDashboard : text.signIn}
            </Button>
          </PrototypeUtilityHeaderActions>
        </PrototypeSplitRow>
      </Card>

      <PrototypeUtilityPanel>
        <PrototypeMetaGrid>
          <Card
            variant="borderless"
            style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
            title={text.routeLabel}
            styles={{ body: { display: "grid", gap: 8 } }}
          >
            <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.82rem", wordBreak: "break-word" }}>
              {targetRoute}
            </Typography.Paragraph>
            <Tag color="geekblue">{text.current}</Tag>
            <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.82rem", wordBreak: "break-word" }}>
              {currentPath}
            </Typography.Paragraph>
          </Card>
          <Card
            variant="borderless"
            style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
            title={text.keyLabel}
          >
            <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.82rem", wordBreak: "break-word" }}>
              {entry.key}
            </Typography.Paragraph>
          </Card>
          <Card
            variant="borderless"
            style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
            title={text.familyLabel}
          >
            <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.82rem", wordBreak: "break-word" }}>
              {familyPrefix}
            </Typography.Paragraph>
          </Card>
          <Card
            variant="borderless"
            style={{ borderRadius: 13, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
            title={text.routeCount}
            styles={{ body: { display: "grid", gap: 8 } }}
          >
            <Typography.Paragraph style={{ margin: 0, color: palette.cardText, fontSize: "0.82rem" }}>
              {prototypeCatalog.length}
            </Typography.Paragraph>
            <Tag color={sessionUser ? "green" : "default"}>
              {sessionUser ? `${text.activeSession}: ${sessionUser.username}` : text.guestSession}
            </Tag>
          </Card>
        </PrototypeMetaGrid>

        <Card
          variant="borderless"
          style={{ borderRadius: 12, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
          styles={{ body: { display: "grid", gap: 8 } }}
        >
          <Typography.Text style={{ color: palette.metricLabel, fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>
            {text.catalogJump}
          </Typography.Text>
          <Select
            showSearch
            options={catalogOptions}
            value={targetRoute}
            onChange={(value) => onNavigate(value)}
            optionFilterProp="label"
          />
        </Card>

        <Card
          variant="borderless"
          style={{ borderRadius: 14, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
          styles={{ body: { padding: 8 } }}
        >
          {entry.previewURL ? (
            <img
              src={entry.previewURL}
              alt={`${entry.name} preview`}
              loading="lazy"
              style={{ width: "100%", borderRadius: 10, display: "block" }}
            />
          ) : (
            <Empty description={text.previewMissing} />
          )}
        </Card>

        <Card
          variant="borderless"
          style={{ borderRadius: 14, border: `1px solid ${palette.cardBorder}`, background: palette.cardBackground }}
          styles={{ body: { display: "grid", gap: 8 } }}
        >
          <Typography.Title level={4} style={{ margin: 0, color: palette.cardTitle, fontSize: "0.92rem" }}>
            {text.relatedRoutes}
          </Typography.Title>
          {relatedRoutes.length === 0 ? (
            <Typography.Paragraph style={{ margin: "8px 0 0", color: palette.cardText, fontSize: "0.8rem" }}>
              {text.noRelatedRoutes}
            </Typography.Paragraph>
          ) : (
            <PrototypeRelatedGrid>
              {relatedRoutes.map((item) => {
                const route = instantiatePrototypeRoute(item.primaryRoute);
                return (
                  <Button
                    key={item.key}
                    onClick={() => onNavigate(route)}
                    style={{
                      borderRadius: 10,
                      minHeight: 84,
                      justifyContent: "flex-start",
                      textAlign: "left"
                    }}
                  >
                    <div style={{ display: "grid", gap: 4 }}>
                      <Typography.Text strong style={{ fontSize: "0.78rem" }}>{item.name}</Typography.Text>
                      <Typography.Text style={{ fontSize: "0.68rem" }}>{route}</Typography.Text>
                      <Typography.Text style={{ fontSize: "0.66rem", color: "#67c7ff" }}>{text.openRoute}</Typography.Text>
                    </div>
                  </Button>
                );
              })}
            </PrototypeRelatedGrid>
          )}
        </Card>
      </PrototypeUtilityPanel>
    </PrototypeUtilityShell>
  );
}
