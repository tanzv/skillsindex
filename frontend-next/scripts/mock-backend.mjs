import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { URL } from "node:url";
import { createInitialMockState } from "./mock-backend-data.mjs";
import { handleGovernanceRequest } from "./mock-backend-governance.mjs";
import { handleOpsRequest } from "./mock-backend-ops.mjs";
import { handlePublicRequest } from "./mock-backend-public.mjs";

const port = Number(process.env.MOCK_BACKEND_PORT || 3301);
const sessionCookieValue = "mock-admin-session";
const csrfCookieValue = "mock-csrf-token";

function createInitialState() {
  return createInitialMockState();
}

let state = createInitialState();

export function resetMockState() {
  state = createInitialState();
}

function updateAccount(userId, patch) {
  state.accounts.items = state.accounts.items.map((account) =>
    account.id === userId
      ? {
          ...account,
          ...patch,
          updated_at: "2026-03-14T11:00:00Z"
        }
      : account
  );
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

async function parseJSONBody(request) {
  const body = await readBody(request);
  const bodyText = String(body || "").trim();

  if (!bodyText) {
    return {};
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    return {};
  }
}

function parseCookies(cookieHeader) {
  return new Map(
    String(cookieHeader || "")
      .split(";")
      .map((segment) => segment.trim())
      .filter(Boolean)
      .map((segment) => {
        const index = segment.indexOf("=");
        if (index < 0) {
          return [segment, ""];
        }
        return [segment.slice(0, index), segment.slice(index + 1)];
      })
  );
}

function isAuthenticated(request) {
  const cookies = parseCookies(request.headers.cookie);
  return cookies.get("skillsindex_session") === sessionCookieValue;
}

function buildPublicAuthProvidersPayload(currentState) {
  const inventory = Array.isArray(currentState.authProviderConfigs?.items) ? currentState.authProviderConfigs.items : [];
  const items = inventory
    .filter((item) => Boolean(item.enabled) && Boolean(item.connected) && Boolean(item.available) && String(item.start_path || "").trim())
    .map((item) => ({
      key: String(item.key || ""),
      start_path: String(item.start_path || ""),
      label: `Continue with ${String(item.display_name || item.key || "Provider")}`
    }));

  return {
    ok: true,
    auth_providers: items.map((item) => item.key),
    items
  };
}

function json(response, status, payload, extraHeaders = {}) {
  response.writeHead(status, {
    "content-type": "application/json",
    ...extraHeaders
  });
  response.end(JSON.stringify(payload));
}

function notFound(response) {
  json(response, 404, { error: "not_found", message: "Mock endpoint not found." });
}

function unauthorized(response) {
  json(response, 401, { error: "unauthorized", message: "Authentication is required." });
}

function includesKeyword(values, keyword) {
  if (!keyword) {
    return true;
  }
  return values.some((value) => String(value || "").toLowerCase().includes(keyword));
}

function applyLimit(items, url) {
  const limit = Number(url.searchParams.get("limit") || 0);
  if (!Number.isFinite(limit) || limit <= 0) {
    return items;
  }
  return items.slice(0, limit);
}

function filteredSkills(url) {
  const keyword = (url.searchParams.get("q") || "").trim().toLowerCase();
  const source = (url.searchParams.get("source") || "").trim().toLowerCase();
  const visibility = (url.searchParams.get("visibility") || "").trim().toLowerCase();

  const items = state.skills.filter((item) => {
    if (source && String(item.source_type || "").toLowerCase() !== source) {
      return false;
    }
    if (visibility && String(item.visibility || "").toLowerCase() !== visibility) {
      return false;
    }
    return includesKeyword(
      [item.name, item.description, item.category, item.subcategory, item.owner_username, ...(item.tags || [])],
      keyword
    );
  });

  const limitedItems = applyLimit(items, url);
  return { total: items.length, items: limitedItems };
}

function filteredJobs(url) {
  const keyword = (url.searchParams.get("q") || "").trim().toLowerCase();
  const status = (url.searchParams.get("status") || "").trim().toLowerCase();
  const jobType = (url.searchParams.get("job_type") || "").trim().toLowerCase();

  const items = state.jobs.items.filter((item) => {
    if (status && String(item.status || "").toLowerCase() !== status) {
      return false;
    }
    if (jobType && String(item.job_type || "").toLowerCase() !== jobType) {
      return false;
    }
    return includesKeyword(
      [item.job_type, item.status, item.error_message, String(item.target_skill_id || ""), String(item.owner_user_id || ""), String(item.actor_user_id || "")],
      keyword
    );
  });

  const limitedItems = applyLimit(items, url);
  return { total: items.length, items: limitedItems };
}

function filteredSyncRuns(url) {
  const limitedItems = applyLimit(state.syncRuns.items, url);
  return { total: state.syncRuns.total, items: limitedItems };
}

function createMockBackendServer() {
  return createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || `127.0.0.1:${port}`}`);
    const pathname = url.pathname;
    const method = request.method || "GET";

    if (method === "GET" && pathname === "/api/v1/auth/csrf") {
      return json(
        response,
        200,
        { csrf_token: csrfCookieValue },
        { "set-cookie": `skillsindex_csrf=${csrfCookieValue}; Path=/; HttpOnly` }
      );
    }

    if (method === "POST" && pathname === "/__mock/reset") {
      resetMockState();
      return json(response, 200, { ok: true });
    }

    if (method === "POST" && pathname === "/api/v1/auth/login") {
      const body = await parseJSONBody(request);
      if (body.username !== "admin" || body.password !== "Admin123456!") {
        return json(response, 401, { error: "invalid_credentials", message: "Invalid credentials." });
      }
      return json(
        response,
        200,
        { ok: true, user: { id: 1, username: "admin" } },
        { "set-cookie": `skillsindex_session=${sessionCookieValue}; Path=/; HttpOnly` }
      );
    }

    if (method === "GET" && pathname === "/api/v1/auth/me") {
      if (!isAuthenticated(request)) {
        return unauthorized(response);
      }
      return json(response, 200, {
        user: state.profile.user,
        marketplace_public_access: true
      });
    }

    if (method === "GET" && pathname === "/api/v1/auth/providers") {
      return json(response, 200, buildPublicAuthProvidersPayload(state));
    }

    if (
      await handlePublicRequest({
        method,
        pathname,
        url,
        request,
        response,
        state,
        json,
        parseJSONBody,
        sessionUser: isAuthenticated(request) ? state.profile.user : null
      })
    ) {
      return;
    }

    if (!isAuthenticated(request)) {
      return unauthorized(response);
    }

  if (method === "GET" && pathname === "/api/v1/account/profile") {
    return json(response, 200, state.profile);
  }

  if (method === "POST" && pathname === "/api/v1/account/profile") {
    const body = await parseJSONBody(request);
    state.profile.profile.display_name = String(body.display_name || state.profile.profile.display_name);
    state.profile.profile.avatar_url = String(body.avatar_url || state.profile.profile.avatar_url);
    state.profile.profile.bio = String(body.bio || state.profile.profile.bio);
    state.profile.user.display_name = state.profile.profile.display_name || state.profile.user.display_name;
    return json(response, 200, state.profile);
  }

  if (method === "POST" && pathname === "/api/v1/account/security/password") {
    return json(response, 200, { ok: true });
  }

  if (method === "GET" && pathname === "/api/v1/account/sessions") {
    return json(response, 200, state.sessions);
  }

  if (method === "POST" && pathname === "/api/v1/account/sessions/revoke-others") {
    state.sessions.items = state.sessions.items.filter((item) => item.is_current);
    state.sessions.total = state.sessions.items.length;
    return json(response, 200, state.sessions);
  }

  if (method === "POST" && pathname.startsWith("/api/v1/account/sessions/") && pathname.endsWith("/revoke")) {
    const sessionId = decodeURIComponent(pathname.split("/")[5] || "");
    state.sessions.items = state.sessions.items.filter((item) => item.session_id !== sessionId);
    state.sessions.total = state.sessions.items.length;
    return json(response, 200, state.sessions);
  }

  if (method === "GET" && pathname === "/api/v1/account/apikeys") {
    return json(response, 200, state.credentials);
  }

  if (method === "POST" && pathname === "/api/v1/account/apikeys") {
    const body = await parseJSONBody(request);
    const id = Date.now();
    const item = {
      id,
      name: String(body.name || "New Credential"),
      purpose: String(body.purpose || ""),
      prefix: `sk_live_${String(id).slice(-4)}`,
      scopes: Array.isArray(body.scopes) ? body.scopes : [],
      status: "active",
      created_at: "2026-03-14T10:30:00Z",
      updated_at: "2026-03-14T10:30:00Z",
      last_used_at: null
    };
    state.credentials.items.unshift(item);
    state.credentials.total = state.credentials.items.length;
    return json(response, 200, { item, plaintext_key: "sk_test_created_key" });
  }

  if (method === "POST" && pathname.startsWith("/api/v1/account/apikeys/") && pathname.endsWith("/rotate")) {
    const keyId = Number(pathname.split("/")[5] || 0);
    const item = state.credentials.items.find((entry) => entry.id === keyId) || state.credentials.items[0];
    return json(response, 200, { item, plaintext_key: "sk_test_rotated_key" });
  }

  if (method === "POST" && pathname.startsWith("/api/v1/account/apikeys/") && pathname.endsWith("/revoke")) {
    const keyId = Number(pathname.split("/")[5] || 0);
    state.credentials.items = state.credentials.items.map((item) => (item.id === keyId ? { ...item, status: "revoked" } : item));
    return json(response, 200, { ok: true });
  }

  if (method === "POST" && pathname.startsWith("/api/v1/account/apikeys/") && pathname.endsWith("/scopes")) {
    const keyId = Number(pathname.split("/")[5] || 0);
    const body = await parseJSONBody(request);
    state.credentials.items = state.credentials.items.map((item) => (item.id === keyId ? { ...item, scopes: Array.isArray(body.scopes) ? body.scopes : item.scopes } : item));
    return json(response, 200, { ok: true });
  }

  if (method === "GET" && pathname === "/api/v1/admin/overview") {
    const publicCount = state.skills.filter((item) => item.visibility === "public").length;
    const privateCount = state.skills.length - publicCount;
    return json(response, 200, {
      counts: {
        total: state.skills.length,
        public: publicCount,
        private: privateCount,
        syncable: state.skills.filter((item) => item.source_type === "repository").length,
        org_count: 2,
        account_count: state.accounts.total
      },
      capabilities: {
        can_manage_users: true,
        can_view_all: true
      }
    });
  }

  if (method === "GET" && pathname === "/api/v1/admin/accounts") {
    return json(response, 200, state.accounts);
  }

  if (method === "GET" && pathname === "/api/v1/admin/settings/registration") {
    return json(response, 200, state.registration);
  }

  if (method === "POST" && pathname === "/api/v1/admin/settings/registration") {
    const body = await parseJSONBody(request);
    state.registration = {
      allow_registration: Boolean(body.allow_registration),
      marketplace_public_access: Boolean(body.marketplace_public_access)
    };
    return json(response, 200, state.registration);
  }

  if (method === "GET" && pathname === "/api/v1/admin/settings/marketplace-ranking") {
    return json(response, 200, state.marketplaceRanking);
  }

  if (method === "POST" && pathname === "/api/v1/admin/settings/marketplace-ranking") {
    const body = await parseJSONBody(request);
    state.marketplaceRanking = {
      default_sort: String(body.default_sort || state.marketplaceRanking.default_sort) === "quality" ? "quality" : "stars",
      ranking_limit: Number(body.ranking_limit) || state.marketplaceRanking.ranking_limit,
      highlight_limit: Number(body.highlight_limit) || state.marketplaceRanking.highlight_limit,
      category_leader_limit: Number(body.category_leader_limit) || state.marketplaceRanking.category_leader_limit
    };
    return json(response, 200, state.marketplaceRanking);
  }

  if (method === "GET" && pathname === "/api/v1/admin/settings/category-catalog") {
    return json(response, 200, state.categoryCatalog);
  }

  if (method === "POST" && pathname === "/api/v1/admin/settings/category-catalog") {
    const body = await parseJSONBody(request);
    state.categoryCatalog = {
      items: Array.isArray(body.items) ? body.items : state.categoryCatalog.items
    };
    return json(response, 200, state.categoryCatalog);
  }

  if (method === "GET" && pathname === "/api/v1/admin/settings/presentation-taxonomy") {
    return json(response, 200, state.presentationTaxonomy);
  }

  if (method === "POST" && pathname === "/api/v1/admin/settings/presentation-taxonomy") {
    const body = await parseJSONBody(request);
    state.presentationTaxonomy = {
      items: Array.isArray(body.items) ? body.items : state.presentationTaxonomy.items
    };
    return json(response, 200, state.presentationTaxonomy);
  }

  if (method === "GET" && pathname === "/api/v1/admin/settings/auth-providers") {
    return json(response, 200, state.authProviders);
  }

  if (method === "POST" && pathname === "/api/v1/admin/settings/auth-providers") {
    const body = await parseJSONBody(request);
    state.authProviders = {
      ...state.authProviders,
      auth_providers: Array.isArray(body.auth_providers) ? body.auth_providers.map((item) => String(item)) : state.authProviders.auth_providers
    };
    return json(response, 200, state.authProviders);
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/admin\/accounts\/\d+\/status$/)) {
    const userId = Number(pathname.split("/")[5] || 0);
    const body = await parseJSONBody(request);
    updateAccount(userId, { status: String(body.status || "active") });
    return json(response, 200, { ok: true });
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/admin\/accounts\/\d+\/force-signout$/)) {
    const userId = Number(pathname.split("/")[5] || 0);
    updateAccount(userId, { force_logout_at: "2026-03-14T11:05:00Z" });
    return json(response, 200, { ok: true });
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/admin\/accounts\/\d+\/password-reset$/)) {
    return json(response, 200, { ok: true });
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/admin\/users\/\d+\/role$/)) {
    const userId = Number(pathname.split("/")[5] || 0);
    const body = await parseJSONBody(request);
    updateAccount(userId, { role: String(body.role || "member") });
    return json(response, 200, { ok: true });
  }

  if (await handleGovernanceRequest({ method, pathname, url, request, response, state, json, parseJSONBody })) {
    return;
  }

  if (await handleOpsRequest({ method, pathname, url, request, response, state, json, parseJSONBody })) {
    return;
  }

  if (method === "GET" && pathname === "/api/v1/admin/skills") {
    return json(response, 200, filteredSkills(url));
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/admin\/skills\/\d+\/sync$/)) {
    const skillId = Number(pathname.split("/")[5] || 0);
    state.skills = state.skills.map((item) =>
      item.id === skillId
        ? {
            ...item,
            quality_score: Number((item.quality_score + 0.4).toFixed(1)),
            updated_at: "2026-03-14T11:20:00Z"
          }
        : item
    );
    return json(response, 200, { ok: true });
  }

  if (method === "POST" && pathname === "/api/v1/admin/ingestion/manual") {
    const body = await parseJSONBody(request);
    const item = {
      id: Date.now(),
      name: String(body.name || "Manual Skill"),
      description: String(body.description || ""),
      category: "operations",
      source_type: "manual",
      visibility: String(body.visibility || "private"),
      owner_username: "admin",
      updated_at: "2026-03-14T10:45:00Z",
      star_count: 0,
      quality_score: 8.0
    };
    state.skills.unshift(item);
    return json(response, 201, { status: "created", message: "Manual skill created", item });
  }

  if (method === "POST" && pathname === "/api/v1/admin/ingestion/repository") {
    return json(response, 201, { status: "created", message: "Repository skill synced" });
  }

  if (method === "POST" && pathname === "/api/v1/admin/ingestion/upload") {
    return json(response, 201, { status: "created", message: "Archive skill imported" });
  }

  if (method === "POST" && pathname === "/api/v1/admin/ingestion/skillmp") {
    return json(response, 201, { status: "created", message: "SkillMP skill imported" });
  }

  if (method === "GET" && pathname === "/api/v1/admin/sync-policy/repository") {
    return json(response, 200, state.syncPolicy);
  }

  if (method === "POST" && pathname === "/api/v1/admin/sync-policy/repository") {
    const body = await parseJSONBody(request);
    state.syncPolicy = {
      enabled: Boolean(body.enabled),
      interval: String(body.interval || state.syncPolicy.interval),
      timeout: String(body.timeout || state.syncPolicy.timeout),
      batch_size: Number(body.batch_size || state.syncPolicy.batch_size)
    };
    return json(response, 200, state.syncPolicy);
  }

  if (method === "GET" && pathname === "/api/v1/admin/sync-jobs") {
    return json(response, 200, filteredSyncRuns(url));
  }

  if (method === "GET" && pathname === "/api/v1/admin/jobs") {
    return json(response, 200, filteredJobs(url));
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/admin\/jobs\/\d+\/retry$/)) {
    const jobId = Number(pathname.split("/")[5] || 0);
    state.jobs.items = state.jobs.items.map((item) => (item.id === jobId ? { ...item, status: "pending", updated_at: "2026-03-14T11:10:00Z" } : item));
    return json(response, 200, { ok: true });
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/admin\/jobs\/\d+\/cancel$/)) {
    const jobId = Number(pathname.split("/")[5] || 0);
    state.jobs.items = state.jobs.items.map((item) => (item.id === jobId ? { ...item, status: "canceled", updated_at: "2026-03-14T11:12:00Z" } : item));
    return json(response, 200, { ok: true });
  }

  if (method === "GET" && pathname === "/api/v1/admin/ops/metrics") {
    return json(response, 200, {
      item: {
        open_incidents: 1,
        pending_moderation_cases: 2,
        unresolved_jobs: 1,
        failed_sync_runs_24h: 1,
        disabled_accounts: 1,
        stale_integrations: 0,
        total_audit_logs_24h: 42,
        total_sync_runs_24h: 7,
        retention_days: 180
      }
    });
  }

  if (method === "GET" && pathname === "/api/v1/admin/ops/alerts") {
    return json(response, 200, {
      total: 3,
      items: [
        { code: "sync_failures", severity: "critical", message: "Repository sync failures exceeded the alert threshold.", triggered: true },
        { code: "moderation_backlog", severity: "warning", message: "Moderation backlog is growing faster than review throughput.", triggered: true },
        { code: "integration_heartbeat", severity: "normal", message: "Connector heartbeat remains within expected latency.", triggered: false }
      ]
    });
  }

  if (method === "GET" && pathname === "/api/v1/admin/ops/release-gates") {
    return json(response, 200, {
      item: {
        generated_at: "2026-03-14T10:20:00Z",
        passed: false,
        checks: [
          { code: "queue_stability", severity: "warning", message: "Queue pressure remains above the preferred threshold.", passed: false },
          { code: "audit_retention", severity: "passed", message: "Audit retention policy is satisfied.", passed: true },
          { code: "sync_recovery", severity: "passed", message: "Import recovery coverage is available for recent failures.", passed: true }
        ]
      }
    });
  }

  if (method === "POST" && pathname === "/api/v1/admin/ops/release-gates/run") {
    return json(response, 200, {
      item: {
        generated_at: "2026-03-14T11:15:00Z",
        passed: false,
        checks: [
          { code: "queue_stability", severity: "warning", message: "Queue pressure remains above the preferred threshold.", passed: false },
          { code: "audit_retention", severity: "passed", message: "Audit retention policy is satisfied.", passed: true },
          { code: "sync_recovery", severity: "passed", message: "Import recovery coverage is available for recent failures.", passed: true }
        ]
      }
    });
  }

    notFound(response);
  } catch (error) {
    json(response, 500, {
      error: "mock_backend_error",
      message: error instanceof Error ? error.message : "Mock backend failed to handle the request."
    });
  }
  });
}

export function startMockBackend({ listenPort = port, host = "127.0.0.1", onReady } = {}) {
  resetMockState();
  const server = createMockBackendServer();

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(listenPort, host, () => {
      if (typeof onReady === "function") {
        const address = server.address();
        const resolvedAddress = typeof address === "string" ? address : `http://${host}:${address?.port ?? listenPort}`;
        onReady(resolvedAddress);
      }
      resolve(server);
    });
  });
}

const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectExecution) {
  startMockBackend({
    listenPort: port,
    onReady: (address) => {
      process.stdout.write(`Mock backend listening on ${address}\n`);
    }
  }).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack || error.message : String(error)}\n`);
    process.exit(1);
  });
}
