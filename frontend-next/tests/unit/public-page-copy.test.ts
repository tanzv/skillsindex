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
  statePermissionDescription: "Permission description",
  state404Title: "Page Not Found",
  state404Description: "404 description",
  state500Title: "Unexpected Application Error",
  state500Description: "500 description",
  state503Title: "Service Unavailable",
  state503Description: "503 description"
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
      tone: "danger",
      title: "Error State",
      description: "Error description",
      actions: ["retry", "home"]
    });

    expect(resolvePublicStateDescriptor(messages, "permission-denied")).toEqual({
      tone: "warning",
      title: "Permission Denied",
      description: "Permission description",
      actions: ["home", "search"]
    });

    expect(resolvePublicStateDescriptor(messages, "not-found")).toEqual({
      code: "404",
      tone: "warning",
      title: "Page Not Found",
      description: "404 description",
      actions: ["home", "search"]
    });

    expect(resolvePublicStateDescriptor(messages, "server-error")).toEqual({
      code: "500",
      tone: "danger",
      title: "Unexpected Application Error",
      description: "500 description",
      actions: ["retry", "home"]
    });

    expect(resolvePublicStateDescriptor(messages, "service-unavailable")).toEqual({
      code: "503",
      tone: "danger",
      title: "Service Unavailable",
      description: "503 description",
      actions: ["retry", "home"]
    });

    expect(resolvePublicStateDescriptor(messages, "missing")).toBeNull();
  });
});
