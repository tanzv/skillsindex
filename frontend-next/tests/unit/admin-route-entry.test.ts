import { beforeEach, describe, expect, it, vi } from "vitest";

const guardAdminPageRoute = vi.fn();
const renderAdminRoute = vi.fn();

vi.mock("@/src/features/admin/guardAdminPageRoute", () => ({
  guardAdminPageRoute
}));

vi.mock("@/src/features/admin/renderAdminRoute", () => ({
  renderAdminRoute
}));

describe("admin route entry", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    renderAdminRoute.mockResolvedValue("rendered-route");
  });

  it("guards the exact route path before rendering the admin page", async () => {
    const { renderAdminPageRoute } = await import("@/src/features/admin/adminRouteEntry");

    await expect(renderAdminPageRoute("/admin/accounts")).resolves.toBe("rendered-route");

    expect(guardAdminPageRoute).toHaveBeenCalledWith("/admin/accounts");
    expect(renderAdminRoute).toHaveBeenCalledWith("/admin/accounts", {});
  });
});
