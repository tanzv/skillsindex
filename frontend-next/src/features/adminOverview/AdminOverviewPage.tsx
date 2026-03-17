"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { clientFetchJSON } from "@/src/lib/http/clientFetch";

import {
  buildAdminOverviewCapabilityItems,
  buildAdminOverviewDistribution,
  buildAdminOverviewMetrics,
  normalizeAdminOverviewPayload
} from "./model";

const quickLinks = [
  { href: "/admin/skills", label: "Skill Governance", description: "Inspect the governed catalog and recent quality posture." },
  { href: "/admin/ingestion/repository", label: "Repository Intake", description: "Onboard repository-backed skills and review scheduler pressure." },
  { href: "/admin/access", label: "Access Control", description: "Review registration, providers, and account enforcement." },
  { href: "/admin/ops/metrics", label: "Operations", description: "Track incident pressure, alerts, and release readiness." }
] as const;

export function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snapshot, setSnapshot] = useState(() => normalizeAdminOverviewPayload(null));

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await clientFetchJSON("/api/bff/admin/overview");
      setSnapshot(normalizeAdminOverviewPayload(payload));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load admin overview.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const metrics = useMemo(() => buildAdminOverviewMetrics(snapshot), [snapshot]);
  const capabilities = useMemo(() => buildAdminOverviewCapabilityItems(snapshot), [snapshot]);
  const distribution = useMemo(() => buildAdminOverviewDistribution(snapshot), [snapshot]);

  return (
    <div className="admin-overview-stage" data-testid="admin-overview-stage">
      <section className="admin-overview-stage-panel admin-overview-hero">
        <div className="admin-overview-panel-title-row">
          <p className="admin-overview-kicker">Governed Workbench</p>
          <h1>Admin Overview</h1>
          <p className="admin-overview-description">
            Dedicated operator dashboard for catalog posture, account reach, and navigation into high-frequency control surfaces.
          </p>
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
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <Link href="/admin/ingestion/repository" className="admin-overview-action">
            Open Intake
          </Link>
          <Link href="/admin/ops/alerts" className="admin-overview-action">
            Open Alerts
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
              <p className="admin-overview-section-kicker">Distribution</p>
              <h2>Catalog Posture</h2>
              <p className="admin-overview-panel-description">
                Visibility mix and synchronization readiness for the current governed inventory.
              </p>
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
              <p className="admin-overview-section-kicker">Navigation</p>
              <h2>Navigation Index</h2>
              <p className="admin-overview-panel-description">
                Fast entry points for the control surfaces that operators touch most often.
              </p>
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
              <p className="admin-overview-section-kicker">Coverage</p>
              <h2>Capability Envelope</h2>
              <p className="admin-overview-panel-description">
                Current administrative permissions and coverage indicators.
              </p>
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
              <p className="admin-overview-section-kicker">Readiness</p>
              <h2>Current Readiness</h2>
              <p className="admin-overview-panel-description">
                Compact reading of inventory exposure and administrative reach.
              </p>
            </div>

            <div className="admin-overview-readiness-list">
              <div className="admin-overview-readiness-item">
                <strong>Public exposure</strong>
                <p className="admin-overview-copy">
                  {snapshot.publicSkills} public skills are currently visible from the governed inventory.
                </p>
              </div>
              <div className="admin-overview-readiness-item">
                <strong>Private operating space</strong>
                <p className="admin-overview-copy">
                  {snapshot.privateSkills} private skills remain under internal-only posture.
                </p>
              </div>
              <div className="admin-overview-readiness-item">
                <strong>Synchronization reach</strong>
                <p className="admin-overview-copy">
                  {snapshot.syncableSkills} skills are prepared for repository-backed or scheduled refresh flows.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
