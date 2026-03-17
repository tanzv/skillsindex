import { describe, expect, it } from "vitest";

import {
  buildProtectedTopbarModel,
  type ProtectedTopbarConfig
} from "@/src/components/shared/protectedTopbarModel";

const protectedTopbarTestConfig: ProtectedTopbarConfig = {
  entries: [
    {
      id: "one",
      href: "/one",
      label: "One",
      description: "First protected section.",
      kind: "primary",
      overflowGroupId: "primary"
    },
    {
      id: "two",
      href: "/two",
      label: "Two",
      description: "Second protected section.",
      kind: "primary",
      overflowGroupId: "primary"
    },
    {
      id: "three",
      href: "/three",
      label: "Three",
      description: "Third protected section.",
      kind: "primary",
      overflowGroupId: "primary"
    },
    {
      id: "four",
      href: "/four",
      label: "Four",
      description: "Fourth protected section.",
      kind: "primary",
      overflowGroupId: "primary"
    },
    {
      id: "five",
      href: "/five",
      label: "Five",
      description: "Fifth protected section.",
      kind: "primary",
      overflowGroupId: "primary"
    },
    {
      id: "account",
      href: "/account",
      label: "Account",
      description: "Protected account section.",
      kind: "access",
      overflowGroupId: "access",
      matchPrefixes: ["/account"]
    }
  ],
  primaryGroups: [
    { id: "primary-group", label: "Primary", tagLabel: "Primary", kind: "primary" },
    { id: "access-group", label: "Access", tagLabel: "Access", kind: "access" }
  ],
  overflowGroupTitles: {
    primary: "Primary",
    access: "Access"
  },
  overflowGroupOrder: ["primary", "access"],
  overflowTitle: "Overflow",
  overflowHint: "Protected topbar test configuration."
};

describe("protected topbar model", () => {
  it("keeps an active primary entry visible when it would otherwise overflow", () => {
    const model = buildProtectedTopbarModel("/five", protectedTopbarTestConfig, 3);

    expect(model.visibleEntries.map((entry) => entry.label)).toEqual(["One", "Two", "Five"]);
    expect(model.visibleEntries.find((entry) => entry.label === "Five")?.active).toBe(true);
    expect(model.hiddenEntries.map((entry) => entry.label)).toContain("Three");
  });

  it("keeps an active access entry visible after primary entries fill the shell", () => {
    const model = buildProtectedTopbarModel("/account/security", protectedTopbarTestConfig, 4);

    expect(model.visibleEntries.map((entry) => entry.label)).toEqual(["One", "Two", "Three", "Account"]);
    expect(model.visibleEntries.find((entry) => entry.label === "Account")?.active).toBe(true);
    expect(model.hiddenEntries.map((entry) => entry.label)).toContain("Four");
  });
});
