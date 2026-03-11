import { useState } from "react";

import { formatSkillOperationsDateTime } from "./SkillOperationsPage.helpers";
import type {
  RepositorySkillDraft,
  SkillInventoryItem,
  SkillOperationsCopy,
  SkillOperationsSubmissionAction
} from "./SkillOperationsPage.types";
import type { SyncRunRecord } from "../recordsSyncCenter/RecordsSyncCenterPage.types";
import type { AppLocale } from "../../lib/i18n";

interface SkillOperationsRepositoryViewProps {
  locale: AppLocale;
  copy: SkillOperationsCopy;
  skills: SkillInventoryItem[];
  syncRuns: SyncRunRecord[];
  submittingAction: SkillOperationsSubmissionAction;
  onSubmit: (draft: RepositorySkillDraft) => Promise<void>;
  onRunSyncBatch: () => Promise<void>;
  onSelectRun: (runID: number) => void;
}

const initialDraft: RepositorySkillDraft = {
  repo_url: "",
  repo_branch: "",
  repo_path: "",
  tags: "",
  visibility: "private",
  install_command: ""
};

export default function SkillOperationsRepositoryView({
  locale,
  copy,
  skills,
  syncRuns,
  submittingAction,
  onSubmit,
  onRunSyncBatch,
  onSelectRun
}: SkillOperationsRepositoryViewProps) {
  const [draft, setDraft] = useState<RepositorySkillDraft>(initialDraft);

  return (
    <>
      <section className="panel account-workbench-settings-panel">
        <h3>{copy.repository.title}</h3>
        <p className="account-workbench-filter-summary">{copy.formHints.repository}</p>
        <form
          className="account-workbench-setting-form"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit(draft);
          }}
        >
          <div className="account-workbench-setting-grid">
            <label className="account-workbench-field">
              <span className="account-workbench-field-label">{copy.repository.repoURL}</span>
              <input
                required
                className="account-workbench-search-input"
                value={draft.repo_url}
                onChange={(event) => setDraft((previous) => ({ ...previous, repo_url: event.target.value }))}
              />
            </label>
            <label className="account-workbench-field">
              <span className="account-workbench-field-label">{copy.repository.repoBranch}</span>
              <input
                className="account-workbench-search-input"
                value={draft.repo_branch}
                onChange={(event) => setDraft((previous) => ({ ...previous, repo_branch: event.target.value }))}
              />
            </label>
            <label className="account-workbench-field">
              <span className="account-workbench-field-label">{copy.repository.repoPath}</span>
              <input
                className="account-workbench-search-input"
                value={draft.repo_path}
                onChange={(event) => setDraft((previous) => ({ ...previous, repo_path: event.target.value }))}
              />
            </label>
            <label className="account-workbench-field">
              <span className="account-workbench-field-label">{copy.repository.tags}</span>
              <input
                className="account-workbench-search-input"
                value={draft.tags}
                onChange={(event) => setDraft((previous) => ({ ...previous, tags: event.target.value }))}
              />
            </label>
            <label className="account-workbench-field">
              <span className="account-workbench-field-label">{copy.visibility}</span>
              <select
                className="account-workbench-select-input"
                value={draft.visibility}
                onChange={(event) => setDraft((previous) => ({ ...previous, visibility: event.target.value }))}
              >
                <option value="private">private</option>
                <option value="internal">internal</option>
                <option value="public">public</option>
              </select>
            </label>
            <label className="account-workbench-field">
              <span className="account-workbench-field-label">{copy.repository.installCommand}</span>
              <input
                className="account-workbench-search-input"
                value={draft.install_command}
                onChange={(event) => setDraft((previous) => ({ ...previous, install_command: event.target.value }))}
              />
            </label>
          </div>
          <div className="account-workbench-inline-actions">
            <button type="submit" className="account-workbench-action-button" disabled={submittingAction === "repository"}>
              {copy.repository.submit}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h3>{copy.repository.inventoryTitle}</h3>
        {skills.length === 0 ? (
          <p className="account-workbench-filter-summary">{copy.repository.inventoryEmptyText}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">{copy.repository.inventoryTitle}</th>
                  <th scope="col">{copy.visibility}</th>
                  <th scope="col">{copy.updatedAt}</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => (
                  <tr key={skill.id}>
                    <td>{skill.id}</td>
                    <td>{skill.name || "-"}</td>
                    <td>{skill.visibility || "-"}</td>
                    <td>{formatSkillOperationsDateTime(skill.updated_at, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <h3>{copy.repository.latestRuns}</h3>
        <div className="account-workbench-inline-actions">
          <button
            type="button"
            className="account-workbench-action-button"
            onClick={() => void onRunSyncBatch()}
            disabled={submittingAction === "sync-batch"}
          >
            {copy.repository.runBatchSync}
          </button>
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
                  <th scope="col">{copy.runScope}</th>
                  <th scope="col">{copy.runSynced}</th>
                  <th scope="col">{copy.runFailed}</th>
                  <th scope="col">{copy.actions}</th>
                </tr>
              </thead>
              <tbody>
                {syncRuns.map((run) => (
                  <tr key={run.id}>
                    <td>{run.id}</td>
                    <td>{run.status || "-"}</td>
                    <td>{run.scope || "-"}</td>
                    <td>{run.synced}</td>
                    <td>{run.failed}</td>
                    <td>
                      <button type="button" className="account-workbench-action-button" onClick={() => onSelectRun(run.id)}>
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
    </>
  );
}
