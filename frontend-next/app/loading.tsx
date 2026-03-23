import styles from "./RootLoadingPage.module.scss";

export default function RootLoadingPage() {
  return (
    <div className={styles.page} data-testid="root-loading-page">
      <div className={styles.shell} aria-hidden="true">
        <header className={styles.topbar}>
          <div className={styles.brandBlock}>
            <span className={styles.brandMark} />
            <span className={styles.brandWordmark} />
          </div>
          <div className={styles.topbarActions}>
            <span className={styles.actionChip} />
            <span className={styles.actionChip} />
            <span className={styles.actionChipShort} />
          </div>
        </header>

        <main className={styles.content}>
          <section className={styles.heroPanel}>
            <span className={styles.heroKicker} />
            <span className={styles.heroTitle} />
            <span className={styles.heroTitleShort} />
            <span className={styles.heroBody} />
            <span className={styles.heroBody} />
            <span className={styles.heroBodyShort} />
            <div className={styles.heroActionRow}>
              <span className={styles.heroActionPrimary} />
              <span className={styles.heroActionSecondary} />
            </div>
          </section>

          <section className={styles.metricGrid}>
            <span className={styles.metricCard} />
            <span className={styles.metricCard} />
            <span className={styles.metricCard} />
          </section>
        </main>
      </div>

      <span className={styles.srOnly}>Loading route content.</span>
    </div>
  );
}
