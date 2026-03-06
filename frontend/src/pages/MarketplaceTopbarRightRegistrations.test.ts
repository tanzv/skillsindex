import { describe, expect, it, vi } from "vitest";
import {
  buildMarketplaceTopbarRightRegistrations,
  buildMarketplaceWorkspaceAuthRightRegistrations,
  buildMarketplaceWorkspaceAccessRightRegistrations
} from "./MarketplaceTopbarRightRegistrations";

describe("buildMarketplaceTopbarRightRegistrations", () => {
  it("registers dark status and action entries with stable order", () => {
    const onSecondary = vi.fn();
    const onPrimary = vi.fn();

    const registrations = buildMarketplaceTopbarRightRegistrations({
      statusLabel: "Signed in",
      secondaryCtaLabel: "Workspace",
      onSecondaryCtaClick: onSecondary,
      ctaLabel: "Sign In",
      onCtaClick: onPrimary
    });

    expect(registrations.map((item) => item.key)).toEqual(["dark-status", "dark-secondary-cta", "dark-cta"]);
    expect(registrations.map((item) => item.order)).toEqual([10, 30, 40]);
    expect(registrations.map((item) => item.slot)).toEqual(["dark", "dark", "dark"]);
  });

  it("ignores empty status and incomplete action configurations", () => {
    const registrations = buildMarketplaceTopbarRightRegistrations({
      statusLabel: " ",
      secondaryCtaLabel: " ",
      ctaLabel: "Sign In"
    });

    expect(registrations).toHaveLength(0);
  });

  it("builds workspace access registrations with session-aware CTA path", () => {
    const onNavigate = vi.fn();

    const signedInRegistrations = buildMarketplaceWorkspaceAccessRightRegistrations({
      sessionUser: {
        id: 1,
        username: "alice",
        display_name: "Alice",
        role: "owner",
        status: "active"
      },
      signedInLabel: "Signed in",
      signedOutLabel: "Guest mode",
      workspaceLabel: "Open Workspace",
      signInLabel: "Sign In",
      onNavigate,
      toPublicPath: (path: string) => `/light${path}`
    });

    expect(signedInRegistrations.map((item) => item.key)).toEqual(["dark-status", "dark-cta"]);
    const signedInCta = signedInRegistrations.find((item) => item.key === "dark-cta");
    const signedInElement = signedInCta?.render() as JSX.Element;
    signedInElement.props.onClick();
    expect(onNavigate).toHaveBeenCalledWith("/light/workspace");

    const signedOutRegistrations = buildMarketplaceWorkspaceAccessRightRegistrations({
      sessionUser: null,
      signedInLabel: "Signed in",
      signedOutLabel: "Guest mode",
      workspaceLabel: "Open Workspace",
      signInLabel: "Sign In",
      onNavigate,
      toPublicPath: (path: string) => `/light${path}`
    });
    const signedOutCta = signedOutRegistrations.find((item) => item.key === "dark-cta");
    const signedOutElement = signedOutCta?.render() as JSX.Element;
    signedOutElement.props.onClick();
    expect(onNavigate).toHaveBeenCalledWith("/light/login");
  });

  it("supports custom workspace and login paths for workspace access registrations", () => {
    const onNavigate = vi.fn();

    const signedInRegistrations = buildMarketplaceWorkspaceAccessRightRegistrations({
      sessionUser: {
        id: 3,
        username: "charlie",
        display_name: "Charlie",
        role: "maintainer",
        status: "active"
      },
      signedInLabel: "Signed in",
      signedOutLabel: "Guest mode",
      workspaceLabel: "Open Console",
      signInLabel: "Sign In",
      onNavigate,
      toPublicPath: (path: string) => `/mobile/light${path}`,
      workspacePath: "/console",
      loginPath: "/auth/login"
    });
    const signedInCta = signedInRegistrations.find((item) => item.key === "dark-cta");
    const signedInElement = signedInCta?.render() as JSX.Element;
    signedInElement.props.onClick();
    expect(onNavigate).toHaveBeenCalledWith("/mobile/light/console");

    const signedOutRegistrations = buildMarketplaceWorkspaceAccessRightRegistrations({
      sessionUser: null,
      signedInLabel: "Signed in",
      signedOutLabel: "Guest mode",
      workspaceLabel: "Open Console",
      signInLabel: "Sign In",
      onNavigate,
      toPublicPath: (path: string) => `/mobile/light${path}`,
      workspacePath: "/console",
      loginPath: "/auth/login"
    });
    const signedOutCta = signedOutRegistrations.find((item) => item.key === "dark-cta");
    const signedOutElement = signedOutCta?.render() as JSX.Element;
    signedOutElement.props.onClick();
    expect(onNavigate).toHaveBeenCalledWith("/mobile/light/auth/login");
  });

  it("builds workspace and auth registrations with consistent dual CTA layout", () => {
    const onWorkspaceClick = vi.fn();
    const onAuthClick = vi.fn();

    const signedOutRegistrations = buildMarketplaceWorkspaceAuthRightRegistrations({
      sessionUser: null,
      workspaceLabel: "Workspace",
      signInLabel: "Sign In",
      signOutLabel: "Sign Out",
      onWorkspaceClick,
      onAuthClick
    });
    expect(signedOutRegistrations.map((item) => item.key)).toEqual(["dark-secondary-cta", "dark-cta"]);

    const signedOutWorkspaceButton = signedOutRegistrations.find((item) => item.key === "dark-secondary-cta")?.render() as JSX.Element;
    signedOutWorkspaceButton.props.onClick();
    expect(onWorkspaceClick).toHaveBeenCalledTimes(1);

    const signedOutAuthButton = signedOutRegistrations.find((item) => item.key === "dark-cta")?.render() as JSX.Element;
    expect(signedOutAuthButton.props.children).toBe("Sign In");
    signedOutAuthButton.props.onClick();
    expect(onAuthClick).toHaveBeenCalledTimes(1);

    const signedInRegistrations = buildMarketplaceWorkspaceAuthRightRegistrations({
      sessionUser: {
        id: 2,
        username: "bob",
        display_name: "Bob",
        role: "admin",
        status: "active"
      },
      workspaceLabel: "Workspace",
      signInLabel: "Sign In",
      signOutLabel: "Sign Out",
      onWorkspaceClick,
      onAuthClick
    });

    const signedInAuthButton = signedInRegistrations.find((item) => item.key === "dark-cta")?.render() as JSX.Element;
    expect(signedInAuthButton.props.children).toBe("Sign Out");
  });
});
