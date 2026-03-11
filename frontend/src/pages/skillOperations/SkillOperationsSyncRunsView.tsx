import { formatSkillOperationsDateTime } from "./SkillOperationsPage.helpers";
import type { SkillOperationsCopy } from "./SkillOperationsPage.types";
import type { SyncRunRecord } from "../recordsSyncCenter/RecordsSyncCenterPage.types";
import type { AppLocale } from "../../lib/i18n";

interface SkillOperationsSyncRunsViewProps {
  locale: AppLocale;
  copy: SkillOperationsCopy;
  syncRuns: SyncRunRecord[];
  selectedRunID: number;
  syncDetail: Record<string, unknown> | null;
  onRefresh: () => void;
  onSelectRun: (runID: number) => void;
}

export default function SkillOperationsSyncRunsView({
  locale,
  copy,
  syncRuns,
  selectedRunID,
  syncDetail,
  onRefresh,
  onSelectRun
}: SkillOperationsSyncRunsViewProps) {
  return (
    <>
      <section className="panel">
        <div className="panel-hero-toolbar">
          <div className="panel-hero-toolbar-main">
            <h3 className="panel-hero-title">{copy.syncRuns.latestRuns}</h3>
          </div>
          <div className="panel-hero-actions">
            <button type="button" className="panel-action-button" onClick={onRefresh}>
              {copy.syncRuns.refreshRuns}
            </button>
          </div>
        </div>
        {syncRuns.length === 0 ? (
          <p className="account-workbench-filter-summary">{copy.noRuns}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">{copy.runID}</th>
                  <th scope="col">{copy.runStatus}</th>
                  <th scope="col">{copy.runTrigger}</th>
                  <th scope="col">{copy.runScope}</th>
                  <th scope="col">{copy.runSynced}</th>
                  <th scope="col">{copy.runFailed}</th>
                  <th scope="col">{copy.runStartedAt}</th>
                  <th scope="col">{copy.actions}</th>
                </tr>
              </thead>
              <tbody>
                {syncRuns.map((run) => (
                  <tr key={run.id}>
                    <td>{run.id}</td>
                    <td>{run.status || "-"}</td>
                    <td>{run.trigger || "-"}</td>
                    <td>{run.scope || "-"}</td>
                    <td>{run.synced}</td>
                    <td>{run.failed}</td>
                    <td>{formatSkillOperationsDateTime(run.started_at, locale)}</td>
                    <td>
                      <button
                        type="button"
                        className="account-workbench-action-button"
                        onClick={() => onSelectRun(run.id)}
                        aria-pressed={selectedRunID === run.id}
                      >
                        View Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <h3>{copy.selectedRunDetail}</h3>
        <pre>{JSON.stringify(syncDetail || {}, null, 2)}</pre>
      </section>
    </>
  );
}
