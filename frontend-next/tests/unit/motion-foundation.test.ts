import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  MOTION_DELAY_MS,
  MOTION_DELAY_TOKENS,
  MOTION_DURATION_MS,
  MOTION_EASING_TOKENS,
  MOTION_EXIT_DURATION_MS
} from "@/src/lib/motion/contracts";
import { createStaggerMotionStyle, formatMotionTimeMs } from "@/src/lib/motion/style";

function readProjectFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("motion foundation", () => {
  it("exports shared motion duration and easing contracts", () => {
    expect(MOTION_DURATION_MS.fast).toBe(160);
    expect(MOTION_DURATION_MS.medium).toBe(220);
    expect(MOTION_DURATION_MS.enter).toBe(720);
    expect(MOTION_DELAY_MS.md).toBe(160);
    expect(MOTION_DELAY_MS.staggerStep).toBe(80);
    expect(MOTION_EXIT_DURATION_MS).toBe(MOTION_DURATION_MS.medium);
    expect(MOTION_DELAY_TOKENS.xl).toBe("var(--motion-delay-xl)");
    expect(MOTION_EASING_TOKENS.standard).toBe("var(--motion-ease-standard)");
    expect(MOTION_EASING_TOKENS.emphasized).toBe("var(--motion-ease-emphasized)");
  });

  it("provides reusable motion style helpers for staggered delays", () => {
    expect(formatMotionTimeMs(180.2)).toBe("180ms");
    expect(
      createStaggerMotionStyle(2, {
        baseDelayMs: MOTION_DELAY_MS.md
      })
    ).toEqual({
      "--motion-delay": "320ms"
    });
  });

  it("wires shared motion hooks into the overlay surface", () => {
    const detailSurface = readProjectFile("src/components/shared/DetailFormSurface.tsx");

    expect(detailSurface).toContain('from "@/src/lib/motion/contracts"');
    expect(detailSurface).toContain('from "@/src/lib/motion/usePresenceMotion"');
    expect(detailSurface).toContain('from "@/src/lib/motion/useReducedMotion"');
  });

  it("maps login motion variables back to the shared foundation tokens", () => {
    const loginTheme = readProjectFile("src/features/auth/_login-form-theme.scss");
    const loginInfoPanel = readProjectFile("src/features/auth/LoginInfoPanel.tsx");
    const loginInfoPanelStyles = readProjectFile("src/features/auth/LoginInfoPanel.module.scss");
    const loginShell = readProjectFile("src/features/auth/_login-form-shell.scss");
    const loginLayout = readProjectFile("src/features/auth/_login-form-layout.scss");

    expect(loginTheme).toContain("--login-motion-duration-fast: var(--motion-duration-fast);");
    expect(loginTheme).toContain("--login-motion-duration-enter: var(--motion-duration-enter);");
    expect(loginTheme).toContain("--login-motion-delay-panel: var(--motion-delay-xs);");
    expect(loginTheme).toContain("--login-motion-delay-step-2: calc(var(--motion-delay-md) + var(--motion-delay-stagger-step));");
    expect(loginTheme).toContain("--login-motion-delay-ambient-phase: -6000ms;");
    expect(loginInfoPanel).toContain('from "@/src/lib/motion/style"');
    expect(loginInfoPanel).toContain("createStaggerMotionStyle(index");
    expect(loginInfoPanelStyles).toContain("animation-delay: var(--motion-delay, var(--login-motion-delay-step-1));");
    expect(loginShell).toContain("var(--login-motion-duration-fast)");
    expect(loginLayout).toContain("var(--login-motion-duration-enter)");
  });
});
