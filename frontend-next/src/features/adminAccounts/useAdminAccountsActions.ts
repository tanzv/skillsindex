"use client";

import { useCallback, useState, type MutableRefObject } from "react";

import { saveAdminAccessSettings, type SaveAdminAccessSettingsInput } from "@/src/lib/api/adminAccessSettings";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";
import {
  buildAdminAccountForceSignoutBFFEndpoint,
  buildAdminAccountPasswordResetBFFEndpoint,
  buildAdminAccountStatusBFFEndpoint,
  buildAdminUserRoleBFFEndpoint
} from "@/src/lib/routing/protectedSurfaceEndpoints";

import { resolveRoleTargetUserId } from "./model";
import type { AccountEditorState, RoleEditorState } from "./pageState";

interface AdminAccountsActionMessages {
  invalidUserIdError: string;
  invalidPasswordError: string;
  applyStatusSuccess: string;
  applyStatusError: string;
  forceSignOutSuccess: string;
  forceSignOutError: string;
  resetPasswordSuccess: string;
  resetPasswordError: string;
  applyRoleSuccess: string;
  applyRoleError: string;
  saveSettingsSuccess: string;
  saveSettingsError: string;
}

export function useAdminAccountsActions({
  accountMessages,
  accountEditorRef,
  roleEditorRef,
  selectedAccountId,
  settingsDraft,
  loadData,
  setError,
  updateAccountEditor
}: {
  accountMessages: AdminAccountsActionMessages;
  accountEditorRef: MutableRefObject<AccountEditorState>;
  roleEditorRef: MutableRefObject<RoleEditorState>;
  selectedAccountId: number | null;
  settingsDraft: SaveAdminAccessSettingsInput;
  loadData: () => Promise<void>;
  setError: (value: string) => void;
  updateAccountEditor: (patch: Partial<AccountEditorState>) => void;
}) {
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("");

  const applyAccountStatus = useCallback(async () => {
    const { userId: draftUserId, status } = accountEditorRef.current;
    const userId = Number(draftUserId);
    if (!Number.isFinite(userId) || userId <= 0) {
      setError(accountMessages.invalidUserIdError);
      return;
    }

    setBusyAction("apply-status");
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(buildAdminAccountStatusBFFEndpoint(userId), {
        method: "POST",
        body: { status }
      });
      setMessage(formatProtectedMessage(accountMessages.applyStatusSuccess, { userId }));
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, accountMessages.applyStatusError));
    } finally {
      setBusyAction("");
    }
  }, [accountEditorRef, accountMessages, loadData, setError]);

  const forceSignout = useCallback(async (userId: number) => {
    setBusyAction(`force-signout-${userId}`);
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(buildAdminAccountForceSignoutBFFEndpoint(userId), {
        method: "POST"
      });
      setMessage(formatProtectedMessage(accountMessages.forceSignOutSuccess, { userId }));
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, accountMessages.forceSignOutError));
    } finally {
      setBusyAction("");
    }
  }, [accountMessages, loadData, setError]);

  const resetPassword = useCallback(async () => {
    const { userId: draftUserId, newPassword } = accountEditorRef.current;
    const userId = Number(draftUserId);
    if (!Number.isFinite(userId) || userId <= 0 || !newPassword.trim()) {
      setError(accountMessages.invalidPasswordError);
      return;
    }

    setBusyAction("reset-password");
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(buildAdminAccountPasswordResetBFFEndpoint(userId), {
        method: "POST",
        body: { new_password: newPassword }
      });
      setMessage(formatProtectedMessage(accountMessages.resetPasswordSuccess, { userId }));
      updateAccountEditor({ newPassword: "" });
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, accountMessages.resetPasswordError));
    } finally {
      setBusyAction("");
    }
  }, [accountEditorRef, accountMessages, setError, updateAccountEditor]);

  const applyRole = useCallback(async () => {
    const { userId: draftUserId, role } = roleEditorRef.current;
    const userId = resolveRoleTargetUserId(draftUserId, selectedAccountId);
    if (userId === null) {
      setError(accountMessages.invalidUserIdError);
      return;
    }

    setBusyAction("apply-role");
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(buildAdminUserRoleBFFEndpoint(userId), {
        method: "POST",
        body: { role }
      });
      setMessage(formatProtectedMessage(accountMessages.applyRoleSuccess, { userId }));
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, accountMessages.applyRoleError));
    } finally {
      setBusyAction("");
    }
  }, [accountMessages, loadData, roleEditorRef, selectedAccountId, setError]);

  const saveSettings = useCallback(async () => {
    setBusyAction("save-settings");
    setError("");
    setMessage("");
    try {
      await saveAdminAccessSettings(settingsDraft);
      setMessage(accountMessages.saveSettingsSuccess);
      await loadData();
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, accountMessages.saveSettingsError));
    } finally {
      setBusyAction("");
    }
  }, [accountMessages, loadData, setError, settingsDraft]);

  return {
    busyAction,
    message,
    applyAccountStatus: () => void applyAccountStatus(),
    forceSignout: (userId: number) => void forceSignout(userId),
    resetPassword: () => void resetPassword(),
    applyRole: () => void applyRole(),
    saveSettings: () => void saveSettings()
  };
}
