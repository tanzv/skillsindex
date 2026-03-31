import { describe, expect, it } from "vitest";

import { buildLoginInfoPanelModel } from "@/src/features/auth/loginInfoPanelModel";

const dictionary = {
  eyebrow: "Private Access",
  title: "Welcome Back",
  lead: "Use one secure entry point for internal skill access.",
  card_1_id: "providers",
  card_1_accent: "secondary",
  card_1_eyebrow: "Provider Policy",
  card_1_title: "Controlled by Admin",
  card_1_description: "Third-party providers follow the current admin configuration.",
  card_2_id: "redirect",
  card_2_accent: "secondary",
  card_2_eyebrow: "Return Route",
  card_2_title: "Resume Requested Work",
  card_2_description: "After sign in, you will be redirected to the requested route.",
  card_2_meta_source: "redirect_target"
};

describe("buildLoginInfoPanelModel", () => {
  it("maps configured server dictionary content into a compact support-panel model", () => {
    const model = buildLoginInfoPanelModel({
      dictionary,
      redirectTarget: "/admin/overview",
    });

    expect(model.eyebrow).toBe(dictionary.eyebrow);
    expect(model.title).toBe(dictionary.title);
    expect(model.cards).toHaveLength(2);
    expect(model.cards.map((card) => card.id)).toEqual(["providers", "redirect"]);
    expect(model.cards[0]).toMatchObject({
      id: "providers",
      accent: "secondary",
      eyebrow: dictionary.card_1_eyebrow,
      title: dictionary.card_1_title,
      description: dictionary.card_1_description
    });
    expect(model.cards[1]).toMatchObject({
      id: "redirect",
      title: dictionary.card_2_title,
      description: dictionary.card_2_description,
      meta: "/admin/overview"
    });
  });

  it("falls back to a compact two-card support panel when the dictionary is missing card content", () => {
    const model = buildLoginInfoPanelModel({
      dictionary: {},
      redirectTarget: "/workspace",
    });

    expect(model.cards).toHaveLength(2);
    expect(model.cards.map((card) => card.id)).toEqual(["providers", "redirect"]);
    expect(model.cards[0]).toMatchObject({
      id: "providers",
      accent: "secondary",
      title: "Controlled by Admin",
    });
    expect(model.cards[1]).toMatchObject({
      id: "redirect",
      meta: "/workspace",
    });
  });
});
