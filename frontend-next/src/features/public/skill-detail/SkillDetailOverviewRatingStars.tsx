const STAR_INDICES = [0, 1, 2, 3, 4] as const;

function RatingStar({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`skill-detail-overview-star${filled ? " is-filled" : ""}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 1.3l1.93 3.91 4.32.63-3.12 3.04.74 4.29L8 11.14 4.13 13.17l.74-4.29L1.75 5.84l4.32-.63L8 1.3Z"
        stroke="currentColor"
        strokeWidth="1.1"
        fill="currentColor"
      />
    </svg>
  );
}

export function SkillDetailOverviewRatingStars({ value }: { value: number }) {
  const roundedValue = Math.max(0, Math.min(5, Math.round(value)));

  return (
    <span className="skill-detail-overview-star-row" aria-hidden="true">
      {STAR_INDICES.map((index) => (
        <RatingStar key={`skill-detail-overview-star-${index + 1}`} filled={index < roundedValue} />
      ))}
    </span>
  );
}
