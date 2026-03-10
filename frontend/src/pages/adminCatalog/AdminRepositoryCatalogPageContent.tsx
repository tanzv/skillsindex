import { Alert, Button, Input, Select, Spin, Switch, Tag } from "antd";
import type { ReactNode } from "react";

import type { AppLocale } from "../../lib/i18n";
import { getAdminRepositoryCatalogCopy } from "./AdminRepositoryCatalogPage.copy";
import {
  buildRepositoryLatestActivityLabel,
  buildRepositoryRouteNotes,
  buildRepositorySummaryMetrics,
  formatDateTime,
  formatRepositoryStatus,
  formatRepositoryTrigger,
  getRepositoryRouteMeta,
  repositoryRouteOrder,
  resolveRepositoryStatusColor,
  type AdminRepositoryCatalogRoute,
  type AsyncJobItem,
  type RepositorySyncPolicy,
  type SyncJobRunItem
} from "./AdminRepositoryCatalogPage.helpers";
import { WorkspacePrototypeEyebrow } from "../workspace/WorkspacePrototypePageShell.styles";
import {
  RepositoryActionCluster,
  RepositoryActionClusterTitle,
  RepositoryActionRow,
  RepositoryCodeBlock,
  RepositoryDataItem,
  RepositoryDataLabel,
  RepositoryDataList,
  RepositoryDataValue,
  RepositoryEmptyState,
  RepositoryField,
  RepositoryFieldGrid,
  RepositoryFieldLabel,
  RepositoryHeroCard,
  RepositoryHeroSubtitle,
  RepositoryHeroTextStack,
  RepositoryHeroTitle,
  RepositoryHintList,
  RepositoryInlineMeta,
  RepositoryInlineMetricGrid,
  RepositoryInlineMetricItem,
  RepositoryMetricHelp,
  RepositoryMetricLabel,
  RepositoryMetricValue,
  RepositoryMutedText,
  RepositoryPageRoot,
  RepositoryPanelCard,
  RepositoryPanelHeading,
  RepositoryQuickActionGrid,
  RepositoryQuickCard,
  RepositoryRouteBar,
  RepositoryRouteButton,
  RepositoryRouteHint,
  RepositoryRouteLabel,
  RepositoryStack,
  RepositorySubpageGrid,
  RepositorySubpageRail,
  RepositorySummaryHeader,
  RepositorySummaryMetricCard,
  RepositorySummaryMetricGrid,
  RepositoryTable,
  RepositoryTableMeta,
  RepositoryTableWrap
} from "./AdminRepositoryCatalogPageContent.styles";

interface AdminRepositoryCatalogPageContentProps {
  locale: AppLocale;
  route: AdminRepositoryCatalogRoute;
  loading: boolean;
  saving: boolean;
  error: string;
  success: string;
  jobs: AsyncJobItem[];
  jobsTotal: number;
  syncJobs: SyncJobRunItem[];
  syncJobsTotal: number;
  policy: RepositorySyncPolicy | null;
  policyForm: RepositorySyncPolicy;
  onRefresh: () => void;
  onNavigate: (path: string) => void;
  onPolicyFormChange: (patch: Partial<RepositorySyncPolicy>) => void;
  onSavePolicy: () => void;
}

interface DataTableColumn<Row> {
  key: string;
  label: string;
  render: (row: Row) => ReactNode;
}

function renderDataTable<Row>(input: { columns: DataTableColumn<Row>[]; rows: Row[]; emptyText: string }): ReactNode {
  const { columns, rows, emptyText } = input;

  if (rows.length === 0) {
    return <RepositoryEmptyState>{emptyText}</RepositoryEmptyState>;
  }

  return (
    <RepositoryTableWrap>
      <RepositoryTable>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </RepositoryTable>
    </RepositoryTableWrap>
  );
}

function renderRouteMainContent(props: AdminRepositoryCatalogPageContentProps): ReactNode {
  const { locale, route, jobs, jobsTotal, syncJobs, syncJobsTotal, policy, policyForm, saving, onPolicyFormChange, onSavePolicy } = props;
  const text = getAdminRepositoryCatalogCopy(locale);

  if (route === "/admin/jobs") {
    const columns: DataTableColumn<AsyncJobItem>[] = [
      { key: "id", label: text.jobs.columns.id, render: (row) => row.id },
      { key: "job_type", label: text.jobs.columns.jobType, render: (row) => row.job_type || "-" },
      {
        key: "status",
        label: text.jobs.columns.status,
        render: (row) => (
          <Tag color={resolveRepositoryStatusColor(row.status || "unknown")}>
            {formatRepositoryStatus(row.status || "unknown", locale)}
          </Tag>
        )
      },
      { key: "attempt", label: text.jobs.columns.attempt, render: (row) => `${row.attempt}/${row.max_attempts}` },
      { key: "owner", label: text.jobs.columns.owner, render: (row) => row.owner_user_id || "-" },
      { key: "actor", label: text.jobs.columns.actor, render: (row) => row.actor_user_id || "-" },
      { key: "skill", label: text.jobs.columns.targetSkill, render: (row) => row.target_skill_id || "-" },
      {
        key: "updated",
        label: text.jobs.columns.updated,
        render: (row) => formatDateTime(row.updated_at || row.created_at, locale)
      }
    ];

    return (
      <RepositoryStack>
        <RepositoryPanelCard tone="panel">
          <RepositoryTableMeta>
            <RepositoryPanelHeading>{text.jobs.panelTitle}</RepositoryPanelHeading>
            <RepositoryInlineMeta>
              <Tag>{`${text.totalLabel} ${jobsTotal}`}</Tag>
              <Tag>{`${text.listedLabel} ${jobs.length}`}</Tag>
            </RepositoryInlineMeta>
          </RepositoryTableMeta>
          <RepositoryMutedText>{text.jobs.description}</RepositoryMutedText>
          {renderDataTable({ columns, rows: jobs, emptyText: text.jobs.emptyText })}
        </RepositoryPanelCard>
      </RepositoryStack>
    );
  }

  if (route === "/admin/sync-jobs") {
    const columns: DataTableColumn<SyncJobRunItem>[] = [
      { key: "id", label: text.syncRuns.columns.id, render: (row) => row.id },
      {
        key: "trigger",
        label: text.syncRuns.columns.trigger,
        render: (row) => formatRepositoryTrigger(row.trigger || "unknown", locale)
      },
      { key: "scope", label: text.syncRuns.columns.scope, render: (row) => row.scope || "-" },
      {
        key: "status",
        label: text.syncRuns.columns.status,
        render: (row) => (
          <Tag color={resolveRepositoryStatusColor(row.status || "unknown")}>
            {formatRepositoryStatus(row.status || "unknown", locale)}
          </Tag>
        )
      },
      { key: "candidates", label: text.syncRuns.columns.candidates, render: (row) => row.candidates ?? 0 },
      { key: "synced", label: text.syncRuns.columns.synced, render: (row) => row.synced ?? 0 },
      { key: "failed", label: text.syncRuns.columns.failed, render: (row) => row.failed ?? 0 },
      { key: "duration", label: text.syncRuns.columns.durationMs, render: (row) => row.duration_ms ?? 0 },
      {
        key: "started",
        label: text.syncRuns.columns.started,
        render: (row) => formatDateTime(row.started_at || row.finished_at, locale)
      }
    ];

    return (
      <RepositoryStack>
        <RepositoryPanelCard tone="panel">
          <RepositoryTableMeta>
            <RepositoryPanelHeading>{text.syncRuns.panelTitle}</RepositoryPanelHeading>
            <RepositoryInlineMeta>
              <Tag>{`${text.totalLabel} ${syncJobsTotal}`}</Tag>
              <Tag>{`${text.listedLabel} ${syncJobs.length}`}</Tag>
            </RepositoryInlineMeta>
          </RepositoryTableMeta>
          <RepositoryMutedText>{text.syncRuns.description}</RepositoryMutedText>
          {renderDataTable({ columns, rows: syncJobs, emptyText: text.syncRuns.emptyText })}
        </RepositoryPanelCard>
      </RepositoryStack>
    );
  }

  return (
    <RepositoryStack>
      <RepositoryPanelCard tone="panel">
        <RepositoryPanelHeading>{text.policy.editorTitle}</RepositoryPanelHeading>
        <RepositoryMutedText>{text.policy.editorDescription}</RepositoryMutedText>
        <RepositoryFieldGrid>
          <RepositoryField>
            <RepositoryFieldLabel>{text.policy.enabled}</RepositoryFieldLabel>
            <Switch checked={policyForm.enabled} onChange={(value) => onPolicyFormChange({ enabled: value })} />
          </RepositoryField>
          <RepositoryField>
            <RepositoryFieldLabel>{text.policy.batchSize}</RepositoryFieldLabel>
            <Select
              value={String(policyForm.batch_size)}
              options={[
                { label: "10", value: "10" },
                { label: "20", value: "20" },
                { label: "50", value: "50" },
                { label: "100", value: "100" }
              ]}
              onChange={(value) => onPolicyFormChange({ batch_size: Number(value) })}
            />
          </RepositoryField>
          <RepositoryField>
            <RepositoryFieldLabel>{text.policy.interval}</RepositoryFieldLabel>
            <Input value={policyForm.interval} placeholder="30m" onChange={(event) => onPolicyFormChange({ interval: event.target.value })} />
          </RepositoryField>
          <RepositoryField>
            <RepositoryFieldLabel>{text.policy.timeout}</RepositoryFieldLabel>
            <Input value={policyForm.timeout} placeholder="10m" onChange={(event) => onPolicyFormChange({ timeout: event.target.value })} />
          </RepositoryField>
        </RepositoryFieldGrid>
        <RepositoryActionRow>
          <Button type="primary" onClick={onSavePolicy} loading={saving}>
            {text.policy.savePolicy}
          </Button>
        </RepositoryActionRow>
      </RepositoryPanelCard>

      <RepositoryPanelCard tone="panel">
        <RepositoryPanelHeading>{text.policy.snapshotTitle}</RepositoryPanelHeading>
        <RepositoryDataList>
          <RepositoryDataItem>
            <RepositoryDataLabel>{text.summaryMetrics.schedulerState}</RepositoryDataLabel>
            <RepositoryDataValue>{policy?.enabled ? text.enabledState : text.disabledState}</RepositoryDataValue>
          </RepositoryDataItem>
          <RepositoryDataItem>
            <RepositoryDataLabel>{text.summaryMetrics.interval}</RepositoryDataLabel>
            <RepositoryDataValue>{policy?.interval || "-"}</RepositoryDataValue>
          </RepositoryDataItem>
          <RepositoryDataItem>
            <RepositoryDataLabel>{text.summaryMetrics.timeout}</RepositoryDataLabel>
            <RepositoryDataValue>{policy?.timeout || "-"}</RepositoryDataValue>
          </RepositoryDataItem>
          <RepositoryDataItem>
            <RepositoryDataLabel>{text.summaryMetrics.batchSize}</RepositoryDataLabel>
            <RepositoryDataValue>{policy?.batch_size ?? 0}</RepositoryDataValue>
          </RepositoryDataItem>
        </RepositoryDataList>
        <RepositoryCodeBlock>{JSON.stringify(policy || {}, null, 2)}</RepositoryCodeBlock>
      </RepositoryPanelCard>
    </RepositoryStack>
  );
}

function renderRouteContextRail(props: AdminRepositoryCatalogPageContentProps): ReactNode {
  const { locale, route, jobs, syncJobs, policy, onNavigate } = props;
  const text = getAdminRepositoryCatalogCopy(locale);
  const routeMeta = getRepositoryRouteMeta(locale);
  const meta = routeMeta[route];
  const latestActivity = buildRepositoryLatestActivityLabel(route, jobs, syncJobs, locale);
  const notes = buildRepositoryRouteNotes(route, locale);
  const routeMetrics = buildRepositorySummaryMetrics({
    locale,
    route,
    jobs,
    jobsTotal: props.jobsTotal,
    syncJobs,
    syncJobsTotal: props.syncJobsTotal,
    policy
  });

  return (
    <RepositorySubpageRail>
      <RepositoryPanelCard tone="panel">
        <RepositoryActionCluster>
          <RepositoryActionClusterTitle>{text.routeContextTitle}</RepositoryActionClusterTitle>
          <RepositoryMutedText>{meta.endpoint}</RepositoryMutedText>
          <RepositoryInlineMetricGrid>
            <RepositoryInlineMetricItem>
              <RepositoryMetricLabel>{text.routeContextSurfaceLabel}</RepositoryMetricLabel>
              <RepositoryMetricValue>{meta.navLabel}</RepositoryMetricValue>
            </RepositoryInlineMetricItem>
            <RepositoryInlineMetricItem>
              <RepositoryMetricLabel>{text.routeContextLatestActivityLabel}</RepositoryMetricLabel>
              <RepositoryMetricValue>{latestActivity}</RepositoryMetricValue>
            </RepositoryInlineMetricItem>
          </RepositoryInlineMetricGrid>
        </RepositoryActionCluster>
      </RepositoryPanelCard>

      <RepositoryPanelCard tone="panel">
        <RepositoryPanelHeading>{text.operatorNotesTitle}</RepositoryPanelHeading>
        <RepositoryHintList>
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </RepositoryHintList>
      </RepositoryPanelCard>

      <RepositoryQuickCard tone="quick">
        <RepositoryActionCluster>
          <RepositoryActionClusterTitle>{text.repositoryNavigationTitle}</RepositoryActionClusterTitle>
          <RepositoryQuickActionGrid>
            {repositoryRouteOrder.map((targetRoute) => (
              <Button key={targetRoute} type={targetRoute === route ? "primary" : "default"} onClick={() => onNavigate(targetRoute)}>
                {routeMeta[targetRoute].navLabel}
              </Button>
            ))}
          </RepositoryQuickActionGrid>
        </RepositoryActionCluster>
      </RepositoryQuickCard>

      <RepositoryPanelCard tone="panel">
        <RepositoryPanelHeading>{text.metricsLensTitle}</RepositoryPanelHeading>
        <RepositoryDataList>
          {routeMetrics.slice(0, 3).map((metric) => (
            <RepositoryDataItem key={metric.id}>
              <RepositoryDataLabel>{metric.label}</RepositoryDataLabel>
              <RepositoryDataValue>{metric.value}</RepositoryDataValue>
            </RepositoryDataItem>
          ))}
        </RepositoryDataList>
      </RepositoryPanelCard>
    </RepositorySubpageRail>
  );
}

export default function AdminRepositoryCatalogPageContent(props: AdminRepositoryCatalogPageContentProps) {
  const { locale, route, loading, error, success, onRefresh, onNavigate } = props;
  const text = getAdminRepositoryCatalogCopy(locale);
  const routeMeta = getRepositoryRouteMeta(locale);
  const meta = routeMeta[route];
  const summaryMetrics = buildRepositorySummaryMetrics({
    locale,
    route,
    jobs: props.jobs,
    jobsTotal: props.jobsTotal,
    syncJobs: props.syncJobs,
    syncJobsTotal: props.syncJobsTotal,
    policy: props.policy
  });

  return (
    <RepositoryPageRoot>
      <RepositoryHeroCard tone="hero">
        <RepositorySummaryHeader>
          <RepositoryHeroTextStack>
            <WorkspacePrototypeEyebrow>{meta.eyebrow}</WorkspacePrototypeEyebrow>
            <RepositoryHeroTitle>{meta.title}</RepositoryHeroTitle>
            <RepositoryHeroSubtitle>{meta.subtitle}</RepositoryHeroSubtitle>
          </RepositoryHeroTextStack>

          <RepositoryActionRow>
            <Button onClick={onRefresh} loading={loading}>
              {text.refresh}
            </Button>
          </RepositoryActionRow>
        </RepositorySummaryHeader>

        <RepositoryInlineMeta>
          <Tag>{text.repositoryAdmin}</Tag>
          <Tag>{meta.endpoint}</Tag>
        </RepositoryInlineMeta>

        {error ? <Alert type="error" title={error} showIcon /> : null}
        {success ? <Alert type="success" title={success} showIcon /> : null}

        <RepositoryRouteBar>
          {repositoryRouteOrder.map((targetRoute) => {
            const target = routeMeta[targetRoute];
            return (
              <RepositoryRouteButton key={target.route} type="button" $active={target.route === route} onClick={() => onNavigate(target.route)}>
                <RepositoryRouteLabel>{target.navLabel}</RepositoryRouteLabel>
                <RepositoryRouteHint>{target.navHint}</RepositoryRouteHint>
              </RepositoryRouteButton>
            );
          })}
        </RepositoryRouteBar>

        <RepositorySummaryMetricGrid>
          {summaryMetrics.map((metric) => (
            <RepositorySummaryMetricCard key={metric.id}>
              <RepositoryMetricLabel>{metric.label}</RepositoryMetricLabel>
              <RepositoryMetricValue>{metric.value}</RepositoryMetricValue>
              {metric.help ? <RepositoryMetricHelp>{metric.help}</RepositoryMetricHelp> : null}
            </RepositorySummaryMetricCard>
          ))}
        </RepositorySummaryMetricGrid>
      </RepositoryHeroCard>

      {loading ? (
        <RepositoryPanelCard tone="panel">
          <RepositoryEmptyState>
            <Spin size="large" />
          </RepositoryEmptyState>
        </RepositoryPanelCard>
      ) : (
        <RepositorySubpageGrid>
          {renderRouteMainContent(props)}
          {renderRouteContextRail(props)}
        </RepositorySubpageGrid>
      )}
    </RepositoryPageRoot>
  );
}
