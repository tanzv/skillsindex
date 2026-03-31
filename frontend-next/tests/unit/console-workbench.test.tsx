import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ConsoleWorkbench } from "@/src/features/workbench/ConsoleWorkbench";
import type { WorkbenchDefinition } from "@/src/features/workbench/types";

const definition: WorkbenchDefinition = {
  title: "Workbench",
  subtitle: "Operational controls",
  resources: [
    {
      key: "records",
      title: "Records",
      description: "Inspect records",
      fields: [
        {
          key: "query",
          label: "Query",
          type: "text",
          placeholder: "Search"
        },
        {
          key: "includeDisabled",
          label: "Include disabled",
          type: "switch"
        }
      ],
      autoLoad: false,
      buildPath: () => "/records"
    }
  ],
  actions: [
    {
      key: "sync",
      title: "Sync",
      fields: [
        {
          key: "scope",
          label: "Scope",
          type: "select",
          options: [
            { label: "All", value: "all" }
          ]
        }
      ],
      buildPath: () => "/sync"
    }
  ]
};

describe("ConsoleWorkbench", () => {
  it("binds visible labels to controls and uses token-driven response surfaces", () => {
    const markup = renderToStaticMarkup(createElement(ConsoleWorkbench, { definition, scope: "admin" }));

    expect(markup).toContain('for="records-query-control"');
    expect(markup).toContain('id="records-query-label"');
    expect(markup).toContain('id="records-query-control"');
    expect(markup).toContain('aria-labelledby="records-query-label"');
    expect(markup).toContain('id="records-includeDisabled-control"');
    expect(markup).toContain('aria-labelledby="records-includeDisabled-label"');
    expect(markup).toContain('border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)]');
  });
});
