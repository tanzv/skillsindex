"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminPageScaffold } from "@/src/components/admin/AdminPrimitives";
import { Button } from "@/src/components/ui/button";
import { useProtectedI18n } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";

import { buildOrganizationsOverview, normalizeOrganizationMembersPayload, normalizeOrganizationsPayload } from "./organizationsModel";
import {
  CreateOrganizationPanel,
  MemberAssignmentPanel,
  MemberLedgerPanel,
  OrganizationDirectoryPanel,
  SelectedOrganizationPanel
} from "./AdminOrganizationsPanels";

export function AdminOrganizationsPage() {
  const { messages } = useProtectedI18n();
  const commonMessages = messages.adminCommon;
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
        setError(loadError instanceof Error ? loadError.message : organizationMessages.loadError);
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

  useEffect(() => {
    if (selectedOrgId) {
      void loadMembers(selectedOrgId);
    }
  }, [loadMembers, selectedOrgId]);

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
      setNewOrganizationName("");
      setMessage(organizationMessages.createSuccess);
      await refreshAll(nextOrgId);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : organizationMessages.createError);
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
      setTargetUserId("");
      setMessage(organizationMessages.addMemberSuccess);
      await loadMembers(selectedOrgId);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : organizationMessages.addMemberError);
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
      setError(actionError instanceof Error ? actionError.message : organizationMessages.updateRoleError);
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
      setMessage(formatProtectedMessage(organizationMessages.removeMemberSuccess, { userId }));
      await loadMembers(selectedOrgId);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : organizationMessages.removeMemberError);
    } finally {
      setBusyAction("");
    }
  }

  return (
    <AdminPageScaffold
      eyebrow={commonMessages.adminEyebrow}
      title={organizationMessages.pageTitle}
      description={organizationMessages.pageDescription}
      actions={
        <Button onClick={() => void refreshAll(selectedOrgId)}>{loading ? commonMessages.refreshing : commonMessages.refresh}</Button>
      }
      metrics={overview.metrics}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <OrganizationDirectoryPanel
            organizations={organizations.items}
            selectedOrgId={selectedOrgId}
            loading={loading}
            error={error}
            message={message}
            onSelectOrganization={setSelectedOrgId}
          />
          <MemberLedgerPanel
            members={members.items}
            totalMembers={members.total}
            membersLoading={membersLoading}
            loading={loading}
            busyAction={busyAction}
            rowRoleDrafts={rowRoleDrafts}
            onRoleDraftChange={(userId, role) =>
              setRowRoleDrafts((current) => ({
                ...current,
                [userId]: role
              }))
            }
            onUpdateMemberRole={(userId) => void updateMemberRole(userId)}
            onRemoveMember={(userId) => void removeMember(userId)}
          />
        </div>

        <div className="space-y-6">
          <CreateOrganizationPanel
            value={newOrganizationName}
            busyAction={busyAction}
            onChange={setNewOrganizationName}
            onCreate={() => void createOrganization()}
          />
          <MemberAssignmentPanel
            selectedOrgId={selectedOrgId}
            targetUserId={targetUserId}
            targetRole={targetRole}
            busyAction={busyAction}
            onTargetUserIdChange={setTargetUserId}
            onTargetRoleChange={setTargetRole}
            onSave={() => void addOrUpdateMember()}
          />
          <SelectedOrganizationPanel overview={overview} />
        </div>
      </div>
    </AdminPageScaffold>
  );
}
