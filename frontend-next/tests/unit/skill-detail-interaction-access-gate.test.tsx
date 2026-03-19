import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SkillDetailInteractionAccessGate } from "@/src/features/public/skill-detail/SkillDetailInteractionAccessGate";

vi.mock("next/link", () => ({
  default: ({
    href,
    as,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    as?: string;
    children: ReactNode;
  }) => createElement("a", { href, "data-as": as, ...props }, children)
}));

describe("SkillDetailInteractionAccessGate", () => {
  it("uses the provided workspace target for authenticated viewers", () => {
    const markup = renderToStaticMarkup(
      createElement(SkillDetailInteractionAccessGate, {
        isAuthenticated: true,
        loginTarget: { href: "/login" },
        signInLabel: "Sign In",
        workspaceHref: "/workspace?from=detail",
        workspaceLabel: "Workspace"
      })
    );

    expect(markup).toContain('href="/workspace?from=detail"');
    expect(markup).toContain("Workspace");
  });

  it("uses the login target for guests", () => {
    const markup = renderToStaticMarkup(
      createElement(SkillDetailInteractionAccessGate, {
        isAuthenticated: false,
        loginTarget: { href: "/login?redirect=%2Fskills%2F13", as: "/login" },
        signInLabel: "Sign In",
        workspaceHref: "/workspace",
        workspaceLabel: "Workspace"
      })
    );

    expect(markup).toContain('href="/login?redirect=%2Fskills%2F13"');
    expect(markup).toContain('data-as="/login"');
    expect(markup).toContain("Sign In");
  });
});
