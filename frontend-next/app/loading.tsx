import { cookies } from "next/headers";

import { MOTION_DELAY_MS } from "@/src/lib/motion/contracts";
import { createStaggerMotionStyle } from "@/src/lib/motion/style";
import { resolveThemePreferenceFromCookieValue, sharedThemeCookieName } from "@/src/lib/theme/sharedThemePreference";

import styles from "./RootLoadingPage.module.scss";

export default async function RootLoadingPage() {
  const cookieStore = await cookies();
  const theme = resolveThemePreferenceFromCookieValue(cookieStore.get(sharedThemeCookieName)?.value);
  const heroBaseDelayMs = MOTION_DELAY_MS.md;
  const metricBaseDelayMs = MOTION_DELAY_MS.xl;

  return (
    <div className={styles.page} data-testid="root-loading-page" data-theme={theme}>
      <div className={styles.shell} aria-hidden="true">
        <header className={styles.topbar}>
          <div className={styles.brandBlock}>
            <span className={styles.brandMark} style={createStaggerMotionStyle(0)} />
            <span className={styles.brandWordmark} style={createStaggerMotionStyle(1)} />
          </div>
          <div className={styles.topbarActions}>
            <span className={styles.actionChip} style={createStaggerMotionStyle(2)} />
            <span className={styles.actionChip} style={createStaggerMotionStyle(3)} />
            <span className={styles.actionChipShort} style={createStaggerMotionStyle(4)} />
          </div>
        </header>

        <main className={styles.content}>
          <section className={styles.heroPanel}>
            <span className={styles.heroKicker} style={createStaggerMotionStyle(0, { baseDelayMs: heroBaseDelayMs })} />
            <span className={styles.heroTitle} style={createStaggerMotionStyle(1, { baseDelayMs: heroBaseDelayMs })} />
            <span className={styles.heroTitleShort} style={createStaggerMotionStyle(2, { baseDelayMs: heroBaseDelayMs })} />
            <span className={styles.heroBody} style={createStaggerMotionStyle(3, { baseDelayMs: heroBaseDelayMs })} />
            <span className={styles.heroBody} style={createStaggerMotionStyle(4, { baseDelayMs: heroBaseDelayMs })} />
            <span className={styles.heroBodyShort} style={createStaggerMotionStyle(5, { baseDelayMs: heroBaseDelayMs })} />
            <div className={styles.heroActionRow}>
              <span
                className={styles.heroActionPrimary}
                style={createStaggerMotionStyle(6, { baseDelayMs: heroBaseDelayMs })}
              />
              <span
                className={styles.heroActionSecondary}
                style={createStaggerMotionStyle(7, { baseDelayMs: heroBaseDelayMs })}
              />
            </div>
          </section>

          <section className={styles.metricGrid}>
            <span className={styles.metricCard} style={createStaggerMotionStyle(0, { baseDelayMs: metricBaseDelayMs })} />
            <span className={styles.metricCard} style={createStaggerMotionStyle(1, { baseDelayMs: metricBaseDelayMs })} />
            <span className={styles.metricCard} style={createStaggerMotionStyle(2, { baseDelayMs: metricBaseDelayMs })} />
          </section>
        </main>
      </div>

      <span className={styles.srOnly}>Loading route content.</span>
    </div>
  );
}
