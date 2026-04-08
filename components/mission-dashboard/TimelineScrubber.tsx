import type { FlightStage } from "@/lib/types";
import styles from "@/components/mission-dashboard/TimelineScrubber.module.css";

type Props = {
  progress: number;
  onChange: (value: number) => void;
  stages: FlightStage[];
  disabled?: boolean;
};

export function TimelineScrubber({ progress, onChange, stages, disabled = false }: Props) {
  return (
    <div className={styles.wrap}>
      <input
        className={styles.slider}
        type="range"
        min={0}
        max={1000}
        step={1}
        value={Math.round(progress * 1000)}
        onChange={(event) => onChange(Number(event.target.value) / 1000)}
        disabled={disabled}
      />

      <div className={styles.stages}>
        {stages.map((stage) => {
          const stageCenter = (stage.startProgress + stage.endProgress) / 2;
          const isActive = progress >= stage.startProgress && progress <= stage.endProgress;

          return (
            <button
              type="button"
              className={`${styles.stageButton} ${isActive ? styles.active : ""}`.trim()}
              key={stage.id}
              onClick={() => onChange(stageCenter)}
            >
              {stage.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
