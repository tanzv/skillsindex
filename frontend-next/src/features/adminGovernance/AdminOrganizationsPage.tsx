"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";

import { buildOrganizationsOverview, normalizeOrganizationMembersPayload, normalizeOrganizationsPayload } from "./organizationsModel";
import { formatDateTime } from "./shared";

const roleOptions = ["owner", "admin", "member", "viewer"] as const;

export function AdminOrganizationsPage() {
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

  const organizations = useMemo(() => normalizeOrganizationsPayload(rawOrganizations), [rawOrganizations]);
  const members = useMemo(() => normalizeOrganizationMembersPayload(rawMembers), [rawMembers]);
  const overview = useMemo(() => buildOrganizationsOverview(organizations, members, selectedOrgId), [members, organizations, selectedOrgId]);

  const loadOrganizations = useCallback(
    async (preferredOrgId?: number) => {
      const payload = await clientFetchJSON("/api/bff/admin/organizations");
      const normalized = normalizeOrganizationsPayload(payload);
      setRawOrganizations(payload);
      const nextOrgId = preferredOrgId || selectedOrgId || normalized.items[0]?.id || 0;
      setSelectedOrgId(normalized.items.some((item) => item.id === nextOrgId) ? nextOrgId : normalized.items[0]?.id || 0);
      return normalized;
    },
    [selectedOrgId]
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
      const normalized = normalizeOrganizationMembersPayload(payload);
      setRawMembers(payload);
      setRowRoleDrafts(
        normalized.items.reduce<Record<number, string>>((accumulator, item) => {
          accumulator[item.userId] = item.role || "member";
          return accumulator;
        }, {})
      );
    } finally {
      setMembersLoading(false);
    }
  }, []);

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
        setError(loadError instanceof Error ? loadError.message : "Failed to load organizations.");
        setRawOrganizations(null);
        setRawMembers(null);
      } finally {
        setLoading(false);
      }
    },
    [loadMembers, loadOrganizations, selectedOrgId]
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
      setError("Organization name is required.");
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
      setMessage("Organization created.");
      await refreshAll(nextOrgId);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to create organization.");
    } finally {
      setBusyAction("");
    }
  }

  async function addOrUpdateMember() {
    const userId = Number(targetUserId);
    if (!selectedOrgId || !Number.isFinite(userId) || userId <= 0) {
      setError("Valid organization and user ID are required.");
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
      setMessage("Member assignment saved.");
      await loadMembers(selectedOrgId);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to save organization member.");
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
      setMessage(`Role updated for user ${userId}.`);
      await loadMembers(selectedOrgId);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to update member role.");
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
      setMessage(`User ${userId} removed.`);
      await loadMembers(selectedOrgId);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Failed to remove organization member.");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Organizations"
        description="Manage organization inventory, member assignments, and role distribution without falling back to the generic workbench."
        actions={<Button onClick={() => void refreshAll(selectedOrgId)}>{loading ? "Refreshing..." : "Refresh"}</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="gap-2 p-5">
              <CardDescription className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{metric.label}</CardDescription>
              <CardTitle className="text-base">{metric.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Directory</CardTitle>
              <CardDescription>Select an organization to inspect its member ledger and current role distribution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error ? <ErrorState description={error} /> : null}
              {message ? <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">{message}</div> : null}

              <div className="flex flex-wrap gap-3">
                {organizations.items.map((item) => (
                  <Button key={item.id} variant={item.id === selectedOrgId ? "default" : "outline"} onClick={() => setSelectedOrgId(item.id)}>
                    {item.name}
                  </Button>
                ))}
              </div>

              {!organizations.items.length && !loading ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No organizations returned.</div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Member Ledger</CardTitle>
                  <CardDescription>Membership, source role, and lifecycle state for the active organization.</CardDescription>
                </div>
                {membersLoading ? <Badge variant="outline">Loading</Badge> : <Badge variant="outline">{members.total} members</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {members.items.map((member) => (
                <div key={`${member.organizationId}-${member.userId}`} data-testid={`organization-member-card-${member.userId}`} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-950">
                          {member.username} #{member.userId}
                        </span>
                        <Badge variant={member.userStatus.toLowerCase() === "active" ? "soft" : "outline"}>{member.userStatus}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">workspace {member.userRole}</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">org {member.role}</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">{formatDateTime(member.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        aria-label="Member role"
                        className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900"
                        value={rowRoleDrafts[member.userId] || member.role}
                        onChange={(event) =>
                          setRowRoleDrafts((current) => ({
                            ...current,
                            [member.userId]: event.target.value
                          }))
                        }
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void updateMemberRole(member.userId)}
                        disabled={Boolean(busyAction)}
                      >
                        {busyAction === `update-role-${member.userId}` ? "Saving..." : "Apply Role"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void removeMember(member.userId)} disabled={Boolean(busyAction)}>
                        {busyAction === `remove-member-${member.userId}` ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {!members.items.length && !membersLoading && !loading ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No members returned for the current organization.</div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Organization</CardTitle>
              <CardDescription>Provision a new organization and immediately attach it to the working context.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input aria-label="Organization name" value={newOrganizationName} placeholder="Platform Engineering" onChange={(event) => setNewOrganizationName(event.target.value)} />
              <Button onClick={() => void createOrganization()} disabled={Boolean(busyAction)}>
                {busyAction === "create-organization" ? "Creating..." : "Create Organization"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Member Assignment</CardTitle>
              <CardDescription>Add or update an organization member for the selected directory entry.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input aria-label="Organization member user ID" value={targetUserId} placeholder="Target user ID" onChange={(event) => setTargetUserId(event.target.value)} />
              <select
                aria-label="Organization member role"
                className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900"
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <Button onClick={() => void addOrUpdateMember()} disabled={Boolean(busyAction) || !selectedOrgId}>
                {busyAction === "add-member" ? "Saving..." : "Save Member"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selected Organization</CardTitle>
              <CardDescription>Current organization summary and role concentration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="font-semibold text-slate-950">{overview.selectedOrganization?.name || "No selection"}</div>
                <div className="mt-1">Slug: {overview.selectedOrganization?.slug || "n/a"}</div>
                <div className="mt-1">Updated: {overview.selectedOrganization ? formatDateTime(overview.selectedOrganization.updatedAt) : "n/a"}</div>
              </div>
              {overview.roleDistribution.map((item) => (
                <div key={item.role} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>{item.role}</span>
                  <span className="font-semibold text-slate-950">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
