"use client";

import { useEffect, useState } from "react";
import type { TelemetryData } from "@/lib/types";
import styles from "@/components/mission-dashboard/TelemetryPanel.module.css";

type Props = {
  telemetry: TelemetryData;
  missionStartIso?: string;
};

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString("ru-RU", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const hms = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return d > 0 ? `T+${d}д ${hms}` : `T+${hms}`;
}

export function TelemetryPanel({ telemetry, missionStartIso }: Props) {
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  useEffect(() => {
    if (!missionStartIso) return;
    const start = new Date(missionStartIso).getTime();
    const tick = () => setElapsedMs(Date.now() - start);
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [missionStartIso]);

  const isActive = telemetry.source !== "prelaunch";

  const statusLabel =
    telemetry.source === "horizons"
      ? "ACTIVE · HORIZONS"
      : telemetry.source === "calculated"
      ? "ACTIVE · РАСЧЁТ"
      : "PRE-LAUNCH";

  return (
    <aside className={styles.panel}>
      <div className={styles.statusRow}>
        <span className={`${styles.statusDot} ${isActive ? styles.active : styles.prelaunch}`} />
        <span className={styles.statusLabel}>{statusLabel}</span>
      </div>

      {elapsedMs !== null && (
        <div className={styles.elapsed}>{fmtElapsed(elapsedMs)}</div>
      )}

      <dl className={styles.metrics}>
        <div className={styles.metric}>
          <dt className={styles.metricLabel}>Скорость</dt>
          <dd className={styles.metricValue}>
            {fmt(telemetry.speedKms, 2)}
            <span className={styles.unit}> км/с</span>
          </dd>
          <dd className={styles.metricSub}>{fmt(telemetry.speedKms * 3_600)} км/ч</dd>
        </div>

        <div className={styles.metric}>
          <dt className={styles.metricLabel}>Высота</dt>
          <dd className={styles.metricValue}>
            {fmt(telemetry.altitudeKm)}
            <span className={styles.unit}> км</span>
          </dd>
        </div>

        <div className={styles.metric}>
          <dt className={styles.metricLabel}>От Земли</dt>
          <dd className={styles.metricValue}>
            {fmt(telemetry.distanceFromEarthKm)}
            <span className={styles.unit}> км</span>
          </dd>
        </div>

        <div className={styles.metric}>
          <dt className={styles.metricLabel}>До Луны</dt>
          <dd className={styles.metricValue}>
            {fmt(telemetry.distanceFromMoonKm)}
            <span className={styles.unit}> км</span>
          </dd>
        </div>
      </dl>

      {telemetry.source === "calculated" && (
        <p className={styles.hint}>Данные рассчитаны по плановой траектории Artemis II.</p>
      )}

      {telemetry.source === "prelaunch" && (
        <p className={styles.hint}>
          Телеметрия будет обновляться автоматически. Убедитесь, что Horizons API отдаёт данные.
        </p>
      )}
    </aside>
  );
}
