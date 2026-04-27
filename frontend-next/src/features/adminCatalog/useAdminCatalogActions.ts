"use client";

import { useCallback, useState } from "react";

import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";
import {
  buildAdminJobCancelBFFEndpoint,
  buildAdminJobRetryBFFEndpoint,
  buildAdminSkillDeleteBFFEndpoint,
  buildAdminSkillSyncBFFEndpoint,
  buildAdminSkillVisibilityBFFEndpoint,
  buildSkillVersionRestoreBFFEndpoint,
  buildSkillVersionRollbackBFFEndpoint
} from "@/src/lib/routing/protectedSurfaceEndpoints";

import type { RepositorySyncPolicy } from "./model";

interface AdminCatalogActionMessages {
  actionError: string;
  retryJobSuccess: string;
  cancelJobSuccess: string;
  skillSyncSuccess: string;
  visibilityUpdateSuccess: string;
  skillDeleteSuccess: string;
  rollbackVersionSuccess: string;
  restoreVersionSuccess: string;
  policySaveSuccess: string;
}

export function useAdminCatalogActions({
  messages,
  policyEndpoint,
  policyDraft,
  loadData,
  setError
}: {
  messages: AdminCatalogActionMessages;
  policyEndpoint: string;
  policyDraft: RepositorySyncPolicy;
  loadData: () => Promise<void>;
  setError: (value: string) => void;
}) {
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("");

  const runJobAction = useCallback(async (jobId: number, action: "retry" | "cancel") => {
    setBusyAction(`${action}-${jobId}`);
    setMessage("");
    setError("");
    try {
      await clientFetchJSON(
        action === "retry" ? buildAdminJobRetryBFFEndpoint(jobId) : buildAdminJobCancelBFFEndpoint(jobId),
        { method: "POST" }
      );
      setMessage(
        formatProtectedMessage(action === "retry" ? messages.retryJobSuccess : messages.cancelJobSuccess, { jobId })
      );
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, messages.actionError));
    } finally {
      setBusyAction("");
    }
  }, [loadData, messages.actionError, messages.cancelJobSuccess, messages.retryJobSuccess, setError]);

  const syncSkill = useCallback(async (skillId: number) => {
    setBusyAction(`sync-skill-${skillId}`);
    setMessage("");
    setError("");
    try {
      await clientFetchJSON(buildAdminSkillSyncBFFEndpoint(skillId), {
        method: "POST"
      });
      setMessage(messages.skillSyncSuccess);
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, messages.actionError));
    } finally {
      setBusyAction("");
    }
  }, [loadData, messages.actionError, messages.skillSyncSuccess, setError]);

  const updateSkillVisibility = useCallback(async (skillId: number, visibility: "public" | "private") => {
    setBusyAction(`visibility-skill-${skillId}`);
    setMessage("");
    setError("");
    try {
      await clientFetchJSON(buildAdminSkillVisibilityBFFEndpoint(skillId), {
        method: "POST",
        body: { visibility }
      });
      setMessage(messages.visibilityUpdateSuccess);
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, messages.actionError));
    } finally {
      setBusyAction("");
    }
  }, [loadData, messages.actionError, messages.visibilityUpdateSuccess, setError]);

  const deleteSkill = useCallback(async (skillId: number) => {
    setBusyAction(`delete-skill-${skillId}`);
    setMessage("");
    setError("");
    try {
      await clientFetchJSON(buildAdminSkillDeleteBFFEndpoint(skillId), {
        method: "POST"
      });
      setMessage(messages.skillDeleteSuccess);
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, messages.actionError));
    } finally {
      setBusyAction("");
    }
  }, [loadData, messages.actionError, messages.skillDeleteSuccess, setError]);

  const rollbackSkillVersion = useCallback(async (skillId: number, versionId: number) => {
    setBusyAction(`rollback-version-${versionId}`);
    setMessage("");
    setError("");
    try {
      await clientFetchJSON(buildSkillVersionRollbackBFFEndpoint(skillId, versionId), {
        method: "POST"
      });
      setMessage(messages.rollbackVersionSuccess);
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, messages.actionError));
    } finally {
      setBusyAction("");
    }
  }, [loadData, messages.actionError, messages.rollbackVersionSuccess, setError]);

  const restoreSkillVersion = useCallback(async (skillId: number, versionId: number) => {
    setBusyAction(`restore-version-${versionId}`);
    setMessage("");
    setError("");
    try {
      await clientFetchJSON(buildSkillVersionRestoreBFFEndpoint(skillId, versionId), {
        method: "POST"
      });
      setMessage(messages.restoreVersionSuccess);
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, messages.actionError));
    } finally {
      setBusyAction("");
    }
  }, [loadData, messages.actionError, messages.restoreVersionSuccess, setError]);

  const savePolicy = useCallback(async () => {
    setBusyAction("save-policy");
    setMessage("");
    setError("");
    try {
      await clientFetchJSON(policyEndpoint, {
        method: "POST",
        body: {
          enabled: policyDraft.enabled,
          interval: policyDraft.interval,
          timeout: policyDraft.timeout,
          batch_size: policyDraft.batchSize
        }
      });
      setMessage(messages.policySaveSuccess);
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, messages.actionError));
    } finally {
      setBusyAction("");
    }
  }, [loadData, messages.actionError, messages.policySaveSuccess, policyDraft, policyEndpoint, setError]);

  return {
    busyAction,
    message,
    runJobAction: (jobId: number, action: "retry" | "cancel") => void runJobAction(jobId, action),
    syncSkill: (skillId: number) => void syncSkill(skillId),
    updateSkillVisibility: (skillId: number, visibility: "public" | "private") =>
      void updateSkillVisibility(skillId, visibility),
    deleteSkill: (skillId: number) => void deleteSkill(skillId),
    rollbackSkillVersion: (skillId: number, versionId: number) => void rollbackSkillVersion(skillId, versionId),
    restoreSkillVersion: (skillId: number, versionId: number) => void restoreSkillVersion(skillId, versionId),
    savePolicy: () => void savePolicy()
  };
}
