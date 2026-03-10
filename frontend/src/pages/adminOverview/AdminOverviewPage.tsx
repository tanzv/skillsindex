import { Alert, Button, Spin } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchConsoleJSON } from "../../lib/api";
import {
  type AdminOverviewPayload,
  buildModuleActions,
  computeAdminOverviewScale,
  fallbackErrorMessage,
  normalizeOverview,
  ratioPart,
  roleCards,
  routeIndexEntries,
  securityEntryRoutes,
  trafficBars
} from "./AdminOverviewPage.helpers";
import { adminOverviewColors, adminOverviewStyles } from "./AdminOverviewPage.styles";
import { resolveAdminBase } from "../prototype/prototypePageTheme";

interface AdminOverviewPageProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

const timelineEvents = [
  { color: "#2DD4BF", text: "10:32 Role policy bundle v12 released to 3 environments." },
  { color: "#60A5FA", text: "09:47 Import job completed 218 rows with 2 warnings." },
  { color: "#F59E0B", text: "08:58 Webhook retry recovered in 1.2s." },
  { color: "#A78BFA", text: "08:06 New connector registered: Azure DevOps." }
] as const;

const canvasWidth = 1440;
const canvasHeight = 900;

function renderChip(text: string, background: string) {
  return (
    <span style={{ ...adminOverviewStyles.chip, background }}>
      {text}
    </span>
  );
}

function renderMutedText(text: string) {
  return (
    <span
      style={{
        color: adminOverviewColors.textMuted,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10,
        fontWeight: 600,
        lineHeight: "14px"
      }}
    >
      {text}
    </span>
  );
}

export default function AdminOverviewPage({ currentPath, onNavigate }: AdminOverviewPageProps) {
  const pathname = currentPath || window.location.pathname;
  const adminBase = useMemo(() => resolveAdminBase(pathname), [pathname]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);
  const [overview, setOverview] = useState(() => normalizeOverview(null));
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));

  const moduleActions = useMemo(() => buildModuleActions(adminBase), [adminBase]);

  useEffect(() => {
    function handleResize() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const refresh = useCallback(() => {
    setReloadVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetchConsoleJSON<AdminOverviewPayload>("/api/v1/admin/overview")
      .then((payload) => {
        if (!active) {
          return;
        }
        setOverview(normalizeOverview(payload));
      })
      .catch((requestError) => {
        if (!active) {
          return;
        }
        const message = requestError instanceof Error ? requestError.message : fallbackErrorMessage;
        setError(message || fallbackErrorMessage);
        setOverview((current) => (current.totalSkills === 0 ? normalizeOverview(null) : current));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [reloadVersion]);

  const scale = useMemo(
    () => computeAdminOverviewScale(viewport.width, viewport.height, canvasWidth, canvasHeight),
    [viewport.width, viewport.height]
  );
  const stageWidth = Math.max(1, Math.round(canvasWidth * scale));
  const stageHeight = Math.max(1, Math.round(canvasHeight * scale));

  const safeTotal = Math.max(overview.totalSkills, 1);
  const privatePercent = ratioPart(overview.privateSkills, safeTotal);
  const syncPercent = ratioPart(overview.syncableSkills, safeTotal);
  const activeCapacityPercent = Math.max(syncPercent, privatePercent);

  function navigateTo(path: string): void {
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <div style={adminOverviewStyles.stageShell}>
      <div style={{ width: stageWidth, height: stageHeight, overflow: "hidden" }} data-testid="admin-overview-stage">
        <div style={{ ...adminOverviewStyles.stage, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <section style={adminOverviewStyles.topBar}>
            <h1 style={adminOverviewStyles.topTitle}>Admin Navigation Dashboard</h1>
            <div style={adminOverviewStyles.chipRow}>
              {renderChip("nav ready", adminOverviewColors.cardBase)}
              {renderChip("todo +6", adminOverviewColors.cardHighlight)}
              {renderChip(error ? "health warn" : "health ok", adminOverviewColors.cardBase)}
            </div>
          </section>

          {error ? (
            <div style={adminOverviewStyles.alertWrap}>
              <Alert
                type="error"
                showIcon
                message="Admin overview request failed"
                description={error}
                action={
                  <Button size="small" onClick={refresh}>
                    Retry
                  </Button>
                }
              />
            </div>
          ) : null}

          <section style={adminOverviewStyles.mainGrid}>
            <div style={adminOverviewStyles.column}>
              <article style={{ ...adminOverviewStyles.card, height: 202, padding: "16px 18px", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 26 }}>
                  <span style={adminOverviewStyles.cardHeader}>Core Modules</span>
                  {renderChip("online 6/6", adminOverviewColors.chipBlue)}
                </div>

                {[0, 1].map((rowIndex) => (
                  <div
                    key={`module-row-${rowIndex}`}
                    style={{ display: "grid", gridTemplateColumns: "repeat(3, 282px)", gap: 8, height: 58 }}
                  >
                    {moduleActions.slice(rowIndex * 3, rowIndex * 3 + 3).map((item) => (
                      <button
                        type="button"
                        key={item.path}
                        onClick={() => navigateTo(item.path)}
                        style={{
                          border: 0,
                          borderRadius: 10,
                          background: adminOverviewColors.cardBase,
                          color: adminOverviewColors.textBody,
                          textAlign: "left",
                          padding: "8px 10px",
                          display: "grid",
                          gap: 4,
                          cursor: "pointer"
                        }}
                      >
                        <span style={{ color: adminOverviewColors.textPrimary, fontSize: 12, fontWeight: 700, lineHeight: "14px" }}>
                          {item.title}
                        </span>
                        <span style={{ color: adminOverviewColors.textMuted, fontSize: 10, fontWeight: 600, lineHeight: "12px" }}>
                          {item.subtitle}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </article>

              <article style={{ ...adminOverviewStyles.card, height: 136, padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 24 }}>
                  <span style={{ ...adminOverviewStyles.cardHeader, fontSize: 13 }}>Todo and Reminders</span>
                  <span style={adminOverviewStyles.cardMeta}>Today 4 items</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 24 }}>
                  <span style={{ color: adminOverviewColors.textBody, fontSize: 11, fontWeight: 600 }}>
                    Review pending: SkillMP incremental import.
                  </span>
                  {renderChip("Process", adminOverviewColors.cardBase)}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 24 }}>
                  <span style={{ color: adminOverviewColors.textBody, fontSize: 11, fontWeight: 600 }}>
                    Credential expiring: GitHub token.
                  </span>
                  {renderChip("View", adminOverviewColors.cardBase)}
                </div>

                {renderMutedText(`Last update: ${loading ? "syncing..." : "2 minutes ago"}`)}
              </article>

              <article style={{ ...adminOverviewStyles.card, height: 220, padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 24 }}>
                  <span style={{ ...adminOverviewStyles.cardHeader, fontSize: 13 }}>Release Audit Timeline</span>
                  <span style={{ color: adminOverviewColors.textHint, fontSize: 11, fontWeight: 700 }}>Past 24h</span>
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  {timelineEvents.map((event) => (
                    <div key={event.text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: event.color,
                          display: "inline-block"
                        }}
                      />
                      <span style={{ color: adminOverviewColors.textBody, fontSize: 11, fontWeight: 600 }}>{event.text}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 26 }}>
                  {renderMutedText("Audit retention: 180 days")}
                  {renderChip("View details", adminOverviewColors.cardBase)}
                </div>
              </article>

              <article style={{ ...adminOverviewStyles.card, height: 190, padding: "14px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 24 }}>
                  <span style={{ ...adminOverviewStyles.cardHeader, fontSize: 13 }}>Traffic and Capacity</span>
                  <span style={{ color: adminOverviewColors.textMuted, fontSize: 10, fontWeight: 700 }}>Peak window 10:00-12:00</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, height: 90, alignItems: "end" }}>
                  {trafficBars.map((item, index) => (
                    <div key={item.label} style={{ display: "grid", justifyItems: "center", gap: 4 }}>
                      <div
                        style={{
                          width: "100%",
                          height: item.value,
                          minHeight: 22,
                          borderRadius: 6,
                          background:
                            index === 0
                              ? adminOverviewColors.cardBase
                              : index === 1
                                ? "#60A5FA"
                                : index === 2
                                  ? "#22D3EE"
                                  : index === 3
                                    ? "#0EA5E9"
                                    : adminOverviewColors.chipBlue
                        }}
                      />
                      <span style={{ color: adminOverviewColors.textMuted, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ borderRadius: 10, background: adminOverviewColors.cardBase, padding: "8px 10px" }}>
                    <span style={{ color: adminOverviewColors.textBody, fontSize: 11, fontWeight: 700 }}>Throughput 32.4k / h</span>
                  </div>
                  <div style={{ borderRadius: 10, background: adminOverviewColors.cardBase, padding: "8px 10px" }}>
                    <span style={{ color: adminOverviewColors.textBody, fontSize: 11, fontWeight: 700 }}>Error rate 0.32%</span>
                  </div>
                </div>

                <span style={{ color: adminOverviewColors.textMuted, fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 600 }}>
                  Capacity threshold 80%, current {activeCapacityPercent}%
                </span>
              </article>
            </div>

            <div style={adminOverviewStyles.column}>
              <article style={{ ...adminOverviewStyles.card, height: 208, background: adminOverviewColors.cardHighlight, padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 26 }}>
                  <span style={adminOverviewStyles.cardHeader}>System Health Overview</span>
                  {renderChip(loading ? "syncing" : "stable", adminOverviewColors.chipBlue)}
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: adminOverviewColors.textBody, fontSize: 11, fontWeight: 700 }}>CPU 43% · Memory 58%</span>
                  <span style={{ color: adminOverviewColors.textBody, fontSize: 11, fontWeight: 600 }}>Queue latency 1.2s (target {"<"} 3s)</span>
                  <span style={{ color: adminOverviewColors.textBody, fontSize: 11, fontWeight: 600 }}>Webhook success rate 99.34%</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {renderChip(overview.canManageUsers ? "Monitor Panel" : "Monitor Pending", adminOverviewColors.chipBlue)}
                  {renderChip(overview.canViewAllSkills ? "Alert Rules" : "Scope Rules", adminOverviewColors.chipBlue)}
                </div>
              </article>

              <article style={{ ...adminOverviewStyles.card, height: 172, padding: "16px 20px" }}>
                <span style={{ ...adminOverviewStyles.cardHeader, fontSize: 13 }}>Target Route Index</span>
                <div style={{ display: "grid", gap: 4 }}>
                  {routeIndexEntries.slice(0, 4).map((item) => (
                    <span key={item} style={{ color: adminOverviewColors.textBody, fontSize: 10, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace' }}>
                      • {item}
                    </span>
                  ))}
                </div>
                <span style={{ color: adminOverviewColors.textMuted, fontSize: 10, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace' }}>
                  • {routeIndexEntries[4]}
                </span>
              </article>

              <article style={{ ...adminOverviewStyles.card, height: 210, padding: "16px 20px" }}>
                <span style={{ ...adminOverviewStyles.cardHeader, fontSize: 13 }}>Role Distribution and Risk</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {roleCards.map((item) => (
                    <div
                      key={item.label}
                      style={{
                        borderRadius: 10,
                        background: adminOverviewColors.cardBase,
                        padding: "8px 10px",
                        display: "grid",
                        gap: 4
                      }}
                    >
                      <span style={{ color: adminOverviewColors.textMuted, fontSize: 10, fontWeight: 700 }}>{item.label}</span>
                      <span style={{ color: adminOverviewColors.textPrimary, fontSize: 18, fontWeight: 700 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <span style={{ color: adminOverviewColors.textBody, fontSize: 11, fontWeight: 600 }}>
                  High-risk roles: 3 (requires this week review)
                </span>
              </article>

              <article style={{ ...adminOverviewStyles.card, height: 158, padding: "14px 20px", gap: 6 }}>
                <span style={{ ...adminOverviewStyles.cardHeader, fontSize: 13 }}>Security and Ops Entry</span>
                <div style={{ display: "grid", gap: 5 }}>
                  {securityEntryRoutes.map((item) => (
                    <span key={item} style={{ color: adminOverviewColors.textBody, fontSize: 10, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace' }}>
                      • {item}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Button size="small" onClick={() => navigateTo(`${adminBase}/ops/metrics`)}>
                    Open Route Map
                  </Button>
                  <Button size="small" onClick={() => navigateTo(`${adminBase}/ops/release-gates`)}>
                    Acceptance Matrix
                  </Button>
                </div>
                {renderMutedText("traceability synced: FR-KEY / NFR-OPS")}
              </article>
            </div>
          </section>

          {loading ? (
            <div style={adminOverviewStyles.loadingWrap}>
              <Spin size="small" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
