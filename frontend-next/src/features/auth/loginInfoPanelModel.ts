export interface LoginInfoPanelCardModel {
  id: string;
  accent: "primary" | "secondary";
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
}

export interface LoginInfoPanelModel {
  eyebrow: string;
  title: string;
  lead: string;
  cards: LoginInfoPanelCardModel[];
}

type LoginInfoPanelMetaSource = "none" | "redirect_target";

interface BuildLoginInfoPanelModelInput {
  dictionary: Record<string, string>;
  redirectTarget: string;
}

function isLoginInfoPanelCardModel(
  card: LoginInfoPanelCardModel | null
): card is LoginInfoPanelCardModel {
  return card !== null;
}

const fallbackLoginInfoPanelModel: LoginInfoPanelModel = {
  eyebrow: "Private Access",
  title: "Welcome Back",
  lead: "Access stays aligned with your workspace provider and redirect policy.",
  cards: [
    {
      id: "providers",
      accent: "secondary",
      eyebrow: "Provider Policy",
      title: "Controlled by Admin",
      description: "Third-party providers follow the current admin configuration."
    },
    {
      id: "redirect",
      accent: "secondary",
      eyebrow: "Return Route",
      title: "Resume Requested Work",
      description: "After sign in, you will be redirected to the requested route."
    }
  ]
};

function readCardMeta(dictionary: Record<string, string>, index: number): string | undefined {
  const metaSource = dictionary[`card_${String(index)}_meta_source`] as LoginInfoPanelMetaSource | undefined;
  if (metaSource === "redirect_target") {
    return "redirect_target";
  }

  return dictionary[`card_${String(index)}_meta`];
}

export function buildLoginInfoPanelModel({
  dictionary,
  redirectTarget
}: BuildLoginInfoPanelModelInput): LoginInfoPanelModel {
  const cards = [1, 2, 3]
    .map<LoginInfoPanelCardModel | null>((index) => {
      const id = dictionary[`card_${String(index)}_id`];
      const eyebrow = dictionary[`card_${String(index)}_eyebrow`];
      const title = dictionary[`card_${String(index)}_title`];
      const description = dictionary[`card_${String(index)}_description`];

      if (!id || !eyebrow || !title || !description) {
        return null;
      }

      const accent = dictionary[`card_${String(index)}_accent`] === "primary" ? "primary" : "secondary";
      const meta = readCardMeta(dictionary, index);

      return {
        id,
        accent,
        eyebrow,
        title,
        description,
        meta: meta === "redirect_target" ? redirectTarget : meta
      };
    })
    .filter(isLoginInfoPanelCardModel);

  return {
    eyebrow: dictionary.eyebrow || fallbackLoginInfoPanelModel.eyebrow,
    title: dictionary.title || fallbackLoginInfoPanelModel.title,
    lead: dictionary.lead || fallbackLoginInfoPanelModel.lead,
    cards: cards.length ? cards : fallbackLoginInfoPanelModel.cards.map((card) => ({
      ...card,
      meta: card.id === "redirect" ? redirectTarget : card.meta
    }))
  };
}
