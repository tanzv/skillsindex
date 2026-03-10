import type { SkillDetailPresetKey } from "./PublicSkillDetailPage.helpers";

export interface SkillDetailPresetTabOption {
  key: SkillDetailPresetKey;
  label: string;
}

export const skillDetailPresetTabs: ReadonlyArray<SkillDetailPresetTabOption> = [
  { key: "skill", label: "SKILL.md" },
  { key: "readme", label: "README.md" },
  { key: "changelog", label: "CHANGELOG.md" }
];

export function resolveNextPresetTabKeyByKeyboard(currentIndex: number, keyboardKey: string): SkillDetailPresetKey | null {
  if (skillDetailPresetTabs.length === 0) {
    return null;
  }

  const lastIndex = skillDetailPresetTabs.length - 1;
  let nextIndex = currentIndex;

  if (keyboardKey === "ArrowRight" || keyboardKey === "ArrowDown") {
    nextIndex = currentIndex >= lastIndex ? 0 : currentIndex + 1;
  } else if (keyboardKey === "ArrowLeft" || keyboardKey === "ArrowUp") {
    nextIndex = currentIndex <= 0 ? lastIndex : currentIndex - 1;
  } else if (keyboardKey === "Home") {
    nextIndex = 0;
  } else if (keyboardKey === "End") {
    nextIndex = lastIndex;
  } else {
    return null;
  }

  return skillDetailPresetTabs[nextIndex]?.key || null;
}
