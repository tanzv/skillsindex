import { describe, expect, it } from "vitest";

import {
  resolveAccountRoleLabel,
  resolveAccountStatusLabel,
  resolveAccountUsernameLabel,
  type AccountDisplayMessages
} from "@/src/lib/accountDisplay";

const messages: AccountDisplayMessages = {
  valueUnknownUser: "display_unknown_user",
  statusLabelActive: "display_status_active",
  statusLabelDisabled: "display_status_disabled",
  statusLabelUnknown: "display_status_unknown",
  roleLabelSuperAdmin: "display_role_super_admin",
  roleLabelAdmin: "display_role_admin",
  roleLabelAuditor: "display_role_auditor",
  roleLabelMember: "display_role_member",
  roleLabelViewer: "display_role_viewer",
  roleLabelUnknown: "display_role_unknown"
};

describe("account display", () => {
  it("maps usernames, statuses, and roles to localized labels", () => {
    expect(resolveAccountUsernameLabel("", messages)).toBe("display_unknown_user");
    expect(resolveAccountUsernameLabel("unknown", messages)).toBe("display_unknown_user");
    expect(resolveAccountUsernameLabel("operator", messages)).toBe("operator");

    expect(resolveAccountStatusLabel("active", messages)).toBe("display_status_active");
    expect(resolveAccountStatusLabel("disabled", messages)).toBe("display_status_disabled");
    expect(resolveAccountStatusLabel("", messages)).toBe("display_status_unknown");
    expect(resolveAccountStatusLabel("unknown", messages)).toBe("display_status_unknown");

    expect(resolveAccountRoleLabel("super_admin", messages)).toBe("display_role_super_admin");
    expect(resolveAccountRoleLabel("admin", messages)).toBe("display_role_admin");
    expect(resolveAccountRoleLabel("auditor", messages)).toBe("display_role_auditor");
    expect(resolveAccountRoleLabel("member", messages)).toBe("display_role_member");
    expect(resolveAccountRoleLabel("viewer", messages)).toBe("display_role_viewer");
    expect(resolveAccountRoleLabel("", messages)).toBe("display_role_unknown");
    expect(resolveAccountRoleLabel("unknown", messages)).toBe("display_role_unknown");
  });

  it("preserves unrecognized protocol values for forward compatibility", () => {
    expect(resolveAccountStatusLabel("suspended", messages)).toBe("suspended");
    expect(resolveAccountRoleLabel("security_reviewer", messages)).toBe("security_reviewer");
  });
});
