import styles from "./LoginInfoPanel.module.css";

interface LoginInfoPanelProps {
  eyebrow: string;
  title: string;
  lead: string;
  items: string[];
}

export function LoginInfoPanel({ eyebrow, title, lead, items }: LoginInfoPanelProps) {
  return (
    <div className={styles.infoCard} data-testid="login-info-card">
      <p className={styles.infoEyebrow}>{eyebrow}</p>
      <h2 className={styles.infoTitle}>{title}</h2>
      <p className={styles.infoLead}>{lead}</p>

      <ul className={styles.infoList}>
        {items.map((item, index) => (
          <li key={item} className={styles.infoListItem}>
            <span className={styles.infoIndex}>{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.infoBody}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
