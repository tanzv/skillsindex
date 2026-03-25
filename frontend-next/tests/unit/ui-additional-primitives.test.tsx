import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/src/components/ui/breadcrumb";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/src/components/ui/table";

describe("ui additional primitives", () => {
  it("renders breadcrumb contracts with link and current page states", () => {
    const markup = renderToStaticMarkup(
      createElement(
        Breadcrumb,
        null,
        createElement(
          BreadcrumbList,
          null,
          createElement(BreadcrumbItem, null, createElement(BreadcrumbLink, { href: "/" }, "Home")),
          createElement(BreadcrumbSeparator, null),
          createElement(BreadcrumbItem, null, createElement(BreadcrumbPage, null, "Workspace"))
        )
      )
    );

    expect(markup).toContain('aria-label="breadcrumb"');
    expect(markup).toContain("Home");
    expect(markup).toContain("Workspace");
  });

  it("renders a standard radio group contract", () => {
    const markup = renderToStaticMarkup(
      createElement(
        RadioGroup,
        { "aria-label": "Theme" },
        createElement(RadioGroupItem, { value: "light", activeValue: "light" }, "Light"),
        createElement(RadioGroupItem, { value: "dark", activeValue: "light" }, "Dark")
      )
    );

    expect(markup).toContain('role="radiogroup"');
    expect(markup).toContain('role="radio"');
    expect(markup).toContain('aria-checked="true"');
    expect(markup).toContain('aria-checked="false"');
  });

  it("renders a scroll area wrapper and a table contract", () => {
    const markup = renderToStaticMarkup(
      createElement(
        ScrollArea,
        { className: "max-h-60" },
        createElement(
          Table,
          null,
          createElement(
            TableHeader,
            null,
            createElement(
              TableRow,
              null,
              createElement(TableHead, null, "Name"),
              createElement(TableHead, null, "Status")
            )
          ),
          createElement(
            TableBody,
            null,
            createElement(
              TableRow,
              null,
              createElement(TableCell, null, "Skill"),
              createElement(TableCell, null, "Active")
            )
          )
        )
      )
    );

    expect(markup).toContain('data-slot="scroll-area"');
    expect(markup).toContain("max-h-60");
    expect(markup).toContain("<table");
    expect(markup).toContain("Name");
    expect(markup).toContain("Active");
  });
});
