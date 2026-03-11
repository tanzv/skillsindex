import { useState } from "react";

import { formatSkillOperationsDateTime } from "./SkillOperationsPage.helpers";
import type { ManualSkillDraft, SkillInventoryItem, SkillOperationsCopy, SkillOperationsSubmissionAction } from "./SkillOperationsPage.types";
import type { AppLocale } from "../../lib/i18n";

interface SkillOperationsManualViewProps {
  locale: AppLocale;
  copy: SkillOperationsCopy;
  skills: SkillInventoryItem[];
  submittingAction: SkillOperationsSubmissionAction;
  onSubmit: (draft: ManualSkillDraft) => Promise<void>;
}

const initialDraft: ManualSkillDraft = {
  name: "",
  description: "",
  content: "",
  tags: "",
  visibility: "private",
  install_command: ""
};

export default function SkillOperationsManualView({
  locale,
  copy,
  skills,
  submittingAction,
  onSubmit
}: SkillOperationsManualViewProps) {
  const [draft, setDraft] = useState<ManualSkillDraft>(initialDraft);

  return (
    <>
      <section className="panel account-workbench-settings-panel">
        <h3>{copy.manual.title}</h3>
        <p className="account-workbench-filter-summary">{copy.formHints.manual}</p>
        <form
          className="account-workbench-setting-form"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit(draft);
          }}
        >
          <div className="account-workbench-setting-grid">
            <label className="account-workbench-field">
              <span className="account-workbench-field-label">{copy.manual.name}</span>
              <input
                required
                className="account-workbench-search-input"
                value={draft.name}
                onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))}
              />
            </label>
            <label className="account-workbench-field">
              <span className="account-workbench-field-label">{copy.manual.description}</span>
              <input
                className="account-workbench-search-input"
                value={draft.description}
                onChange={(event) => setDraft((previous) => ({ ...previous, description: event.target.value }))}
              />
            </label>
            <label className="account-workbench-field">
              <span className="account-workbench-field-label">{copy.manual.content}</span>
              <textarea
                required
                className="account-workbench-search-input"
                rows={8}
                value={draft.content}
                onChange={(event) => setDraft((previous) => ({ ...previous, content: event.target.value }))}
              />
            </label>
            <label className="account-workbench-field">
              <span className="account-workbench-field-label">{copy.manual.tags}</span>
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
              <span className="account-workbench-field-label">{copy.manual.installCommand}</span>
              <input
                className="account-workbench-search-input"
                value={draft.install_command}
                onChange={(event) => setDraft((previous) => ({ ...previous, install_command: event.target.value }))}
              />
            </label>
          </div>
          <div className="account-workbench-inline-actions">
            <button type="submit" className="account-workbench-action-button" disabled={submittingAction === "manual"}>
              {copy.manual.submit}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-hero-toolbar">
          <div className="panel-hero-toolbar-main">
            <h3 className="panel-hero-title">{copy.manual.inventoryTitle}</h3>
          </div>
        </div>
        {skills.length === 0 ? (
          <p className="account-workbench-filter-summary">{copy.manual.inventoryEmptyText}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">{copy.manual.name}</th>
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
    </>
  );
}
