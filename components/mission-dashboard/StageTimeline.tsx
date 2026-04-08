"use client";

import { ARTEMIS2_STAGES, getCurrentStageIndex, fmtTPlus } from "@/lib/artemis-stages";
import styles from "@/components/mission-dashboard/StageTimeline.module.css";

type Props = {
  missionElapsedMs: number | null;
};

export function StageTimeline({ missionElapsedMs }: Props) {
  const elapsed = missionElapsedMs ?? 0;
  const currentIdx = getCurrentStageIndex(elapsed);

  return (
    <nav className={styles.timeline} aria-label="Стадии миссии">
      <div className={styles.track}>
        {/* Connecting line */}
        <div className={styles.line} />

        {ARTEMIS2_STAGES.map((stage, i) => {
          const state =
            i < currentIdx ? "past" :
            i === currentIdx ? "current" :
            "future";

          return (
            <div key={stage.id} className={`${styles.stage} ${styles[state]}`}>
              <div className={styles.dot}>
                {state === "current" && <span className={styles.dotPulse} />}
              </div>
              <div className={styles.label}>{stage.label}</div>
              <div className={styles.time}>{fmtTPlus(stage.startMs)}</div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
