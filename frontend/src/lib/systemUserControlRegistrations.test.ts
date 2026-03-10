import { describe, expect, it, vi } from "vitest";

import { createGlobalUserControlService } from "./globalUserControlService";
import { createSystemUserControlRegistrations } from "./systemUserControlRegistrations";

describe("systemUserControlRegistrations", () => {
  it("builds ordered account actions between preferences and session sections", () => {
    const service = createGlobalUserControlService({
      locale: "en",
      themeMode: "dark",
      registrations: createSystemUserControlRegistrations({
        onNavigate: () => undefined,
        currentPath: "/workspace"
      })
    });

    expect(service.sections.map((section) => section.id)).toEqual(["preferences", "account", "session"]);
    expect(service.sections[1]?.items.map((item) => item.key)).toEqual([
      "account-center",
      "account-security",
      "account-sessions"
    ]);
  });

  it("marks the matching account route as active across prefixed paths", () => {
    const service = createGlobalUserControlService({
      locale: "en",
      themeMode: "light",
      registrations: createSystemUserControlRegistrations({
        onNavigate: () => undefined,
        currentPath: "/light/account/security"
      })
    });

    const accountSection = service.sections.find((section) => section.id === "account");
    const actionStates = accountSection?.items.map((item) => ({
      key: item.key,
      active: item.kind === "action" ? Boolean(item.active) : false
    }));

    expect(actionStates).toEqual([
      { key: "account-center", active: false },
      { key: "account-security", active: true },
      { key: "account-sessions", active: false }
    ]);
  });

  it("navigates to account routes when registered actions execute", async () => {
    const onNavigate = vi.fn();
    const service = createGlobalUserControlService({
      locale: "en",
      themeMode: "dark",
      registrations: createSystemUserControlRegistrations({
        onNavigate,
        currentPath: "/workspace"
      })
    });

    const accountSection = service.sections.find((section) => section.id === "account");
    const actionItems = accountSection?.items.filter((item) => item.kind === "action") || [];

    for (const actionItem of actionItems) {
      await actionItem.execute();
    }

    expect(onNavigate).toHaveBeenNthCalledWith(1, "/account/profile");
    expect(onNavigate).toHaveBeenNthCalledWith(2, "/account/security");
    expect(onNavigate).toHaveBeenNthCalledWith(3, "/account/sessions");
  });
});
