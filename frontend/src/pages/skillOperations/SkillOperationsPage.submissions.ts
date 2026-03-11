import type { ManualSkillDraft, RepositorySkillDraft, SkillMPDraft } from "./SkillOperationsPage.types";

function appendSearchParam(params: URLSearchParams, key: string, value: string): void {
  const normalizedValue = String(value || "").trim();
  if (normalizedValue) {
    params.set(key, normalizedValue);
  }
}

export type SkillOperationsMutationResponse = {
  ok?: boolean;
  message?: string;
  error?: string;
};

export function buildManualPayload(draft: ManualSkillDraft): URLSearchParams {
  const params = new URLSearchParams();
  appendSearchParam(params, "name", draft.name);
  appendSearchParam(params, "description", draft.description);
  appendSearchParam(params, "content", draft.content);
  appendSearchParam(params, "tags", draft.tags);
  appendSearchParam(params, "visibility", draft.visibility);
  appendSearchParam(params, "install_command", draft.install_command);
  return params;
}

export function buildRepositoryPayload(draft: RepositorySkillDraft): URLSearchParams {
  const params = new URLSearchParams();
  appendSearchParam(params, "repo_url", draft.repo_url);
  appendSearchParam(params, "repo_branch", draft.repo_branch);
  appendSearchParam(params, "repo_path", draft.repo_path);
  appendSearchParam(params, "tags", draft.tags);
  appendSearchParam(params, "visibility", draft.visibility);
  appendSearchParam(params, "install_command", draft.install_command);
  return params;
}

export function buildArchivePayload(file: File, draft: Pick<RepositorySkillDraft, "tags" | "visibility" | "install_command">): FormData {
  const formData = new FormData();
  formData.set("archive", file);
  if (draft.tags.trim()) {
    formData.set("tags", draft.tags.trim());
  }
  if (draft.visibility.trim()) {
    formData.set("visibility", draft.visibility.trim());
  }
  if (draft.install_command.trim()) {
    formData.set("install_command", draft.install_command.trim());
  }
  return formData;
}

export function buildSkillMPPayload(draft: SkillMPDraft): URLSearchParams {
  const params = new URLSearchParams();
  appendSearchParam(params, "skillmp_url", draft.skillmp_url);
  appendSearchParam(params, "skillmp_id", draft.skillmp_id);
  appendSearchParam(params, "skillmp_token", draft.skillmp_token);
  appendSearchParam(params, "tags", draft.tags);
  appendSearchParam(params, "visibility", draft.visibility);
  appendSearchParam(params, "install_command", draft.install_command);
  return params;
}

export function buildRepositorySyncBatchPayload(limit = 50): URLSearchParams {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  return params;
}
