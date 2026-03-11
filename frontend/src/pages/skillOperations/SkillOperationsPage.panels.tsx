import type { SyncPolicyRecord } from "../recordsSyncCenter/RecordsSyncCenterPage.types";
import { getSkillOperationsCopy } from "./SkillOperationsPage.copy";
import type { SkillOperationsSubmissionAction } from "./SkillOperationsPage.types";

export function SkillOperationsPolicyPanel({
  copy,
  policy,
  onPolicyChange,
  onSavePolicy,
  submittingAction
}: {
  copy: ReturnType<typeof getSkillOperationsCopy>;
  policy: SyncPolicyRecord;
  onPolicyChange: (patch: Partial<SyncPolicyRecord>) => void;
  onSavePolicy: () => Promise<void>;
  submittingAction: SkillOperationsSubmissionAction;
}) {
  return (
    <section className="panel account-workbench-role-panel">
      <h3>{copy.policyTitle}</h3>
      <p className="account-workbench-filter-summary">{copy.policyDescription}</p>
      <div className="account-workbench-setting-grid">
        <label className="account-workbench-field">
          <span className="account-workbench-field-label">{copy.enabled}</span>
          <select
            className="account-workbench-select-input"
            value={policy.enabled ? "true" : "false"}
            onChange={(event) => onPolicyChange({ enabled: event.target.value === "true" })}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        </label>
        <label className="account-workbench-field">
          <span className="account-workbench-field-label">{copy.batchSize}</span>
          <select
            className="account-workbench-select-input"
            value={String(policy.batch_size)}
            onChange={(event) => onPolicyChange({ batch_size: Number(event.target.value) })}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </label>
        <label className="account-workbench-field">
          <span className="account-workbench-field-label">{copy.interval}</span>
          <input
            className="account-workbench-search-input"
            value={policy.interval}
            onChange={(event) => onPolicyChange({ interval: event.target.value })}
          />
        </label>
        <label className="account-workbench-field">
          <span className="account-workbench-field-label">{copy.timeout}</span>
          <input
            className="account-workbench-search-input"
            value={policy.timeout}
            onChange={(event) => onPolicyChange({ timeout: event.target.value })}
          />
        </label>
      </div>
      <div className="account-workbench-inline-actions">
        <button type="button" className="account-workbench-action-button" onClick={() => void onSavePolicy()} disabled={submittingAction === "policy"}>
          {copy.savePolicy}
        </button>
      </div>
    </section>
  );
}

export function SkillOperationsActionsPanel({
  copy,
  onNavigate
}: {
  copy: ReturnType<typeof getSkillOperationsCopy>;
  onNavigate: (path: string) => void;
}) {
  return (
    <section className="panel">
      <h3>{copy.actions}</h3>
      <div className="account-workbench-inline-actions">
        <button type="button" className="account-workbench-action-button" onClick={() => onNavigate("/admin/skills")}>
          {copy.openSkills}
        </button>
        <button type="button" className="account-workbench-action-button" onClick={() => onNavigate("/admin/records/imports")}>
          {copy.openImports}
        </button>
        <button type="button" className="account-workbench-action-button" onClick={() => onNavigate("/admin/sync-jobs")}>
          {copy.openSyncRuns}
        </button>
      </div>
    </section>
  );
}
