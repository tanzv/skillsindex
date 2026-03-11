import { useState } from "react";

import {
  canCancelImportJob,
  canRetryImportJob,
  formatSkillOperationsDateTime
} from "./SkillOperationsPage.helpers";
import type {
  ImportJobItem,
  RepositorySkillDraft,
  SkillInventoryItem,
  SkillMPDraft,
  SkillOperationsCopy,
  SkillOperationsSubmissionAction
} from "./SkillOperationsPage.types";
import type { AppLocale } from "../../lib/i18n";

interface SkillOperationsImportsViewProps {
  locale: AppLocale;
  copy: SkillOperationsCopy;
  skills: SkillInventoryItem[];
  importJobs: ImportJobItem[];
  submittingAction: SkillOperationsSubmissionAction;
  onArchiveSubmit: (file: File | null, draft: Pick<RepositorySkillDraft, "tags" | "visibility" | "install_command">) => Promise<void>;
  onSkillMPSubmit: (draft: SkillMPDraft) => Promise<void>;
  onRetryJob: (jobID: number) => Promise<void>;
  onCancelJob: (jobID: number) => Promise<void>;
}

const initialArchiveDraft: Pick<RepositorySkillDraft, "tags" | "visibility" | "install_command"> = {
  tags: "",
  visibility: "private",
  install_command: ""
};

const initialSkillMPDraft: SkillMPDraft = {
  skillmp_url: "",
  skillmp_id: "",
  skillmp_token: "",
  tags: "",
  visibility: "private",
  install_command: ""
};

export default function SkillOperationsImportsView({
  locale,
  copy,
  skills,
  importJobs,
  submittingAction,
  onArchiveSubmit,
  onSkillMPSubmit,
  onRetryJob,
  onCancelJob
}: SkillOperationsImportsViewProps) {
  const [archiveFile, setArchiveFile] = useState<File | null>(null);
  const [archiveDraft, setArchiveDraft] = useState(initialArchiveDraft);
  const [skillMPDraft, setSkillMPDraft] = useState(initialSkillMPDraft);

  return (
    <>
      <section className="panel account-workbench-settings-panel">
        <h3>{copy.imports.archiveTitle}</h3>
        <p className="account-workbench-filter-summary">{copy.formHints.archive}</p>
        <form
          className="account-workbench-setting-form"
          onSubmit={(event) => {
            event.preventDefault();
            void onArchiveSubmit(archiveFile, archiveDraft);
          }}
        >
          <div className="account-workbench-setting-grid">
            <label className="account-workbench-field">
              <span className="account-workbench-field-label">{copy.imports.archiveFile}</span>
              <input
                type="file"
                className="account-workbench-search-input"
                onChange={(event) => setArchiveFile(event.target.files?.[0] || null)}
              />
            </label>
            <label className="account-workbench-field">
              <span className="account-workbench-field-label">{copy.manual.tags}</span>
              <input
                className="account-workbench-search-input"
                value={archiveDraft.tags}
                onChange={(event) => setArchiveDraft((previous) => ({ ...previous, tags: event.target.value }))}
              />
            </label>
            <label className="account-workbench-field">
              <span className="account-workbench-field-label">{copy.visibility}</span>
              <select
                className="account-workbench-select-input"
                value={archiveDraft.visibility}
                onChange={(event) => setArchiveDraft((previous) => ({ ...previous, visibility: event.target.value }))}
              >
                <option value="private">private</option>
                <option value="internal">internal</option>
                <option value="public">public</option>
              </select>
            </label>
            <label className="account-workbench-field">
              <span className="account-workbench-field-label">{copy.manual.installCommand}</span>
              <input
                className="account-workbench-search-input"
                value={archiveDraft.install_command}
                onChange={(event) => setArchiveDraft((previous) => ({ ...previous, install_command: event.target.value }))}
              />
            </label>
          </div>
          <div className="account-workbench-inline-actions">
            <button type="submit" className="account-workbench-action-button" disabled={submittingAction === "archive"}>
              {copy.imports.archiveSubmit}
            </button>
          </div>
        </form>
      </section>

      <section className="panel account-workbench-role-panel">
        <h3>{copy.imports.skillmpTitle}</h3>
        <p className="account-workbench-filter-summary">{copy.formHints.skillmp}</p>
        <form
          className="account-workbench-role-form"
          onSubmit={(event) => {
            event.preventDefault();
            void onSkillMPSubmit(skillMPDraft);
          }}
        >
          <label className="account-workbench-field">
            <span className="account-workbench-field-label">{copy.imports.skillmpURL}</span>
            <input
              className="account-workbench-search-input"
              value={skillMPDraft.skillmp_url}
              onChange={(event) => setSkillMPDraft((previous) => ({ ...previous, skillmp_url: event.target.value }))}
            />
          </label>
          <label className="account-workbench-field">
            <span className="account-workbench-field-label">{copy.imports.skillmpID}</span>
            <input
              className="account-workbench-search-input"
              value={skillMPDraft.skillmp_id}
              onChange={(event) => setSkillMPDraft((previous) => ({ ...previous, skillmp_id: event.target.value }))}
            />
          </label>
          <label className="account-workbench-field">
            <span className="account-workbench-field-label">{copy.imports.skillmpToken}</span>
            <input
              className="account-workbench-search-input"
              value={skillMPDraft.skillmp_token}
              onChange={(event) => setSkillMPDraft((previous) => ({ ...previous, skillmp_token: event.target.value }))}
            />
          </label>
          <label className="account-workbench-field">
            <span className="account-workbench-field-label">{copy.manual.tags}</span>
            <input
              className="account-workbench-search-input"
              value={skillMPDraft.tags}
              onChange={(event) => setSkillMPDraft((previous) => ({ ...previous, tags: event.target.value }))}
            />
          </label>
          <label className="account-workbench-field">
            <span className="account-workbench-field-label">{copy.visibility}</span>
            <select
              className="account-workbench-select-input"
              value={skillMPDraft.visibility}
              onChange={(event) => setSkillMPDraft((previous) => ({ ...previous, visibility: event.target.value }))}
            >
              <option value="private">private</option>
              <option value="internal">internal</option>
              <option value="public">public</option>
            </select>
          </label>
          <label className="account-workbench-field">
            <span className="account-workbench-field-label">{copy.manual.installCommand}</span>
            <input
              className="account-workbench-search-input"
              value={skillMPDraft.install_command}
              onChange={(event) => setSkillMPDraft((previous) => ({ ...previous, install_command: event.target.value }))}
            />
          </label>
          <div className="account-workbench-inline-actions">
            <button type="submit" className="account-workbench-action-button" disabled={submittingAction === "skillmp"}>
              {copy.imports.skillmpSubmit}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h3>{copy.imports.inventoryTitle}</h3>
        {skills.length === 0 ? (
          <p className="account-workbench-filter-summary">{copy.imports.inventoryEmptyText}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">{copy.sourceType}</th>
                  <th scope="col">{copy.visibility}</th>
                  <th scope="col">{copy.updatedAt}</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => (
                  <tr key={skill.id}>
                    <td>{skill.id}</td>
                    <td>{skill.name || "-"}</td>
                    <td>{skill.source_type || "-"}</td>
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
        <h3>{copy.imports.jobsTitle}</h3>
        {importJobs.length === 0 ? (
          <p className="account-workbench-filter-summary">{copy.imports.jobsEmptyText}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">{copy.runID}</th>
                  <th scope="col">{copy.jobType}</th>
                  <th scope="col">{copy.runStatus}</th>
                  <th scope="col">{copy.actor}</th>
                  <th scope="col">{copy.targetSkill}</th>
                  <th scope="col">{copy.createdAt}</th>
                  <th scope="col">{copy.actions}</th>
                </tr>
              </thead>
              <tbody>
                {importJobs.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.job_type || "-"}</td>
                    <td>{item.status || "-"}</td>
                    <td>{item.actor_user_id || "-"}</td>
                    <td>{item.target_skill_id || "-"}</td>
                    <td>{formatSkillOperationsDateTime(item.created_at, locale)}</td>
                    <td>
                      <div className="account-workbench-inline-actions">
                        {canRetryImportJob(item) ? (
                          <button
                            type="button"
                            className="account-workbench-action-button"
                            onClick={() => void onRetryJob(item.id)}
                            disabled={submittingAction === "job-action"}
                          >
                            {copy.retryAction}
                          </button>
                        ) : null}
                        {canCancelImportJob(item) ? (
                          <button
                            type="button"
                            className="account-workbench-action-button"
                            onClick={() => void onCancelJob(item.id)}
                            disabled={submittingAction === "job-action"}
                          >
                            {copy.cancelAction}
                          </button>
                        ) : null}
                        {!canRetryImportJob(item) && !canCancelImportJob(item) ? <span>-</span> : null}
                      </div>
                      {item.error_message ? <p className="account-workbench-filter-summary">{item.error_message}</p> : null}
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
