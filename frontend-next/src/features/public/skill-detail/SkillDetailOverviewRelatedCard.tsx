import { PublicLink } from "@/src/components/shared/PublicLink";
import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";

import type { PublicSkillDetailModel } from "../publicSkillDetailModel";

interface SkillDetailOverviewRelatedCardProps {
  messages: Pick<PublicMarketplaceMessages, "rankingOpenSkillLabel" | "skillDetailRelatedDescription" | "skillDetailRelatedTitle">;
  relatedSkills: PublicSkillDetailModel["relatedSkills"];
}

export function SkillDetailOverviewRelatedCard({
  messages,
  relatedSkills
}: SkillDetailOverviewRelatedCardProps) {
  if (relatedSkills.length === 0) {
    return null;
  }

  return (
    <section className="skill-detail-overview-section skill-detail-overview-related-card" aria-label={messages.skillDetailRelatedTitle}>
      <div className="skill-detail-overview-section-head">
        <div className="skill-detail-overview-section-copy">
          <h3 className="skill-detail-overview-section-title">{messages.skillDetailRelatedTitle}</h3>
          <p>{messages.skillDetailRelatedDescription}</p>
        </div>
      </div>

      <div className="skill-detail-related-list">
        {relatedSkills.map((skill) => (
          <PublicLink key={skill.id} href={`/skills/${skill.id}`} className="skill-detail-related-card">
            <div className="skill-detail-related-head">
              <strong>{skill.name}</strong>
              <span>{skill.qualityScore}</span>
            </div>
            <span className="skill-detail-related-meta">{skill.category}</span>
            <span className="skill-detail-related-link">{messages.rankingOpenSkillLabel}</span>
          </PublicLink>
        ))}
      </div>
    </section>
  );
}
