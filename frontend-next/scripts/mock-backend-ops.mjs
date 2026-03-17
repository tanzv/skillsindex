function asPositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function asBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return ["true", "1", "yes", "on"].includes(value.trim().toLowerCase());
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  return fallback;
}

function nowTimestamp() {
  return new Date().toISOString();
}

function withLimit(items, url) {
  const limit = asPositiveInteger(url.searchParams.get("limit"), items.length || 50);
  return items.slice(0, limit);
}

function updateCollection(collection, items) {
  collection.items = items;
  collection.total = items.length;
}

function appendAuditEvent(state, action, targetType, targetId, note) {
  const items = state.opsAuditExport.items || [];
  const nextItem = {
    occurred_at: nowTimestamp(),
    actor_user_id: 1,
    action,
    target_type: targetType,
    target_id: targetId,
    note
  };
  updateCollection(state.opsAuditExport, [nextItem, ...items]);
}

function filterAuditItems(items, url) {
  const from = asString(url.searchParams.get("from"));
  const to = asString(url.searchParams.get("to"));

  return items.filter((item) => {
    const occurredAt = asString(item.occurred_at);
    if (from && occurredAt < from) {
      return false;
    }
    if (to && occurredAt > to) {
      return false;
    }
    return true;
  });
}

function buildCollectionPayload(items, url) {
  const filteredItems = withLimit(items, url);
  return {
    total: filteredItems.length,
    items: filteredItems
  };
}

export async function handleOpsRequest({ method, pathname, url, request, response, state, json, parseJSONBody }) {
  if (method === "GET" && pathname === "/api/v1/admin/ops/audit-export") {
    const items = filterAuditItems(state.opsAuditExport.items || [], url);
    json(response, 200, buildCollectionPayload(items, url));
    return true;
  }

  if (method === "GET" && pathname === "/api/v1/admin/ops/recovery-drills") {
    json(response, 200, buildCollectionPayload(state.opsRecoveryDrills.items || [], url));
    return true;
  }

  if (method === "POST" && pathname === "/api/v1/admin/ops/recovery-drills/run") {
    const body = await parseJSONBody(request);
    const rpoHours = asNumber(body.rpo_hours);
    const rtoHours = asNumber(body.rto_hours);
    const item = {
      logged_at: asString(body.occurred_at, nowTimestamp()),
      actor_user_id: 1,
      rpo_hours: rpoHours,
      rto_hours: rtoHours,
      passed: rpoHours <= 4 && rtoHours <= 6,
      note: asString(body.note)
    };
    updateCollection(state.opsRecoveryDrills, [item, ...(state.opsRecoveryDrills.items || [])]);
    appendAuditEvent(state, "recovery_drill.record", "recovery_drill", `${rpoHours}/${rtoHours}`, item.note);
    json(response, 200, { item });
    return true;
  }

  if (method === "GET" && pathname === "/api/v1/admin/ops/releases") {
    json(response, 200, buildCollectionPayload(state.opsReleases.items || [], url));
    return true;
  }

  if (method === "POST" && pathname === "/api/v1/admin/ops/releases") {
    const body = await parseJSONBody(request);
    const item = {
      released_at: asString(body.released_at, nowTimestamp()),
      actor_user_id: 1,
      version: asString(body.version, "v0.0.0"),
      environment: asString(body.environment, "production"),
      change_ticket: asString(body.change_ticket, "CHG-0000"),
      status: asString(body.status, "success"),
      note: asString(body.note)
    };
    updateCollection(state.opsReleases, [item, ...(state.opsReleases.items || [])]);
    appendAuditEvent(state, "release.create", "release", item.version, item.note);
    json(response, 200, { item });
    return true;
  }

  if (method === "GET" && pathname === "/api/v1/admin/ops/change-approvals") {
    json(response, 200, buildCollectionPayload(state.opsChangeApprovals.items || [], url));
    return true;
  }

  if (method === "POST" && pathname === "/api/v1/admin/ops/change-approvals") {
    const body = await parseJSONBody(request);
    const item = {
      occurred_at: asString(body.occurred_at, nowTimestamp()),
      actor_user_id: 1,
      ticket_id: asString(body.ticket_id, "CHG-0000"),
      reviewer: asString(body.reviewer, "admin"),
      status: asString(body.status, "approved"),
      note: asString(body.note)
    };
    updateCollection(state.opsChangeApprovals, [item, ...(state.opsChangeApprovals.items || [])]);
    appendAuditEvent(state, "change_approval.create", "change_approval", item.ticket_id, item.note);
    json(response, 200, { item });
    return true;
  }

  if (method === "GET" && pathname === "/api/v1/admin/ops/backup/plans") {
    json(response, 200, buildCollectionPayload(state.opsBackupPlans.items || [], url));
    return true;
  }

  if (method === "POST" && pathname === "/api/v1/admin/ops/backup/plans") {
    const body = await parseJSONBody(request);
    const nextPlanKey = asString(body.plan_key, "backup-plan");
    const existingItems = state.opsBackupPlans.items || [];
    const nextItem = {
      logged_at: asString(body.occurred_at, nowTimestamp()),
      actor_user_id: 1,
      plan_key: nextPlanKey,
      backup_type: asString(body.backup_type, "full"),
      schedule: asString(body.schedule, "0 1 * * *"),
      retention_days: asNumber(body.retention_days, 30),
      enabled: asBoolean(body.enabled, false),
      note: asString(body.note)
    };

    const existingIndex = existingItems.findIndex((item) => item.plan_key === nextPlanKey);
    if (existingIndex >= 0) {
      const nextItems = [...existingItems];
      nextItems.splice(existingIndex, 1);
      updateCollection(state.opsBackupPlans, [nextItem, ...nextItems]);
    } else {
      updateCollection(state.opsBackupPlans, [nextItem, ...existingItems]);
    }

    appendAuditEvent(state, "backup_plan.upsert", "backup_plan", nextPlanKey, nextItem.note);
    json(response, 200, { item: nextItem });
    return true;
  }

  if (method === "GET" && pathname === "/api/v1/admin/ops/backup/runs") {
    json(response, 200, buildCollectionPayload(state.opsBackupRuns.items || [], url));
    return true;
  }

  if (method === "POST" && pathname === "/api/v1/admin/ops/backup/runs") {
    const body = await parseJSONBody(request);
    const item = {
      logged_at: asString(body.occurred_at, nowTimestamp()),
      actor_user_id: 1,
      plan_key: asString(body.plan_key, "backup-plan"),
      status: asString(body.status, "success"),
      size_mb: asNumber(body.size_mb),
      duration_minutes: asNumber(body.duration_minutes),
      note: asString(body.note)
    };
    updateCollection(state.opsBackupRuns, [item, ...(state.opsBackupRuns.items || [])]);
    appendAuditEvent(state, "backup_run.create", "backup_run", item.plan_key, item.note);
    json(response, 200, { item });
    return true;
  }

  return false;
}
