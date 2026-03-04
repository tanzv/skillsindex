import { describe, expect, it } from "vitest";
import { resolveLoginHomePath } from "./LoginPage.navigation";

describe("resolveLoginHomePath", () => {
  it("routes default login path to default home", () => {
    expect(resolveLoginHomePath("/login")).toBe("/");
  });

  it("routes light login path to light home", () => {
    expect(resolveLoginHomePath("/light/login")).toBe("/light/");
  });

  it("routes mobile login path to mobile home", () => {
    expect(resolveLoginHomePath("/mobile/login")).toBe("/mobile/");
  });

  it("routes mobile light login path to mobile light home", () => {
    expect(resolveLoginHomePath("/mobile/light/login")).toBe("/mobile/light/");
  });
});
