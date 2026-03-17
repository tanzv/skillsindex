function nextIdentifier(items) {
  return (
    items.reduce((currentMax, item) => {
      const candidate = Number(item.id || 0);
      return Number.isFinite(candidate) ? Math.max(currentMax, candidate) : currentMax;
    }, 0) + 1
  );
}

function findAccount(state, userId) {
  return state.accounts.items.find((account) => account.id === userId) || null;
}

function filteredAdminAPIKeys(state, url) {
  const owner = String(url.searchParams.get("owner") || "").trim().toLowerCase();
  const status = String(url.searchParams.get("status") || "").trim().toLowerCase();

  const items = state.adminApiKeys.items.filter((item) => {
    if (owner && !item.owner_username.toLowerCase().includes(owner) && String(item.user_id) !== owner) {
      return false;
    }
    if (status && item.status.toLowerCase() !== status) {
      return false;
    }
    return true;
  });

  return { total: items.length, items };
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "organization";
}

function organizationMembersPayload(state, orgId) {
  const items = state.organizationMembers[String(orgId)] || [];
  return { total: items.length, items };
}

function upsertOrganizationMember(state, orgId, userId, role) {
  const account = findAccount(state, userId);
  if (!account) {
    return null;
  }

  const orgKey = String(orgId);
  const members = state.organizationMembers[orgKey] || [];
  const existingMember = members.find((member) => member.user_id === userId);
  const nextMember = {
    organization_id: orgId,
    user_id: userId,
    username: account.username,
    user_role: account.role,
    user_status: account.status,
    role,
    created_at: existingMember?.created_at || "2026-03-14T11:20:00Z",
    updated_at: "2026-03-14T11:20:00Z"
  };

  state.organizationMembers[orgKey] = existingMember
    ? members.map((member) => (member.user_id === userId ? nextMember : member))
    : [...members, nextMember];

  return nextMember;
}

function updateOrganizationMemberRole(state, orgId, userId, role) {
  const orgKey = String(orgId);
  const members = state.organizationMembers[orgKey] || [];
  let updated = false;

  state.organizationMembers[orgKey] = members.map((member) => {
    if (member.user_id !== userId) {
      return member;
    }
    updated = true;
    return {
      ...member,
      role,
      updated_at: "2026-03-14T11:22:00Z"
    };
  });

  return updated;
}

function removeOrganizationMember(state, orgId, userId) {
  const orgKey = String(orgId);
  const members = state.organizationMembers[orgKey] || [];
  const nextMembers = members.filter((member) => member.user_id !== userId);
  state.organizationMembers[orgKey] = nextMembers;
  return nextMembers.length !== members.length;
}

function filteredModerationCases(state, url) {
  const status = String(url.searchParams.get("status") || "").trim().toLowerCase();
  const targetType = String(url.searchParams.get("target_type") || "").trim().toLowerCase();
  const reasonCode = String(url.searchParams.get("reason_code") || "").trim().toLowerCase();

  const items = state.moderationCases.items.filter((item) => {
    if (status && item.status.toLowerCase() !== status) {
      return false;
    }
    if (targetType && item.target_type.toLowerCase() !== targetType) {
      return false;
    }
    if (reasonCode && !item.reason_code.toLowerCase().includes(reasonCode)) {
      return false;
    }
    return true;
  });

  return { total: items.length, items };
}

export async function handleGovernanceRequest({ method, pathname, url, request, response, state, json, parseJSONBody }) {
  if (method === "GET" && pathname === "/api/v1/admin/apikeys") {
    json(response, 200, filteredAdminAPIKeys(state, url));
    return true;
  }

  if (method === "POST" && pathname === "/api/v1/admin/apikeys") {
    const body = await parseJSONBody(request);
    const ownerUserId = Number(body.owner_user_id || 1) || 1;
    const owner = findAccount(state, ownerUserId) || state.accounts.items[0];
    const id = nextIdentifier(state.adminApiKeys.items);
    const item = {
      id,
      user_id: owner.id,
      created_by: 1,
      owner_username: owner.username,
      name: String(body.name || "New API Key"),
      purpose: String(body.purpose || ""),
      prefix: `adm_live_${String(id).padStart(4, "0")}`,
      scopes: Array.isArray(body.scopes) ? body.scopes.map((scope) => String(scope)) : [],
      status: "active",
      revoked_at: "",
      expires_at: "2026-09-14T11:16:00Z",
      last_rotated_at: "2026-03-14T11:16:00Z",
      last_used_at: "",
      created_at: "2026-03-14T11:16:00Z",
      updated_at: "2026-03-14T11:16:00Z"
    };
    state.adminApiKeys.items.unshift(item);
    state.adminApiKeys.total = state.adminApiKeys.items.length;
    json(response, 200, { item, plaintext_key: "adm_test_created_key" });
    return true;
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/admin\/apikeys\/\d+\/revoke$/)) {
    const keyId = Number(pathname.split("/")[5] || 0);
    state.adminApiKeys.items = state.adminApiKeys.items.map((item) =>
      item.id === keyId
        ? {
            ...item,
            status: "revoked",
            revoked_at: "2026-03-14T11:17:00Z",
            updated_at: "2026-03-14T11:17:00Z"
          }
        : item
    );
    json(response, 200, { ok: true });
    return true;
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/admin\/apikeys\/\d+\/rotate$/)) {
    const keyId = Number(pathname.split("/")[5] || 0);
    let rotatedItem = state.adminApiKeys.items[0] || null;
    state.adminApiKeys.items = state.adminApiKeys.items.map((item) => {
      if (item.id !== keyId) {
        return item;
      }
      rotatedItem = {
        ...item,
        last_rotated_at: "2026-03-14T11:18:00Z",
        updated_at: "2026-03-14T11:18:00Z"
      };
      return rotatedItem;
    });
    json(response, 200, { item: rotatedItem, plaintext_key: "adm_test_rotated_key" });
    return true;
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/admin\/apikeys\/\d+\/scopes$/)) {
    const keyId = Number(pathname.split("/")[5] || 0);
    const body = await parseJSONBody(request);
    state.adminApiKeys.items = state.adminApiKeys.items.map((item) =>
      item.id === keyId
        ? {
            ...item,
            scopes: Array.isArray(body.scopes) ? body.scopes.map((scope) => String(scope)) : item.scopes,
            updated_at: "2026-03-14T11:19:00Z"
          }
        : item
    );
    json(response, 200, { ok: true });
    return true;
  }

  if (method === "GET" && pathname === "/api/v1/admin/organizations") {
    json(response, 200, state.organizations);
    return true;
  }

  if (method === "POST" && pathname === "/api/v1/admin/organizations") {
    const body = await parseJSONBody(request);
    const id = nextIdentifier(state.organizations.items);
    const item = {
      id,
      name: String(body.name || "New Organization"),
      slug: slugify(body.name),
      created_at: "2026-03-14T11:20:00Z",
      updated_at: "2026-03-14T11:20:00Z"
    };
    state.organizations.items.push(item);
    state.organizations.total = state.organizations.items.length;
    state.organizationMembers[String(id)] = state.organizationMembers[String(id)] || [];
    json(response, 200, { item });
    return true;
  }

  if (method === "GET" && pathname.match(/^\/api\/v1\/admin\/organizations\/\d+\/members$/)) {
    const orgId = Number(pathname.split("/")[5] || 0);
    json(response, 200, organizationMembersPayload(state, orgId));
    return true;
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/admin\/organizations\/\d+\/members$/)) {
    const orgId = Number(pathname.split("/")[5] || 0);
    const body = await parseJSONBody(request);
    const member = upsertOrganizationMember(state, orgId, Number(body.user_id || 0), String(body.role || "member"));
    if (!member) {
      json(response, 404, { error: "account_not_found", message: "Target account was not found." });
      return true;
    }
    json(response, 200, { item: member });
    return true;
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/admin\/organizations\/\d+\/members\/\d+\/role$/)) {
    const orgId = Number(pathname.split("/")[5] || 0);
    const userId = Number(pathname.split("/")[7] || 0);
    const body = await parseJSONBody(request);
    const updated = updateOrganizationMemberRole(state, orgId, userId, String(body.role || "member"));
    if (!updated) {
      json(response, 404, { error: "member_not_found", message: "Organization member was not found." });
      return true;
    }
    json(response, 200, { ok: true });
    return true;
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/admin\/organizations\/\d+\/members\/\d+\/remove$/)) {
    const orgId = Number(pathname.split("/")[5] || 0);
    const userId = Number(pathname.split("/")[7] || 0);
    const removed = removeOrganizationMember(state, orgId, userId);
    if (!removed) {
      json(response, 404, { error: "member_not_found", message: "Organization member was not found." });
      return true;
    }
    json(response, 200, { ok: true });
    return true;
  }

  if (method === "GET" && pathname === "/api/v1/admin/integrations") {
    json(response, 200, state.integrations);
    return true;
  }

  if (method === "GET" && pathname === "/api/v1/admin/moderation") {
    json(response, 200, filteredModerationCases(state, url));
    return true;
  }

  if (method === "POST" && pathname === "/api/v1/admin/moderation") {
    const body = await parseJSONBody(request);
    const id = nextIdentifier(state.moderationCases.items);
    const item = {
      id,
      reporter_user_id: Number(body.reporter_user_id || 0) || 0,
      resolver_user_id: 0,
      target_type: String(body.target_type || "skill"),
      skill_id: Number(body.skill_id || 0) || 0,
      comment_id: Number(body.comment_id || 0) || 0,
      reason_code: String(body.reason_code || "unspecified"),
      reason_detail: String(body.reason_detail || ""),
      status: "open",
      action: "none",
      resolution_note: "",
      resolved_at: "",
      created_at: "2026-03-14T11:24:00Z",
      updated_at: "2026-03-14T11:24:00Z"
    };
    state.moderationCases.items.unshift(item);
    state.moderationCases.total = state.moderationCases.items.length;
    json(response, 200, { item });
    return true;
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/admin\/moderation\/\d+\/resolve$/)) {
    const caseId = Number(pathname.split("/")[5] || 0);
    const body = await parseJSONBody(request);
    state.moderationCases.items = state.moderationCases.items.map((item) =>
      item.id === caseId
        ? {
            ...item,
            resolver_user_id: 1,
            status: "resolved",
            action: String(body.action || "flagged"),
            resolution_note: String(body.resolution_note || ""),
            resolved_at: "2026-03-14T11:25:00Z",
            updated_at: "2026-03-14T11:25:00Z"
          }
        : item
    );
    json(response, 200, { ok: true });
    return true;
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/admin\/moderation\/\d+\/reject$/)) {
    const caseId = Number(pathname.split("/")[5] || 0);
    const body = await parseJSONBody(request);
    state.moderationCases.items = state.moderationCases.items.map((item) =>
      item.id === caseId
        ? {
            ...item,
            resolver_user_id: 1,
            status: "rejected",
            action: "rejected",
            resolution_note: String(body.rejection_note || ""),
            resolved_at: "2026-03-14T11:26:00Z",
            updated_at: "2026-03-14T11:26:00Z"
          }
        : item
    );
    json(response, 200, { ok: true });
    return true;
  }

  return false;
}
