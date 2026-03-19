import Link from "next/link";

import { TabsList, TabsTrigger } from "@/src/components/ui/tabs";

import { SkillDetailInstallAgentPanel } from "./SkillDetailInstallAgentPanel";
import { SkillDetailInstallHumanPanel } from "./SkillDetailInstallHumanPanel";
import { buildSkillDetailInstallPrompt } from "./skillDetailInstallPrompt";
import { resolveSkillDetailInstallAudience } from "./skillDetailInstallAudience";
import type { SkillDetailInstallCardProps } from "./skillDetailSidebarTypes";

export function SkillDetailInstallCard({
  activeTab,
  currentContextLabel,
  detail,
  installAudience,
  installFeedback,
  installationSteps,
  messages,
  onCopyValue,
  onInstallAudienceChange
}: SkillDetailInstallCardProps) {
  const resolvedInstallAudience = resolveSkillDetailInstallAudience(activeTab, installAudience);
  const installCommand = detail.skill.install_command || installationSteps[0]?.value || "";
  const installMetadataRows = installationSteps.slice(1);
  const installTitle = installationSteps[0]?.label || messages.skillDetailInstallTitle;
  const agentPrompt = buildSkillDetailInstallPrompt({
    detail,
    fallbackInstallValue: installationSteps[0]?.value
  });
  const sourceUrl = detail.skill.source_url || undefined;

  return (
    <section
      className="marketplace-section-card skill-detail-side-card skill-detail-installation-card"
      data-active-tab={activeTab}
      data-install-audience={resolvedInstallAudience}
      data-testid="skill-detail-installation-card"
    >
      <div className="marketplace-section-header skill-detail-installation-card-header">
        <div className="skill-detail-installation-card-title-block">
          <h3>{messages.skillDetailInstallTitle}</h3>
          <p>{messages.skillDetailInstallDescription}</p>
        </div>

        {activeTab === "resources" && detail.skill.source_url ? (
          <Link
            href={detail.skill.source_url}
            target="_blank"
            rel="noreferrer"
            className="skill-detail-installation-card-header-link"
          >
            {messages.skillDetailOpenSource}
          </Link>
        ) : null}
      </div>

      {currentContextLabel ? (
        <div className="skill-detail-installation-card-context">
          <span className="skill-detail-installation-card-context-chip">{currentContextLabel}</span>
        </div>
      ) : null}

      <div className="skill-detail-install-mode-switch" data-active-tab={activeTab}>
        <TabsList aria-label={messages.skillDetailInstallTitle}>
          <TabsTrigger
            value="agent"
            activeValue={resolvedInstallAudience}
            className="skill-detail-install-mode-button"
            onValueChange={() => onInstallAudienceChange("agent")}
            controlsId="skill-detail-install-agent-panel"
            triggerId="skill-detail-install-agent-trigger"
          >
            {messages.skillDetailInstallAudienceAgent}
          </TabsTrigger>
          <TabsTrigger
            value="human"
            activeValue={resolvedInstallAudience}
            className="skill-detail-install-mode-button"
            onValueChange={() => onInstallAudienceChange("human")}
            controlsId="skill-detail-install-human-panel"
            triggerId="skill-detail-install-human-trigger"
          >
            {messages.skillDetailInstallAudienceHuman}
          </TabsTrigger>
        </TabsList>
      </div>

      {installFeedback ? <div className="skill-detail-feedback">{installFeedback}</div> : null}

      {resolvedInstallAudience === "agent" ? (
        <SkillDetailInstallAgentPanel
          activeTab={activeTab}
          ctaLabel={messages.skillDetailActionCopyPrompt}
          hintText={messages.skillDetailInstallAgentHint}
          onCopyValue={onCopyValue}
          promptContent={agentPrompt}
          promptTitle={messages.skillDetailInstallAgentPromptTitle}
          sourceActionLabel={messages.skillDetailOpenSource}
          sourceUrl={sourceUrl}
        />
      ) : (
        <SkillDetailInstallHumanPanel
          activeTab={activeTab}
          commandLabel={installCommand}
          ctaLabel={messages.skillDetailActionCopyCommand}
          metadataRows={installMetadataRows}
          onCopyValue={onCopyValue}
          sourceActionLabel={messages.skillDetailOpenSource}
          sourceUrl={sourceUrl}
          title={installTitle}
        />
      )}
    </section>
  );
}
