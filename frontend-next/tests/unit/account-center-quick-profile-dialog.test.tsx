import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AccountCenterQuickProfileDialog } from "@/src/components/shared/AccountCenterQuickProfileDialog";

describe("AccountCenterQuickProfileDialog", () => {
  it("renders a quick-edit profile modal with real account profile fields", () => {
    const markup = renderToStaticMarkup(
      createElement(AccountCenterQuickProfileDialog, {
        open: true,
        closeLabel: "Close account center",
        title: "Profile",
        description: "Review personal identity, display name, avatar, and public profile details.",
        loadingMessage: "Loading profile…",
        displayNameLabel: "Display Name",
        avatarURLLabel: "Avatar URL",
        bioLabel: "Bio",
        displayNamePlaceholder: "Display name",
        avatarURLPlaceholder: "https://example.com/avatar.png",
        bioPlaceholder: "Short biography",
        loadingMessage: "Loading profile…",
        saveLabel: "Save Profile",
        cancelLabel: "Cancel",
        statusMessage: "Profile saved.",
        errorMessage: "",
        loading: false,
        saving: false,
        avatarInitials: "AO",
        draft: {
          displayName: "Admin Operator",
          avatarURL: "https://example.com/avatar.png",
          bio: "Maintains the full control plane."
        },
        onDraftChange: () => {},
        onClose: () => {},
        onSave: () => {}
      })
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain("Profile");
    expect(markup).toContain("Display Name");
    expect(markup).toContain("Avatar URL");
    expect(markup).toContain("Bio");
    expect(markup).toContain("Admin Operator");
    expect(markup).toContain("Maintains the full control plane.");
    expect(markup).toContain("Save Profile");
    expect(markup).toContain("Profile saved.");
  });

  it("hides stale profile fields while the quick-edit dialog is still loading", () => {
    const markup = renderToStaticMarkup(
      createElement(AccountCenterQuickProfileDialog, {
        open: true,
        closeLabel: "Close account center",
        title: "Profile",
        description: "Review personal identity, display name, avatar, and public profile details.",
        loadingMessage: "Loading profile…",
        displayNameLabel: "Display Name",
        avatarURLLabel: "Avatar URL",
        bioLabel: "Bio",
        displayNamePlaceholder: "Display name",
        avatarURLPlaceholder: "https://example.com/avatar.png",
        bioPlaceholder: "Short biography",
        saveLabel: "Save Profile",
        cancelLabel: "Cancel",
        statusMessage: "",
        errorMessage: "",
        loading: true,
        saving: false,
        avatarInitials: "AO",
        draft: {
          displayName: "Stale Profile Name",
          avatarURL: "https://example.com/stale-avatar.png",
          bio: "Stale profile bio"
        },
        onDraftChange: () => {},
        onClose: () => {},
        onSave: () => {}
      })
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain("Profile");
    expect(markup).not.toContain("Stale Profile Name");
    expect(markup).not.toContain("https://example.com/stale-avatar.png");
    expect(markup).not.toContain("Stale profile bio");
    expect(markup).not.toContain("Display Name");
    expect(markup).not.toContain("Avatar URL");
    expect(markup).toContain("Loading profile…");
    expect(markup).toContain("Save Profile");
    expect(markup).toContain("disabled");
  });
});
