"use client";

import { useEffect, useState } from "react";
import type { TelemetryData } from "@/lib/types";
import styles from "@/components/mission-dashboard/TelemetryHotbar.module.css";

type Props = {
  telemetry: TelemetryData;
  missionStartIso?: string;
};

const LIGHT_SPEED_KMS = 299_792;

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

export function TelemetryHotbar({ telemetry, missionStartIso }: Props) {
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
    telemetry.source === "arow" ? "AROW · LIVE" :
    telemetry.source === "horizons" ? "HORIZONS · LIVE" :
    telemetry.source === "calculated" ? "РАСЧЁТ" :
    "PRE-LAUNCH";

  const signalDelaySec = telemetry.distanceFromEarthKm / LIGHT_SPEED_KMS;

  return (
    <aside className={styles.hotbar}>
      <a
        href="https://plus.nasa.gov/scheduled-video/artemis-ii-mission-coverage/"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.liveLink}
      >
        <span className={styles.liveLinkDot} />
        NASA Live Coverage
      </a>

      <div className={styles.top}>
        <div className={styles.statusRow}>
          <span className={`${styles.dot} ${isActive ? styles.dotActive : styles.dotInactive}`} />
          <span className={styles.statusLabel}>{statusLabel}</span>
        </div>
        {elapsedMs !== null && (
          <div className={styles.elapsed}>{fmtElapsed(elapsedMs)}</div>
        )}
      </div>

      <div className={styles.metrics}>
        <Metric label="Скорость" value={fmt(telemetry.speedKms, 2)} unit="км/с" sub={`${fmt(telemetry.speedKms * 3_600)} км/ч`} />
        <Metric label="Высота" value={fmt(telemetry.altitudeKm)} unit="км" />
        <Metric label="От Земли" value={fmt(telemetry.distanceFromEarthKm)} unit="км" />
        <Metric label="До Луны" value={fmt(telemetry.distanceFromMoonKm)} unit="км" />
        <Metric label="Темп. за бортом" value={fmt(telemetry.outsideTempC, 0)} unit="°C" accent={telemetry.outsideTempC < -100 ? "cold" : telemetry.outsideTempC > 500 ? "hot" : undefined} />
        <Metric label="Задержка сигнала" value={fmt(signalDelaySec, 3)} unit="с" />
        {telemetry.gForce !== undefined && (
          <Metric label="Перегрузка" value={fmt(telemetry.gForce, 4)} unit="g" />
        )}
      </div>
    </aside>
  );
}

function Metric({
  label, value, unit, sub, accent,
}: {
  label: string;
  value: string;
  unit: string;
  sub?: string;
  accent?: "cold" | "hot";
}) {
  return (
    <div className={styles.metric}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={`${styles.metricValue} ${accent ? styles[accent] : ""}`}>
        {value}<span className={styles.unit}> {unit}</span>
      </span>
      {sub && <span className={styles.metricSub}>{sub}</span>}
    </div>
  );
}
