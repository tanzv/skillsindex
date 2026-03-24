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

function findAuthProviderConfigDetail(state, provider) {
  return state.authProviderConfigDetails[String(provider).trim().toLowerCase()] || null;
}

function syncAuthProviderInventory(state, provider, detail) {
  state.authProviderConfigs.items = state.authProviderConfigs.items.map((item) =>
    item.key === provider
      ? {
          ...item,
          ...detail,
          provider,
          updated_at: detail.updated_at || "2026-03-14T12:00:00Z"
        }
      : item
  );
}

function upsertAuthProviderConfig(state, body) {
  const provider = String(body.provider || "").trim().toLowerCase();
  if (!provider) {
    return null;
  }

  const existing = findAuthProviderConfigDetail(state, provider) || {
    key: provider,
    provider,
    display_name: provider,
    name: provider,
    management_kind: "oidc",
    configurable: true,
    enabled: false,
    connected: false,
    available: false,
    start_path: "",
    connector_id: 0,
    description: "",
    base_url: "",
    issuer: "",
    authorization_url: "",
    token_url: "",
    userinfo_url: "",
    client_id: "",
    client_secret: "",
    scope: "openid profile email",
    claim_external_id: "sub",
    claim_username: "preferred_username",
    claim_email: "email",
    claim_email_verified: "email_verified",
    claim_groups: "groups",
    offboarding_mode: "disable_only",
    mapping_mode: "external_email_username",
    default_org_id: 0,
    default_org_role: "member",
    default_org_group_rules: "[]",
    default_org_email_domains: "",
    default_user_role: "member"
  };

  const detail = {
    ...existing,
    provider,
    key: provider,
    display_name: String(body.name || existing.display_name || provider),
    name: String(body.name || existing.name || provider),
    management_kind: "oidc",
    configurable: true,
    enabled: true,
    connected: true,
    available: true,
    start_path: `/auth/sso/start/${provider}`,
    connector_id: Number(existing.connector_id || 0) || Number(nextIdentifier(state.authProviderConfigs.items)),
    description: String(body.description || existing.description || ""),
    base_url: String(body.issuer || existing.base_url || ""),
    issuer: String(body.issuer || existing.issuer || ""),
    authorization_url: String(body.authorization_url || existing.authorization_url || ""),
    token_url: String(body.token_url || existing.token_url || ""),
    userinfo_url: String(body.userinfo_url || existing.userinfo_url || ""),
    client_id: String(body.client_id || existing.client_id || ""),
    client_secret: String(body.client_secret || existing.client_secret || ""),
    scope: String(body.scope || existing.scope || "openid profile email"),
    claim_external_id: String(body.claim_external_id || existing.claim_external_id || "sub"),
    claim_username: String(body.claim_username || existing.claim_username || "preferred_username"),
    claim_email: String(body.claim_email || existing.claim_email || "email"),
    claim_email_verified: String(body.claim_email_verified || existing.claim_email_verified || "email_verified"),
    claim_groups: String(body.claim_groups || existing.claim_groups || "groups"),
    offboarding_mode: String(body.offboarding_mode || existing.offboarding_mode || "disable_only"),
    mapping_mode: String(body.mapping_mode || existing.mapping_mode || "external_email_username"),
    default_org_id: Number(body.default_org_id || existing.default_org_id || 0),
    default_org_role: String(body.default_org_role || existing.default_org_role || "member"),
    default_org_group_rules: String(body.default_org_group_rules || existing.default_org_group_rules || "[]"),
    default_org_email_domains: String(body.default_org_email_domains || existing.default_org_email_domains || ""),
    default_user_role: String(body.default_user_role || existing.default_user_role || "member"),
    updated_at: "2026-03-14T12:00:00Z"
  };

  state.authProviderConfigDetails[provider] = detail;
  syncAuthProviderInventory(state, provider, detail);
  return detail;
}

function disableAuthProviderConfig(state, provider) {
  const detail = findAuthProviderConfigDetail(state, provider);
  if (!detail) {
    return null;
  }

  const disabledDetail = {
    ...detail,
    enabled: false,
    connected: false,
    available: false,
    start_path: "",
    updated_at: "2026-03-14T12:02:00Z"
  };
  state.authProviderConfigDetails[provider] = disabledDetail;
  syncAuthProviderInventory(state, provider, disabledDetail);
  return disabledDetail;
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

  if (method === "GET" && pathname === "/api/v1/admin/auth-provider-configs") {
    json(response, 200, state.authProviderConfigs);
    return true;
  }

  if (method === "GET" && pathname.match(/^\/api\/v1\/admin\/auth-provider-configs\/[a-z0-9_-]+$/)) {
    const provider = String(pathname.split("/")[5] || "").trim().toLowerCase();
    const detail = findAuthProviderConfigDetail(state, provider);
    if (!detail) {
      json(response, 404, { error: "provider_not_found", message: "Provider was not found." });
      return true;
    }
    json(response, 200, { item: detail });
    return true;
  }

  if (method === "POST" && pathname === "/api/v1/admin/auth-provider-configs") {
    const body = await parseJSONBody(request);
    const detail = upsertAuthProviderConfig(state, body);
    if (!detail) {
      json(response, 400, { error: "provider_required", message: "Provider is required." });
      return true;
    }
    json(response, 201, { ok: true, item: detail });
    return true;
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/admin\/auth-provider-configs\/[a-z0-9_-]+\/disable$/)) {
    const provider = String(pathname.split("/")[5] || "").trim().toLowerCase();
    const detail = disableAuthProviderConfig(state, provider);
    if (!detail) {
      json(response, 404, { error: "provider_not_found", message: "Provider was not found." });
      return true;
    }
    json(response, 200, { ok: true, item: detail });
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
