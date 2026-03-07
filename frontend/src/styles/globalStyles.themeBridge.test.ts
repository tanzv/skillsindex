import { describe, expect, it } from "vitest";

import { globalAccountWorkbenchStyles } from "./globalStyles.accountWorkbench";
import { globalBaseStyles } from "./globalStyles.base";

describe("global theme bridge styles", () => {
  it("binds base panel and status styles to theme tokens", () => {
    expect(globalBaseStyles).toContain("--bg-panel: color-mix(in srgb, var(--si-color-panel");
    expect(globalBaseStyles).toContain("--text-main: var(--si-color-text-primary");
    expect(globalBaseStyles).toContain("--stroke-soft: color-mix(in srgb, var(--si-color-border-soft");
    expect(globalBaseStyles).toContain("background: color-mix(in srgb, var(--success-bg) 82%, transparent);");
    expect(globalBaseStyles).toContain("color: var(--success-text);");
    expect(globalBaseStyles).toContain("background: color-mix(in srgb, var(--muted-bg) 88%, transparent);");
  });

  it("keeps account workbench panel and table surfaces token-driven", () => {
    expect(globalAccountWorkbenchStyles).toContain(".page-grid.account-workbench {");
    expect(globalAccountWorkbenchStyles).toContain("margin-top: 0;");
    expect(globalAccountWorkbenchStyles).toContain(".account-workbench .panel {");
    expect(globalAccountWorkbenchStyles).toContain("background: var(--account-workbench-panel-bg);");
    expect(globalAccountWorkbenchStyles).toContain(".account-workbench th,");
    expect(globalAccountWorkbenchStyles).toContain("color: var(--account-workbench-text-primary);");
    expect(globalAccountWorkbenchStyles).toContain(".account-workbench .pill.active {");
    expect(globalAccountWorkbenchStyles).toContain("color: var(--si-color-danger-text, #fecaca);");
  });
});
