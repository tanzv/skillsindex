import { describe, expect, it, vi } from "vitest";

import { normalizeSessionContext, type RawSessionContext } from "@/src/lib/schemas/session";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { serverFetchJSON } from "@/src/lib/http/serverFetch";

describe("session adapters", () => {
  it("normalizes session payloads and defaults marketplace access to true", () => {
    const payload: RawSessionContext = {
      user: {
        id: 7,
        username: "admin.user",
        display_name: "Admin User",
        role: "super_admin",
        status: "active"
      }
    };

    expect(normalizeSessionContext(payload)).toEqual({
      user: {
        id: 7,
        username: "admin.user",
        displayName: "Admin User",
        role: "super_admin",
        status: "active"
      },
      marketplacePublicAccess: true
    });
  });

  it("forwards cookies and injects CSRF tokens for mutating server requests", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );

    await serverFetchJSON<{ ok: boolean }>("/api/v1/auth/logout", {
      method: "POST",
      requestHeaders: new Headers({
        cookie: "session_id=abc; csrf_token=csrf-123"
      }),
      fetchImpl,
      backendBaseURL: "http://localhost:8080"
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);

    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);

    expect(headers.get("cookie")).toBe("session_id=abc; csrf_token=csrf-123");
    expect(headers.get("x-csrf-token")).toBe("csrf-123");
  });

  it("uses include credentials and JSON defaults for client requests", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user: null, marketplace_public_access: true }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );

    await clientFetchJSON("/api/bff/session", {
      method: "POST",
      body: { ping: true },
      fetchImpl
    });

    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);

    expect(init.credentials).toBe("include");
    expect(headers.get("accept")).toBe("application/json");
    expect(headers.get("content-type")).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ ping: true }));
  });

  it("maps client and server request failures into the same error shape", async () => {
    const clientFetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "unauthorized", message: "Denied" }), {
        status: 403,
        headers: { "content-type": "application/json" }
      })
    );
    const serverFetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "unauthorized", message: "Denied" }), {
        status: 403,
        headers: { "content-type": "application/json" }
      })
    );

    await expect(
      clientFetchJSON("/api/bff/session", {
        fetchImpl: clientFetchImpl
      })
    ).rejects.toMatchObject({
      code: "unauthorized",
      message: "Denied",
      status: 403
    });

    await expect(
      serverFetchJSON("/api/v1/auth/me", {
        requestHeaders: new Headers(),
        fetchImpl: serverFetchImpl,
        backendBaseURL: "http://localhost:8080"
      })
    ).rejects.toMatchObject({
      code: "unauthorized",
      message: "Denied",
      status: 403
    });
  });
});
