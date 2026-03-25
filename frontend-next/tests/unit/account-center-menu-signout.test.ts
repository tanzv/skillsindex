import { describe, expect, it, vi } from "vitest";

import { performAccountMenuSignOut } from "@/src/components/shared/accountCenterMenuSignOut";

describe("accountCenterMenuSignOut", () => {
  it("returns a safe error message when the logout request fails", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "not_found", message: "Mock endpoint not found." }), {
        status: 404,
        headers: { "content-type": "application/json" }
      })
    );

    await expect(
      performAccountMenuSignOut({
        fetchImpl,
        logoutErrorMessage: "Unable to sign out right now. Try again."
      })
    ).resolves.toEqual({
      ok: false,
      errorMessage: "The requested resource could not be found."
    });
  });

  it("returns a success result when the logout request succeeds", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );

    await expect(
      performAccountMenuSignOut({
        fetchImpl,
        logoutErrorMessage: "Unable to sign out right now. Try again."
      })
    ).resolves.toEqual({
      ok: true
    });
  });

  it("falls back to the safe logout error message when the request throws", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("socket hang up"));

    await expect(
      performAccountMenuSignOut({
        fetchImpl,
        logoutErrorMessage: "Unable to sign out right now. Try again."
      })
    ).resolves.toEqual({
      ok: false,
      errorMessage: "Unable to sign out right now. Try again."
    });
  });
});
