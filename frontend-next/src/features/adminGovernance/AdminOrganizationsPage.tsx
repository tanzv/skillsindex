"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminPageLoadStateFrame, resolveAdminPageLoadState } from "@/src/features/admin/adminPageLoadState";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { useAdminOverlayState } from "@/src/lib/admin/useAdminOverlayState";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import { AdminOrganizationsContent } from "./AdminOrganizationsContent";
import {
  buildOrganizationsOverview,
  normalizeOrganizationMembersPayload,
  normalizeOrganizationsPayload,
  resolveSelectedOrganizationMember
} from "./organizationsModel";

export function AdminOrganizationsPage() {
  const { messages } = useProtectedI18n();
  const organizationMessages = messages.adminOrganizations;
  const organizationNormalizationMessages = useMemo(
    () => ({
      valueUntitledOrganization: organizationMessages.valueUntitledOrganization,
      valueNotAvailable: organizationMessages.valueNotAvailable,
      valueUnknownUser: organizationMessages.valueUnknownUser,
      valueUnknownStatus: organizationMessages.valueUnknownStatus,
      defaultMemberRole: organizationMessages.defaultMemberRole
    }),
    [
      organizationMessages.defaultMemberRole,
      organizationMessages.valueNotAvailable,
      organizationMessages.valueUnknownStatus,
      organizationMessages.valueUnknownUser,
      organizationMessages.valueUntitledOrganization
    ]
  );
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rawOrganizations, setRawOrganizations] = useState<unknown>(null);
  const [rawMembers, setRawMembers] = useState<unknown>(null);
  const [selectedOrgId, setSelectedOrgId] = useState(0);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const { overlay, openOverlay, closeOverlay } = useAdminOverlayState<"organizationCreate" | "organizationMember">();
  const [newOrganizationName, setNewOrganizationName] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [targetRole, setTargetRole] = useState("member");
  const [rowRoleDrafts, setRowRoleDrafts] = useState<Record<number, string>>({});

  const organizations = useMemo(
    () => normalizeOrganizationsPayload(rawOrganizations, organizationNormalizationMessages),
    [organizationNormalizationMessages, rawOrganizations]
  );
  const members = useMemo(
    () => normalizeOrganizationMembersPayload(rawMembers, organizationNormalizationMessages),
    [organizationNormalizationMessages, rawMembers]
  );
  const selectedMember = useMemo(
    () => resolveSelectedOrganizationMember(members.items, selectedMemberId),
    [members.items, selectedMemberId]
  );
  const overview = useMemo(
    () =>
      buildOrganizationsOverview(organizations, members, selectedOrgId, {
        organizations: organizationMessages.metricOrganizations,
        selectedMembers: organizationMessages.metricSelectedMembers,
        activeMembers: organizationMessages.metricActiveMembers,
        distinctRoles: organizationMessages.metricDistinctRoles
      }),
    [
      members,
      organizationMessages.metricActiveMembers,
      organizationMessages.metricDistinctRoles,
      organizationMessages.metricOrganizations,
      organizationMessages.metricSelectedMembers,
      organizations,
      selectedOrgId
    ]
  );

  const loadOrganizations = useCallback(
    async (preferredOrgId?: number) => {
      const payload = await clientFetchJSON("/api/bff/admin/organizations");
      const normalized = normalizeOrganizationsPayload(payload, organizationNormalizationMessages);
      setRawOrganizations(payload);
      const nextOrgId = preferredOrgId || selectedOrgId || normalized.items[0]?.id || 0;
      setSelectedOrgId(normalized.items.some((item) => item.id === nextOrgId) ? nextOrgId : normalized.items[0]?.id || 0);
      return normalized;
    },
    [organizationNormalizationMessages, selectedOrgId]
  );

  const loadMembers = useCallback(async (orgId: number) => {
    if (!orgId) {
      setRawMembers(null);
      setRowRoleDrafts({});
      return;
    }
    setMembersLoading(true);
    try {
      const payload = await clientFetchJSON(`/api/bff/admin/organizations/${orgId}/members`);
      const normalized = normalizeOrganizationMembersPayload(payload, organizationNormalizationMessages);
      setRawMembers(payload);
      setRowRoleDrafts(
        normalized.items.reduce<Record<number, string>>((accumulator, item) => {
          accumulator[item.userId] = item.role || organizationNormalizationMessages.defaultMemberRole;
          return accumulator;
        }, {})
      );
    } catch (loadError) {
      setRawMembers(null);
      setRowRoleDrafts({});
      throw loadError;
    } finally {
      setMembersLoading(false);
    }
  }, [organizationNormalizationMessages]);

  const refreshAll = useCallback(
    async (preferredOrgId?: number) => {
      setLoading(true);
      setError("");
      try {
        const payload = await loadOrganizations(preferredOrgId);
        const nextOrgId = preferredOrgId || selectedOrgId || payload.items[0]?.id || 0;
        if (nextOrgId) {
          await loadMembers(nextOrgId);
        } else {
          setRawMembers(null);
        }
      } catch (loadError) {
        setError(resolveRequestErrorDisplayMessage(loadError, organizationMessages.loadError));
        setRawOrganizations(null);
        setRawMembers(null);
      } finally {
        setLoading(false);
      }
    },
    [loadMembers, loadOrganizations, organizationMessages.loadError, selectedOrgId]
  );

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const loadState = resolveAdminPageLoadState({
    loading,
    error,
    hasData: rawOrganizations !== null && (selectedOrgId === 0 || rawMembers !== null)
  });

  useEffect(() => {
    if (selectedOrgId) {
      void loadMembers(selectedOrgId).catch((loadError) => {
        setError(resolveRequestErrorDisplayMessage(loadError, organizationMessages.loadError));
      });
    }
  }, [loadMembers, organizationMessages.loadError, selectedOrgId]);

  useEffect(() => {
    if (selectedMemberId !== null && !selectedMember) {
      setSelectedMemberId(null);
      closeOverlay();
    }
  }, [closeOverlay, selectedMember, selectedMemberId]);

  async function createOrganization() {
    const name = newOrganizationName.trim();
    if (!name) {
      setError(organizationMessages.createRequiredNameError);
      return;
    }
    setBusyAction("create-organization");
    setError("");
    setMessage("");
    try {
      const payload = await clientFetchJSON<{ item?: { id?: number } }>("/api/bff/admin/organizations", {
        method: "POST",
        body: { name }
      });
      const nextOrgId = Number(payload.item?.id || 0) || undefined;
      closeOverlay();
      setNewOrganizationName("");
      setMessage(organizationMessages.createSuccess);
      await refreshAll(nextOrgId);
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, organizationMessages.createError));
    } finally {
      setBusyAction("");
    }
  }

  async function addOrUpdateMember() {
    const userId = Number(targetUserId);
    if (!selectedOrgId || !Number.isFinite(userId) || userId <= 0) {
      setError(organizationMessages.addMemberValidationError);
      return;
    }
    setBusyAction("add-member");
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(`/api/bff/admin/organizations/${selectedOrgId}/members`, {
        method: "POST",
        body: { user_id: userId, role: targetRole }
      });
      closeOverlay();
      setTargetUserId("");
      setTargetRole("member");
      setMessage(organizationMessages.addMemberSuccess);
      await loadMembers(selectedOrgId);
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, organizationMessages.addMemberError));
    } finally {
      setBusyAction("");
    }
  }

  async function updateMemberRole(userId: number) {
    setBusyAction(`update-role-${userId}`);
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(`/api/bff/admin/organizations/${selectedOrgId}/members/${userId}/role`, {
        method: "POST",
        body: { role: rowRoleDrafts[userId] || "member" }
      });
      setMessage(formatProtectedMessage(organizationMessages.updateRoleSuccess, { userId }));
      await loadMembers(selectedOrgId);
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, organizationMessages.updateRoleError));
    } finally {
      setBusyAction("");
    }
  }

  async function removeMember(userId: number) {
    setBusyAction(`remove-member-${userId}`);
    setError("");
    setMessage("");
    try {
      await clientFetchJSON(`/api/bff/admin/organizations/${selectedOrgId}/members/${userId}/remove`, {
        method: "POST"
      });
      setSelectedMemberId(null);
      closeOverlay();
      setMessage(formatProtectedMessage(organizationMessages.removeMemberSuccess, { userId }));
      await loadMembers(selectedOrgId);
    } catch (actionError) {
      setError(resolveRequestErrorDisplayMessage(actionError, organizationMessages.removeMemberError));
    } finally {
      setBusyAction("");
    }
  }

  if (loadState !== "ready") {
    return (
      <AdminPageLoadStateFrame
        eyebrow={messages.adminCommon.adminEyebrow}
        title={organizationMessages.pageTitle}
        description={organizationMessages.pageDescription}
        error={loadState === "error" ? error : undefined}
        actions={<Button onClick={() => void refreshAll()}>{loading ? messages.adminCommon.refreshing : messages.adminCommon.refresh}</Button>}
      />
    );
  }

  return (
    <AdminOrganizationsContent
      loading={loading}
      membersLoading={membersLoading}
      busyAction={busyAction}
      error={error}
      message={message}
      metrics={overview.metrics}
      organizations={organizations.items}
      members={members.items}
      totalMembers={members.total}
      overview={overview}
      selectedOrgId={selectedOrgId}
      selectedMember={selectedMember}
      rowRoleDrafts={rowRoleDrafts}
      newOrganizationName={newOrganizationName}
      targetUserId={targetUserId}
      targetRole={targetRole}
      activePane={
        overlay?.entity === "organizationCreate"
          ? "create"
          : overlay?.entity === "organizationMember"
            ? selectedMember
              ? "memberDetail"
              : "memberAssign"
            : "idle"
      }
      onRefresh={() => void refreshAll(selectedOrgId)}
      onSelectOrganization={setSelectedOrgId}
      onOpenCreatePane={() => openOverlay({ kind: "create", entity: "organizationCreate" })}
      onOpenMemberAssignmentPane={() => {
        setSelectedMemberId(null);
        setTargetUserId("");
        setTargetRole("member");
        openOverlay({ kind: "edit", entity: "organizationMember", entityId: selectedOrgId || null });
      }}
      onOpenMemberDetailPane={(userId) => {
        setSelectedMemberId(userId);
        openOverlay({ kind: "detail", entity: "organizationMember", entityId: userId });
      }}
      onClosePane={() => {
        setSelectedMemberId(null);
        closeOverlay();
      }}
      onNewOrganizationNameChange={setNewOrganizationName}
      onTargetUserIdChange={setTargetUserId}
      onTargetRoleChange={setTargetRole}
      onRoleDraftChange={(userId, role) =>
        setRowRoleDrafts((current) => ({
          ...current,
          [userId]: role
        }))
      }
      onCreateOrganization={() => void createOrganization()}
      onSaveMember={() => void addOrUpdateMember()}
      onUpdateMemberRole={(userId) => void updateMemberRole(userId)}
      onRemoveMember={(userId) => void removeMember(userId)}
    />
  );
}
