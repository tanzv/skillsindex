import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Label } from "@/src/components/ui/label";
import { Separator } from "@/src/components/ui/separator";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Switch } from "@/src/components/ui/switch";

describe("ui form primitives", () => {
  it("renders avatar fallback content when no image source is available", () => {
    const markup = renderToStaticMarkup(
      createElement(
        Avatar,
        null,
        createElement(AvatarImage, { src: "", alt: "Admin Operator" }),
        createElement(AvatarFallback, null, "AO")
      )
    );

    expect(markup).toContain("AO");
    expect(markup).toContain("Admin Operator");
  });

  it("renders a checkbox button with accessible checked state", () => {
    const markup = renderToStaticMarkup(
      createElement(Checkbox, {
        checked: true,
        "aria-label": "Enable publishing"
      })
    );

    expect(markup).toContain('role="checkbox"');
    expect(markup).toContain('aria-checked="true"');
    expect(markup).toContain('aria-label="Enable publishing"');
  });

  it("renders a switch button with accessible checked state", () => {
    const markup = renderToStaticMarkup(
      createElement(Switch, {
        checked: false,
        "aria-label": "Marketplace access"
      })
    );

    expect(markup).toContain('role="switch"');
    expect(markup).toContain('aria-checked="false"');
    expect(markup).toContain('aria-label="Marketplace access"');
  });

  it("renders label, separator, and skeleton utility primitives", () => {
    const markup = renderToStaticMarkup(
      createElement(
        "div",
        null,
        createElement(Label, { htmlFor: "profile-name" }, "Display Name"),
        createElement(Separator, { orientation: "vertical" }),
        createElement(Skeleton, { className: "loading-block" })
      )
    );

    expect(markup).toContain('for="profile-name"');
    expect(markup).toContain("Display Name");
    expect(markup).toContain('role="separator"');
    expect(markup).toContain('aria-orientation="vertical"');
    expect(markup).toContain('data-slot="skeleton"');
    expect(markup).toContain("loading-block");
  });
});
