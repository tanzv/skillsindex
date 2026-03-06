import { describe, expect, it } from "vitest";
import { globalLoginStylesFormHeader } from "./globalStyles.login.formHeader";

describe("globalLoginStylesFormHeader", () => {
  it("includes login header actions and form intro styles", () => {
    expect(globalLoginStylesFormHeader).toContain(".login-form-header");
    expect(globalLoginStylesFormHeader).toContain(".login-form-header-actions");
    expect(globalLoginStylesFormHeader).toContain(".login-form-brand");
    expect(globalLoginStylesFormHeader).toContain("@keyframes loginPanelEnter");
  });
});
