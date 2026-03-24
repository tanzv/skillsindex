"use client";

import { useState } from "react";

import {
  buildAccountProfileDraft,
  sanitizeAccountProfileDraft,
  type AccountProfileDraft,
  type AccountProfilePayload
} from "@/src/lib/account/accountProfile";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";

interface AccountCenterProfileEditorMessages {
  profileSaveSuccess: string;
  profileSaveError: string;
}

interface UseAccountCenterProfileEditorOptions {
  fallbackUserName: string;
  messages: AccountCenterProfileEditorMessages;
  onSaved?: () => void;
}

export function useAccountCenterProfileEditor({
  fallbackUserName,
  messages,
  onSaved
}: UseAccountCenterProfileEditorOptions) {
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profilePayload, setProfilePayload] = useState<AccountProfilePayload | null>(null);
  const [profileDraft, setProfileDraft] = useState<AccountProfileDraft>(() => buildAccountProfileDraft(null, fallbackUserName));

  function resetProfileFeedback() {
    setProfileError("");
    setProfileMessage("");
  }

  async function loadProfileEditor() {
    resetProfileFeedback();
    setProfileLoading(true);

    try {
      const payload = await clientFetchJSON<AccountProfilePayload>("/api/bff/account/profile");
      setProfilePayload(payload);
      setProfileDraft(buildAccountProfileDraft(payload, fallbackUserName));
    } catch (error) {
      setProfileError(resolveRequestErrorDisplayMessage(error, messages.profileSaveError));
      setProfileDraft(buildAccountProfileDraft(null, fallbackUserName));
    } finally {
      setProfileLoading(false);
    }
  }

  async function openProfileEditor() {
    setProfileEditorOpen(true);
    await loadProfileEditor();
  }

  async function saveProfile() {
    resetProfileFeedback();
    setProfileSaving(true);

    try {
      const payload = await clientFetchJSON<AccountProfilePayload>("/api/bff/account/profile", {
        method: "POST",
        body: sanitizeAccountProfileDraft(profileDraft)
      });
      setProfilePayload(payload);
      setProfileDraft(buildAccountProfileDraft(payload, fallbackUserName));
      setProfileMessage(messages.profileSaveSuccess);
      onSaved?.();
    } catch (error) {
      setProfileError(resolveRequestErrorDisplayMessage(error, messages.profileSaveError));
    } finally {
      setProfileSaving(false);
    }
  }

  function closeProfileEditor() {
    setProfileEditorOpen(false);
    resetProfileFeedback();
  }

  return {
    closeProfileEditor,
    openProfileEditor,
    profileDraft,
    profileEditorOpen,
    profileError,
    profileLoading,
    profileMessage,
    profilePayload,
    profileSaving,
    saveProfile,
    setProfileDraft
  };
}
