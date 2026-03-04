import { PrototypeCardEntry } from "./MarketplaceHomePage.helpers";

interface MarketplaceHomeSkillCardProps {
  card: PrototypeCardEntry;
  cardKey: string;
  onOpen: (skillID: number | null) => void;
}

export default function MarketplaceHomeSkillCard({ card, cardKey, onOpen }: MarketplaceHomeSkillCardProps) {
  const coverStyle = card.coverImageURL ? { backgroundImage: `url("${card.coverImageURL}")` } : undefined;
  const cardChips = card.chips.filter(Boolean).slice(0, 2);
  const metaSegments = card.meta
    .split(/\s*(?:\||\u00B7)\s*/g)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <article key={cardKey} className="marketplace-skill-row">
      <div className="marketplace-card-head">
        <span className="marketplace-card-cover" aria-hidden="true">
          <span className="marketplace-card-cover-thumb" style={coverStyle} />
          <span className="marketplace-card-cover-chip">HD</span>
        </span>
      </div>
      <div className="marketplace-skill-name">
        <button type="button" onClick={() => onOpen(card.skillID)}>
          {card.title}
        </button>
      </div>
      <p className="marketplace-skill-description">{card.subtitle}</p>
      <div className="marketplace-skill-secondary">
        <div className="marketplace-skill-chip-row">
          {cardChips.map((chip, index) => (
            <span key={`${cardKey}-chip-${index}`}>{chip}</span>
          ))}
        </div>
        <div className="marketplace-skill-row-foot">
          {metaSegments.length > 0 ? (
            metaSegments.map((segment, index) => (
              <span key={`${cardKey}-meta-${index}`} className={index === 0 ? "is-primary" : ""}>
                {segment}
              </span>
            ))
          ) : (
            <span className="is-primary">{card.meta}</span>
          )}
        </div>
      </div>
    </article>
  );
}
