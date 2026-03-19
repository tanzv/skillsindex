import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PillRadioGroup, PillRadioItem } from "@/src/components/ui/pill-radio-group";

describe("pill radio group", () => {
  it("renders accessible radio state for active and inactive items", () => {
    const markup = renderToStaticMarkup(
      createElement(
        PillRadioGroup,
        { "aria-label": "Rating" },
        createElement(
          PillRadioItem,
          {
            value: "4",
            activeValue: "4",
            className: "skill-detail-rating-button"
          },
          "Rate 4"
        ),
        createElement(
          PillRadioItem,
          {
            value: "5",
            activeValue: "4",
            className: "skill-detail-rating-button"
          },
          "Rate 5"
        )
      )
    );

    expect(markup).toContain('role="radiogroup"');
    expect(markup).toContain('role="radio"');
    expect(markup).toContain('aria-checked="true"');
    expect(markup).toContain('aria-checked="false"');
    expect(markup).toContain('data-state="active"');
    expect(markup).toContain('data-state="inactive"');
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain('tabindex="-1"');
  });
});
