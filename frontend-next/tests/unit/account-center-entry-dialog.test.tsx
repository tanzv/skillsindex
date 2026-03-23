import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AccountCenterEntryDialog } from "@/src/components/shared/AccountCenterEntryDialog";
import type { AccountCenterMenuEntry } from "@/src/components/shared/accountCenterMenu.types";

const accountEntry: AccountCenterMenuEntry = {
  id: "account-profile",
  href: "/account/profile",
  label: "Profile",
  icon: "profile",
  description: "Review personal identity, display name, avatar, and public profile details.",
  kind: "account"
};

describe("AccountCenterEntryDialog", () => {
  it("renders the entry summary and route hint inside a modal detail surface", () => {
    const markup = renderToStaticMarkup(
      createElement(AccountCenterEntryDialog, {
        open: true,
        closeLabel: "Close account center",
        confirmLabel: "Open Profile",
        entry: accountEntry,
        groupTitle: "Account Center",
        onClose: () => {},
        onConfirm: () => {}
      })
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain("Profile");
    expect(markup).toContain("Account Center");
    expect(markup).toContain("/account/profile");
    expect(markup).toContain("Open Profile");
  });
});
