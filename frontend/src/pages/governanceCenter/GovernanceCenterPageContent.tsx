import { Button, Tag } from "antd";

import type { WorkspaceCenterCopy } from "../workspace/WorkspaceCenterPage.copy";
import {
  WorkspaceActionRow,
  WorkspaceHeroSubtitle,
  WorkspaceHeroTextStack,
  WorkspaceHeroTitle,
  WorkspaceInlineMetricGrid,
  WorkspaceInlineMetricItem,
  WorkspaceMetricLabel,
  WorkspaceMetricValue,
  WorkspaceMutedText,
  WorkspacePanelHeading,
  WorkspaceQuickActionGrid,
  WorkspaceSectionAnchor,
  WorkspaceSubpageGrid,
  WorkspaceSubpageRail,
  WorkspaceTagCloud
} from "../workspace/WorkspaceCenterPage.styles";
import type { WorkspaceSnapshot } from "../workspace/WorkspaceCenterPage.types";
import WorkspaceSurfaceCard from "../workspace/WorkspaceSurfaceCard";
import {
  WorkspacePrototypeActionCluster,
  WorkspacePrototypeDataItem,
  WorkspacePrototypeDataLabel,
  WorkspacePrototypeDataList,
  WorkspacePrototypeDataValue,
  WorkspacePrototypeEyebrow,
  WorkspacePrototypeItemText,
  WorkspacePrototypeItemTitle,
  WorkspacePrototypeList,
  WorkspacePrototypeListItem,
  WorkspacePrototypeMarker,
  WorkspacePrototypeTextStack
} from "../workspace/WorkspacePrototypePageShell.styles";

export interface GovernanceCenterPageContentText {
  title: string;
  subtitle: string;
  eyebrow: string;
  policyEngine: string;
  auditLedger: string;
  controlPosture: string;
  operationalControls: string;
  incidentResponse: string;
  controlVisibilityTitle: string;
  controlVisibility: string;
  controlSyncTitle: string;
  controlSync: string;
  controlAccessTitle: string;
  controlAccess: string;
  ledgerWindow: string;
  ledgerScope: string;
  complianceStatus: string;
  statusPolicy: string;
  statusAccess: string;
  statusSync: string;
  keyLifecycle: string;
  lifecycleActive: string;
  lifecycleExpiring: string;
  lifecycleRotation: string;
  responseCaptureTitle: string;
  responseCapture: string;
  responseReviewTitle: string;
  responseReview: string;
  responseDrillTitle: string;
  responseDrill: string;
  access: string;
  integrations: string;
  incidents: string;
  audit: string;
  openWorkspace: string;
  openDashboard: string;
  scoreLabel: string;
  alertsLabel: string;
  scopeLabel: string;
}

interface GovernanceCenterPageContentProps {
  text: GovernanceCenterPageContentText;
  workspaceText: Pick<WorkspaceCenterCopy, "queueTagNone" | "emptyQueue">;
  snapshot: WorkspaceSnapshot;
  onNavigate: (path: string) => void;
  toPublicPath: (path: string) => string;
  toAdminPath: (path: string) => string;
}

export default function GovernanceCenterPageContent({
  text,
  workspaceText,
  snapshot,
  onNavigate,
  toPublicPath,
  toAdminPath
}: GovernanceCenterPageContentProps) {
  const categoryCount = new Set(snapshot.queueEntries.map((entry) => entry.category)).size;
  const policyScore = snapshot.metrics.healthScore;
  const openIncidents = snapshot.queueCounts.risk;
  const activeKeys = snapshot.queueCounts.running + snapshot.queueCounts.pending;
  const expiringKeys = Math.max(snapshot.queueCounts.risk, 1);
  const visibleTopTags = snapshot.topTags.filter((tag) => String(tag.name || "").trim());

  const policyItems = [
    {
      id: "01",
      title: text.controlVisibilityTitle,
      description: text.controlVisibility
    },
    {
      id: "02",
      title: text.controlSyncTitle,
      description: text.controlSync
    },
    {
      id: "03",
      title: text.controlAccessTitle,
      description: text.controlAccess
    }
  ];

  const responseItems = [
    {
      id: "01",
      title: text.responseCaptureTitle,
      description: text.responseCapture
    },
    {
      id: "02",
      title: text.responseReviewTitle,
      description: text.responseReview
    },
    {
      id: "03",
      title: text.responseDrillTitle,
      description: text.responseDrill
    }
  ];

  return (
    <>
      <WorkspaceSectionAnchor id="workspace-governance-overview">
        <WorkspaceSurfaceCard tone="panel">
          <WorkspacePrototypeEyebrow>{text.eyebrow}</WorkspacePrototypeEyebrow>
          <WorkspaceHeroTextStack>
            <WorkspaceHeroTitle>{text.title}</WorkspaceHeroTitle>
            <WorkspaceHeroSubtitle>{text.subtitle}</WorkspaceHeroSubtitle>
          </WorkspaceHeroTextStack>

          <WorkspaceActionRow>
            <Button onClick={() => onNavigate(toPublicPath("/workspace"))}>{text.openWorkspace}</Button>
            <Button type="primary" onClick={() => onNavigate(toAdminPath("/admin/overview"))}>
              {text.openDashboard}
            </Button>
          </WorkspaceActionRow>

          <WorkspaceInlineMetricGrid>
            <WorkspaceInlineMetricItem>
              <WorkspaceMetricLabel>{text.statusPolicy}</WorkspaceMetricLabel>
              <WorkspaceMetricValue>{`${policyScore.toFixed(1)} / 10`}</WorkspaceMetricValue>
            </WorkspaceInlineMetricItem>
            <WorkspaceInlineMetricItem>
              <WorkspaceMetricLabel>{text.statusAccess}</WorkspaceMetricLabel>
              <WorkspaceMetricValue>{String(openIncidents)}</WorkspaceMetricValue>
            </WorkspaceInlineMetricItem>
            <WorkspaceInlineMetricItem>
              <WorkspaceMetricLabel>{text.statusSync}</WorkspaceMetricLabel>
              <WorkspaceMetricValue>{String(snapshot.metrics.installedSkills)}</WorkspaceMetricValue>
            </WorkspaceInlineMetricItem>
            <WorkspaceInlineMetricItem>
              <WorkspaceMetricLabel>{text.ledgerScope}</WorkspaceMetricLabel>
              <WorkspaceMetricValue>{`${categoryCount} ${text.scopeLabel}`}</WorkspaceMetricValue>
            </WorkspaceInlineMetricItem>
          </WorkspaceInlineMetricGrid>
        </WorkspaceSurfaceCard>
      </WorkspaceSectionAnchor>

      <WorkspaceSubpageGrid>
        <WorkspaceSectionAnchor id="workspace-governance-main">
          <WorkspaceSurfaceCard tone="panel">
            <WorkspacePanelHeading>{text.policyEngine}</WorkspacePanelHeading>
            <WorkspacePrototypeList>
              {policyItems.map((item) => (
                <WorkspacePrototypeListItem key={item.id}>
                  <WorkspacePrototypeActionCluster>
                    <WorkspacePrototypeMarker $accent>{item.id}</WorkspacePrototypeMarker>
                    <WorkspacePrototypeTextStack>
                      <WorkspacePrototypeItemTitle>{item.title}</WorkspacePrototypeItemTitle>
                      <WorkspacePrototypeItemText>{item.description}</WorkspacePrototypeItemText>
                    </WorkspacePrototypeTextStack>
                  </WorkspacePrototypeActionCluster>
                </WorkspacePrototypeListItem>
              ))}
            </WorkspacePrototypeList>
          </WorkspaceSurfaceCard>

          <WorkspaceSurfaceCard tone="panel">
            <WorkspacePanelHeading>{text.auditLedger}</WorkspacePanelHeading>
            <WorkspacePrototypeDataList>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.ledgerWindow}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>{snapshot.topTags.length}</WorkspacePrototypeDataValue>
              </WorkspacePrototypeDataItem>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.ledgerScope}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>{`${categoryCount} ${text.scopeLabel}`}</WorkspacePrototypeDataValue>
              </WorkspacePrototypeDataItem>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.complianceStatus}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>{policyScore.toFixed(1)}</WorkspacePrototypeDataValue>
              </WorkspacePrototypeDataItem>
            </WorkspacePrototypeDataList>

            <WorkspaceTagCloud>
              {visibleTopTags.length > 0 ? (
                visibleTopTags.map((tag) => (
                  <Tag key={tag.name} color="blue">
                    {tag.name} ({tag.count})
                  </Tag>
                ))
              ) : (
                <Tag>{workspaceText.queueTagNone}</Tag>
              )}
            </WorkspaceTagCloud>
          </WorkspaceSurfaceCard>
        </WorkspaceSectionAnchor>

        <WorkspaceSubpageRail>
          <WorkspaceSurfaceCard tone="quick">
            <WorkspacePanelHeading>{text.operationalControls}</WorkspacePanelHeading>
            <WorkspaceQuickActionGrid>
              <Button onClick={() => onNavigate(toAdminPath("/admin/access"))}>{text.access}</Button>
              <Button onClick={() => onNavigate(toAdminPath("/admin/integrations"))}>{text.integrations}</Button>
              <Button onClick={() => onNavigate(toAdminPath("/admin/incidents"))}>{text.incidents}</Button>
              <Button onClick={() => onNavigate(toAdminPath("/admin/ops/audit-export"))}>{text.audit}</Button>
            </WorkspaceQuickActionGrid>
          </WorkspaceSurfaceCard>

          <WorkspaceSurfaceCard tone="panel">
            <WorkspacePanelHeading>{text.controlPosture}</WorkspacePanelHeading>
            <WorkspaceMutedText>{text.keyLifecycle}</WorkspaceMutedText>
            <WorkspacePrototypeDataList>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.lifecycleActive}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>{activeKeys}</WorkspacePrototypeDataValue>
              </WorkspacePrototypeDataItem>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.lifecycleExpiring}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>{expiringKeys}</WorkspacePrototypeDataValue>
              </WorkspacePrototypeDataItem>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.lifecycleRotation}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>72h</WorkspacePrototypeDataValue>
              </WorkspacePrototypeDataItem>
              <WorkspacePrototypeDataItem>
                <WorkspacePrototypeDataLabel>{text.alertsLabel}</WorkspacePrototypeDataLabel>
                <WorkspacePrototypeDataValue>{openIncidents}</WorkspacePrototypeDataValue>
              </WorkspacePrototypeDataItem>
            </WorkspacePrototypeDataList>
          </WorkspaceSurfaceCard>

          <WorkspaceSurfaceCard tone="panel">
            <WorkspacePanelHeading>{text.incidentResponse}</WorkspacePanelHeading>
            <WorkspacePrototypeList>
              {responseItems.map((item) => (
                <WorkspacePrototypeListItem key={item.id}>
                  <WorkspacePrototypeActionCluster>
                    <WorkspacePrototypeMarker>{item.id}</WorkspacePrototypeMarker>
                    <WorkspacePrototypeTextStack>
                      <WorkspacePrototypeItemTitle>{item.title}</WorkspacePrototypeItemTitle>
                      <WorkspacePrototypeItemText>{item.description}</WorkspacePrototypeItemText>
                    </WorkspacePrototypeTextStack>
                  </WorkspacePrototypeActionCluster>
                </WorkspacePrototypeListItem>
              ))}
            </WorkspacePrototypeList>
            {snapshot.queueEntries.length === 0 ? <WorkspaceMutedText>{workspaceText.emptyQueue}</WorkspaceMutedText> : null}
          </WorkspaceSurfaceCard>
        </WorkspaceSubpageRail>
      </WorkspaceSubpageGrid>
    </>
  );
}
