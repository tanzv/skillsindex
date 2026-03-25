import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu";

describe("ui dropdown menu", () => {
  it("renders trigger and menu content contracts with grouped actions", () => {
    const markup = renderToStaticMarkup(
      createElement(
        DropdownMenu,
        { open: true },
        createElement(DropdownMenuTrigger, { asChild: true }, createElement("button", { type: "button" }, "Open menu")),
        createElement(
          DropdownMenuContent,
          { align: "end" },
          createElement(DropdownMenuLabel, null, "Account"),
          createElement(DropdownMenuItem, null, "Profile"),
          createElement(DropdownMenuSeparator, null),
          createElement(DropdownMenuItem, null, "Sign out")
        )
      )
    );

    expect(markup).toContain("Open menu");
    expect(markup).toContain('role="menu"');
    expect(markup).toContain("Account");
    expect(markup).toContain("Profile");
    expect(markup).toContain("Sign out");
    expect(markup).toContain('role="separator"');
  });
});
