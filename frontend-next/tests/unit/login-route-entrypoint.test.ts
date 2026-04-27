import { describe, expect, it } from "vitest";
import { expectRouteEntrypoint } from "./routeEntrypointTestUtils";

describe("login route entrypoint", () => {
  it("keeps the login page as a thin wrapper around the shared login route helper", () => {
    const routeSource = expectRouteEntrypoint("app/login/page.tsx", {
      requiredSnippets: [
        'from "@/src/features/auth/renderLoginRoute"',
        'import styles from "./LoginPageRoute.module.scss";',
        "await renderLoginRoute(searchParams)"
      ],
      forbiddenSnippets: [
        'from "next/headers"',
        'from "next/navigation"',
        "getServerSessionContext",
        "cookies()",
        "headers()",
        "redirect("
      ]
    });

    expect(routeSource).toContain("styles.page");
  });
});
