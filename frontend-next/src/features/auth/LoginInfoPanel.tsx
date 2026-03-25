import { MOTION_DELAY_MS } from "@/src/lib/motion/contracts";
import { createMotionDelayStyle, createStaggerMotionStyle } from "@/src/lib/motion/style";

import type { LoginInfoPanelModel } from "./loginInfoPanelModel";

import styles from "./LoginInfoPanel.module.scss";

interface LoginInfoPanelProps {
  model: LoginInfoPanelModel;
  showCards?: boolean;
}

export function LoginInfoPanel({ model, showCards = false }: LoginInfoPanelProps) {
  const heroDelayStyle = createMotionDelayStyle(MOTION_DELAY_MS.md);
  const cardBaseDelayMs = MOTION_DELAY_MS.md + MOTION_DELAY_MS.staggerStep;

  return (
    <div className={styles.infoCard} data-has-cards={showCards ? "true" : "false"} data-testid="login-info-card">
      <div className={styles.infoHero} style={heroDelayStyle}>
        <p className={styles.infoEyebrow}>{model.eyebrow}</p>
        <h2 className={styles.infoTitle}>{model.title}</h2>
        <p className={styles.infoLead}>{model.lead}</p>
      </div>

      {showCards ? (
        <ul className={styles.infoList} data-testid="login-info-card-list">
          {model.cards.map((card, index) => (
            <li
              key={card.id}
              className={styles.infoListItem}
              data-accent={card.accent}
              data-testid={`login-info-card-item-${card.id}`}
              style={createStaggerMotionStyle(index, { baseDelayMs: cardBaseDelayMs })}
            >
              <span className={styles.infoIndex}>{String(index + 1).padStart(2, "0")}</span>
              <div className={styles.infoContent}>
                <div className={styles.infoCardHeader}>
                  <p className={styles.infoCardEyebrow}>{card.eyebrow}</p>
                  {card.meta ? <code className={styles.infoMeta}>{card.meta}</code> : null}
                </div>
                <p className={styles.infoCardTitle}>{card.title}</p>
                <p className={styles.infoBody}>{card.description}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
