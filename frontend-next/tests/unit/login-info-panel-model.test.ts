import { describe, expect, it } from "vitest";

import { buildLoginInfoPanelModel } from "@/src/features/auth/loginInfoPanelModel";

const dictionary = {
  eyebrow: "Private Access",
  title: "Welcome Back",
  lead: "Use one secure entry point for internal skill access.",
  card_1_id: "credentials",
  card_1_accent: "primary",
  card_1_eyebrow: "Credential Mode",
  card_1_title: "Password Sign-In",
  card_1_description: "Use your existing local account credentials.",
  card_2_id: "providers",
  card_2_accent: "secondary",
  card_2_eyebrow: "Provider Policy",
  card_2_title: "Controlled by Admin",
  card_2_description: "Third-party providers follow the current admin configuration.",
  card_3_id: "redirect",
  card_3_accent: "secondary",
  card_3_eyebrow: "Return Route",
  card_3_title: "Resume Requested Work",
  card_3_description: "After sign in, you will be redirected to the requested route.",
  card_3_meta_source: "redirect_target"
};

describe("buildLoginInfoPanelModel", () => {
  it("maps configured server dictionary content into a stable left-panel card model", () => {
    const model = buildLoginInfoPanelModel({
      dictionary,
      redirectTarget: "/admin/overview",
    });

    expect(model.eyebrow).toBe(dictionary.eyebrow);
    expect(model.title).toBe(dictionary.title);
    expect(model.cards).toHaveLength(3);
    expect(model.cards.map((card) => card.id)).toEqual(["credentials", "providers", "redirect"]);
    expect(model.cards[0]).toMatchObject({
      id: "credentials",
      accent: "primary",
      eyebrow: dictionary.card_1_eyebrow,
      title: dictionary.card_1_title,
      description: dictionary.card_1_description
    });
    expect(model.cards[2]).toMatchObject({
      id: "redirect",
      title: dictionary.card_3_title,
      description: dictionary.card_3_description,
      meta: "/admin/overview"
    });
  });
});
