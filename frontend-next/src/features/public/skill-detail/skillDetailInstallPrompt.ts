interface BuildSkillDetailInstallPromptOptions {
  detail: {
    skill: {
      install_command?: string | null;
      name?: string | null;
      source_url?: string | null;
    };
  };
  fallbackInstallValue?: string | null;
}

function resolveText(value: string | null | undefined): string {
  return String(value || "").trim();
}

export function buildSkillDetailInstallPrompt({
  detail,
  fallbackInstallValue
}: BuildSkillDetailInstallPromptOptions): string {
  const skillName = resolveText(detail.skill.name) || "skill";
  const sourceUrl = resolveText(detail.skill.source_url);
  const installCommand =
    resolveText(detail.skill.install_command) ||
    resolveText(fallbackInstallValue) ||
    "Install the skill using the marketplace command available in your environment.";

  const steps = [
    sourceUrl
      ? `Open ${sourceUrl} and review the SKILL.md entry for ${skillName}.`
      : `Review the SKILL.md entry for ${skillName}.`,
    `Install the skill with ${installCommand}.`,
    "After installation, read the local SKILL.md file and follow its instructions before execution."
  ];

  return steps.join(" ");
}
