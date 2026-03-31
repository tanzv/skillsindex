"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminPageLoadStateFrame, resolveAdminPageLoadState } from "@/src/features/admin/adminPageLoadState";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";
import { adminOverviewBFFEndpoint } from "@/src/lib/routing/protectedSurfaceEndpoints";
import {
  adminAlertsRoute,
  adminRepositoryIntakeRoute
} from "@/src/lib/routing/protectedSurfaceLinks";

import {
  type AdminOverviewSnapshot,
  buildAdminOverviewCapabilityItems,
  buildAdminOverviewDistribution,
  buildAdminOverviewMetrics,
  buildAdminOverviewQuickLinks,
  normalizeAdminOverviewPayload
} from "./model";

export function AdminOverviewPage() {
  const { messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
  const overviewMessages = messages.adminOverview;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snapshot, setSnapshot] = useState<AdminOverviewSnapshot | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await clientFetchJSON(adminOverviewBFFEndpoint);
      setSnapshot(normalizeAdminOverviewPayload(payload));
    } catch (loadError) {
      setSnapshot(null);
      setError(resolveRequestErrorDisplayMessage(loadError, overviewMessages.loadError));
    } finally {
      setLoading(false);
    }
  }, [overviewMessages.loadError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const loadState = resolveAdminPageLoadState({ loading, error, hasData: snapshot !== null });

  const metrics = useMemo(
    () =>
      snapshot
        ? buildAdminOverviewMetrics(snapshot, {
            metricTotalSkillsLabel: overviewMessages.metricTotalSkillsLabel,
            metricTotalSkillsDescription: overviewMessages.metricTotalSkillsDescription,
            metricOrganizationsLabel: overviewMessages.metricOrganizationsLabel,
            metricOrganizationsDescription: overviewMessages.metricOrganizationsDescription,
            metricAccountsLabel: overviewMessages.metricAccountsLabel,
            metricAccountsDescription: overviewMessages.metricAccountsDescription,
            metricManageUsersLabel: overviewMessages.metricManageUsersLabel,
            metricManageUsersDescription: overviewMessages.metricManageUsersDescription,
            valueEnabled: overviewMessages.valueEnabled,
            valueLimited: overviewMessages.valueLimited
          })
        : [],
    [overviewMessages, snapshot]
  );
  const capabilities = useMemo(
    () =>
      snapshot
        ? buildAdminOverviewCapabilityItems(snapshot, {
            capabilityManageUsersLabel: overviewMessages.capabilityManageUsersLabel,
            capabilityViewAllSkillsLabel: overviewMessages.capabilityViewAllSkillsLabel,
            capabilityPrivateCoverageLabel: overviewMessages.capabilityPrivateCoverageLabel,
            capabilitySyncReadyLabel: overviewMessages.capabilitySyncReadyLabel,
            valueEnabled: overviewMessages.valueEnabled,
            valueUnavailable: overviewMessages.valueUnavailable,
            valueScoped: overviewMessages.valueScoped
          })
        : [],
    [overviewMessages, snapshot]
  );
  const distribution = useMemo(
    () =>
      snapshot
        ? buildAdminOverviewDistribution(snapshot, {
            distributionPublicSkillsLabel: overviewMessages.distributionPublicSkillsLabel,
            distributionPrivateSkillsLabel: overviewMessages.distributionPrivateSkillsLabel,
            distributionSyncableSkillsLabel: overviewMessages.distributionSyncableSkillsLabel
          })
        : [],
    [overviewMessages, snapshot]
  );
  const quickLinks = useMemo(
    () =>
      buildAdminOverviewQuickLinks({
        quickLinkSkillGovernanceLabel: overviewMessages.quickLinkSkillGovernanceLabel,
        quickLinkSkillGovernanceDescription: overviewMessages.quickLinkSkillGovernanceDescription,
        quickLinkRepositoryIntakeLabel: overviewMessages.quickLinkRepositoryIntakeLabel,
        quickLinkRepositoryIntakeDescription: overviewMessages.quickLinkRepositoryIntakeDescription,
        quickLinkAccessControlLabel: overviewMessages.quickLinkAccessControlLabel,
        quickLinkAccessControlDescription: overviewMessages.quickLinkAccessControlDescription,
        quickLinkOperationsLabel: overviewMessages.quickLinkOperationsLabel,
        quickLinkOperationsDescription: overviewMessages.quickLinkOperationsDescription
      }),
    [overviewMessages]
  );

  if (loadState !== "ready" || snapshot === null) {
    return (
      <AdminPageLoadStateFrame
        eyebrow={overviewMessages.heroKicker}
        title={overviewMessages.pageTitle}
        description={overviewMessages.pageDescription}
        error={loadState === "error" ? error : undefined}
        actions={
          <button type="button" className="admin-overview-action is-primary" onClick={() => void loadData()}>
            {loading ? commonMessages.refreshing : commonMessages.refresh}
          </button>
        }
      />
    );
  }

  return (
    <div className="admin-overview-stage" data-testid="admin-overview-stage">
      <section className="admin-overview-stage-panel admin-overview-hero">
        <div className="admin-overview-panel-title-row">
          <p className="admin-overview-kicker">{overviewMessages.heroKicker}</p>
          <h1>{overviewMessages.pageTitle}</h1>
          <p className="admin-overview-description">{overviewMessages.pageDescription}</p>
        </div>

        <div className="admin-overview-summary-grid">
          {metrics.map((metric) => (
            <div key={metric.label} className="admin-overview-summary-card">
              <div className="admin-overview-summary-label">{metric.label}</div>
              <div className="admin-overview-summary-value">{metric.value}</div>
              <div className="admin-overview-summary-detail">{metric.description}</div>
            </div>
          ))}
        </div>

        <div className="admin-overview-action-row" data-testid="admin-overview-actions">
          <button type="button" className="admin-overview-action is-primary" onClick={() => void loadData()}>
            {loading ? commonMessages.refreshing : commonMessages.refresh}
          </button>
          <Link href={adminRepositoryIntakeRoute} className="admin-overview-action">
            {overviewMessages.openIntakeAction}
          </Link>
          <Link href={adminAlertsRoute} className="admin-overview-action">
            {overviewMessages.openAlertsAction}
          </Link>
        </div>
      </section>

      <div className="admin-overview-feedback-stack">
        {error ? <div className="admin-overview-message is-error">{error}</div> : null}
      </div>

      <div className="admin-overview-grid">
        <div className="admin-overview-column">
          <section className="admin-overview-stage-panel admin-overview-panel">
            <div className="admin-overview-panel-title-row">
              <p className="admin-overview-section-kicker">{overviewMessages.distributionKicker}</p>
              <h2>{overviewMessages.distributionTitle}</h2>
              <p className="admin-overview-panel-description">{overviewMessages.distributionDescription}</p>
            </div>

            <div className="admin-overview-distribution-list">
              {distribution.map((item) => (
                <div key={item.label} className="admin-overview-distribution-item">
                  <div className="admin-overview-distribution-row">
                    <strong>{item.label}</strong>
                    <span className="admin-overview-copy">
                      {item.value} · {item.percent}%
                    </span>
                  </div>
                  <div className="admin-overview-distribution-track">
                    <div className="admin-overview-distribution-fill" style={{ width: `${Math.min(item.percent, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-overview-stage-panel admin-overview-panel">
            <div className="admin-overview-panel-title-row">
              <p className="admin-overview-section-kicker">{overviewMessages.navigationKicker}</p>
              <h2>{overviewMessages.navigationTitle}</h2>
              <p className="admin-overview-panel-description">{overviewMessages.navigationDescription}</p>
            </div>

            <div className="admin-overview-nav-grid" data-testid="admin-overview-nav-grid">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="admin-overview-nav-link">
                  <div>
                    <strong>{link.label}</strong>
                    <span>{link.description}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="admin-overview-column">
          <section className="admin-overview-stage-panel admin-overview-panel">
            <div className="admin-overview-panel-title-row">
              <p className="admin-overview-section-kicker">{overviewMessages.capabilityKicker}</p>
              <h2>{overviewMessages.capabilityTitle}</h2>
              <p className="admin-overview-panel-description">{overviewMessages.capabilityDescription}</p>
            </div>

            <div className="admin-overview-capability-grid">
              {capabilities.map((item) => (
                <div key={item.label} className="admin-overview-capability-card">
                  <div className="admin-overview-summary-label">{item.label}</div>
                  <div className="admin-overview-summary-value">{item.value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-overview-stage-panel admin-overview-panel">
            <div className="admin-overview-panel-title-row">
              <p className="admin-overview-section-kicker">{overviewMessages.readinessKicker}</p>
              <h2>{overviewMessages.readinessTitle}</h2>
              <p className="admin-overview-panel-description">{overviewMessages.readinessDescription}</p>
            </div>

            <div className="admin-overview-readiness-list">
              <div className="admin-overview-readiness-item">
                <strong>{overviewMessages.readinessPublicExposureTitle}</strong>
                <p className="admin-overview-copy">
                  {formatProtectedMessage(overviewMessages.readinessPublicExposureTemplate, { count: snapshot.publicSkills })}
                </p>
              </div>
              <div className="admin-overview-readiness-item">
                <strong>{overviewMessages.readinessPrivateSpaceTitle}</strong>
                <p className="admin-overview-copy">
                  {formatProtectedMessage(overviewMessages.readinessPrivateSpaceTemplate, { count: snapshot.privateSkills })}
                </p>
              </div>
              <div className="admin-overview-readiness-item">
                <strong>{overviewMessages.readinessSyncReachTitle}</strong>
                <p className="admin-overview-copy">
                  {formatProtectedMessage(overviewMessages.readinessSyncReachTemplate, { count: snapshot.syncableSkills })}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
