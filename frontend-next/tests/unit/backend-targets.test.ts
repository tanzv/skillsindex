import { describe, expect, it, vi } from "vitest";

import { defaultBackendBaseURL, fetchBackend, resolveBackendRequestTargets } from "@/src/lib/http/backend";

function createConnectionRefusedError(): TypeError {
  const error = new TypeError("fetch failed") as TypeError & {
    cause?: {
      code?: string;
    };
  };
  error.cause = {
    code: "ECONNREFUSED"
  };
  return error;
}

describe("backend request targets", () => {
  it("adds the default local backend as a fallback for alternate loopback targets", () => {
    expect(resolveBackendRequestTargets("http://127.0.0.1:3301")).toEqual([
      "http://127.0.0.1:3301",
      defaultBackendBaseURL
    ]);

    expect(resolveBackendRequestTargets(defaultBackendBaseURL)).toEqual([defaultBackendBaseURL]);
    expect(resolveBackendRequestTargets("https://api.skillsindex.dev")).toEqual(["https://api.skillsindex.dev"]);
  });

  it("retries once against the default local backend after a loopback connection refusal", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(createConnectionRefusedError())
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        })
      );

    const response = await fetchBackend(
      "/api/v1/auth/csrf",
      {
        method: "GET",
        headers: new Headers({
          accept: "application/json"
        })
      },
      {
        backendBaseURL: "http://127.0.0.1:3301",
        fetchImpl
      }
    );

    expect(response.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[0]?.[0]).toBe("http://127.0.0.1:3301/api/v1/auth/csrf");
    expect(fetchImpl.mock.calls[1]?.[0]).toBe(`${defaultBackendBaseURL}/api/v1/auth/csrf`);
  });

  it("does not retry remote backends when the primary target is unavailable", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValueOnce(createConnectionRefusedError());

    await expect(
      fetchBackend(
        "/api/v1/auth/csrf",
        {
          method: "GET"
        },
        {
          backendBaseURL: "https://api.skillsindex.dev",
          fetchImpl
        }
      )
    ).rejects.toThrow("fetch failed");

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0]?.[0]).toBe("https://api.skillsindex.dev/api/v1/auth/csrf");
  });
});
