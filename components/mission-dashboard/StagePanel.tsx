import type { Mission, FlightStage } from "@/lib/types";
import { FLIGHT_STAGES } from "@/lib/flight-plan";
import styles from "@/components/mission-dashboard/StagePanel.module.css";

type Props = {
  mission: Mission;
  stage: FlightStage;
};

export function StagePanel({ mission, stage }: Props) {
  const activeIndex = FLIGHT_STAGES.findIndex((s) => s.id === stage.id);

  return (
    <aside className={styles.panel}>
      <div>
        <p className={styles.label}>Текущая стадия</p>
        <h2>{stage.title}</h2>
      </div>

      <div className={styles.stageTrack}>
        {FLIGHT_STAGES.map((s, i) => (
          <div
            key={s.id}
            className={`${styles.trackStep} ${i < activeIndex ? styles.done : ""} ${i === activeIndex ? styles.current : ""}`}
          >
            <div className={styles.trackDot} />
            <span className={styles.trackLabel}>{s.title}</span>
          </div>
        ))}
      </div>

      <p className={styles.description}>{stage.description}</p>
      <p className={styles.eta}>{stage.eta}</p>

      <dl className={styles.meta}>
        <div>
          <dt>Фокус</dt>
          <dd>{mission.focus}</dd>
        </div>
        <div>
          <dt>Старт</dt>
          <dd>{mission.launchWindow}</dd>
        </div>
        <div>
          <dt>Экипаж</dt>
          <dd>{mission.crew.join(" · ")}</dd>
        </div>
      </dl>
    </aside>
  );
}
