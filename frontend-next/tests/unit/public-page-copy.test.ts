import { describe, expect, it } from "vitest";

import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import { resolvePublicProgramDescriptor } from "@/src/features/public/publicProgramModel";
import { resolvePublicStateDescriptor } from "@/src/features/public/publicStateModel";

const messages = {
  aboutTitle: "About SkillsIndex",
  aboutDescription: "About description",
  governanceTitle: "Governance",
  governanceDescription: "Governance description",
  rolloutTitle: "Rollout Overview",
  rolloutDescription: "Rollout description",
  timelineTitle: "Timeline",
  timelineDescription: "Timeline description",
  stateLoadingTitle: "Loading State",
  stateLoadingDescription: "Loading description",
  stateEmptyTitle: "Empty State",
  stateEmptyDescription: "Empty description",
  stateErrorTitle: "Error State",
  stateErrorDescription: "Error description",
  statePermissionTitle: "Permission Denied",
  statePermissionDescription: "Permission description"
} as PublicMarketplaceMessages;

describe("public page copy models", () => {
  it("resolves program route descriptors from locale messages", () => {
    expect(resolvePublicProgramDescriptor(messages, "about")).toEqual({
      title: "About SkillsIndex",
      description: "About description",
      route: "/about"
    });

    expect(resolvePublicProgramDescriptor(messages, "rollout")).toEqual({
      title: "Rollout Overview",
      description: "Rollout description",
      route: "/rollout"
    });
  });

  it("resolves public state descriptors from locale messages and aliases permission route names", () => {
    expect(resolvePublicStateDescriptor(messages, "error")).toEqual({
      title: "Error State",
      description: "Error description"
    });

    expect(resolvePublicStateDescriptor(messages, "permission-denied")).toEqual({
      title: "Permission Denied",
      description: "Permission description"
    });

    expect(resolvePublicStateDescriptor(messages, "missing")).toBeNull();
  });
});
