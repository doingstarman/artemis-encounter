"use client";

import { useEffect, useMemo, useState } from "react";
import type { FlightPlanResponse, NewsResponse, TelemetryData, TelemetryResponse } from "@/lib/types";
import { resolveStageByProgress } from "@/lib/flight-plan";
import { inferProgressFromNews } from "@/lib/position-from-news";
import { calculateTelemetry } from "@/lib/telemetry";
import { FlightMap2D } from "@/components/mission-dashboard/FlightMap2D";
import { TelemetryHotbar } from "@/components/mission-dashboard/TelemetryHotbar";
import styles from "@/components/mission-dashboard/MissionDashboard.module.css";

type Props = {
  initialFlightPlan: FlightPlanResponse;
  initialNews: NewsResponse;
  initialTelemetry: TelemetryData;
  missionStartIso?: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return (await response.json()) as T;
}

// Artemis II: ~10-day free-return trajectory
const MISSION_DURATION_MS = 10 * 24 * 60 * 60 * 1000;
const REFRESH_INTERVAL_MS = 60_000;

// Derive map progress from live mission elapsed time.
// Returns null if no live data is available.
function progressFromElapsed(telemetry: TelemetryData): number | null {
  if (!telemetry.isLive || telemetry.missionElapsedMs === null) return null;
  return Math.min(0.98, telemetry.missionElapsedMs / MISSION_DURATION_MS);
}

export function MissionDashboard({
  initialFlightPlan,
  initialNews,
  initialTelemetry,
  missionStartIso,
}: Props) {
  const [flightPlan] = useState(initialFlightPlan);
  const [news, setNews] = useState(initialNews);
  const [telemetry, setTelemetry] = useState(initialTelemetry);

  // Priority: live elapsed time → news keywords → default launch position
  const liveProgress = useMemo(() => progressFromElapsed(telemetry), [telemetry]);
  const newsProgress = useMemo(() => inferProgressFromNews(news.items), [news.items]);
  const displayProgress = liveProgress ?? newsProgress ?? 0.05;
  const visibleTelemetry = useMemo(
    () => (telemetry.isLive ? telemetry : calculateTelemetry(displayProgress)),
    [displayProgress, telemetry],
  );

  const stage = useMemo(() => resolveStageByProgress(displayProgress), [displayProgress]);

  useEffect(() => {
    const refresh = async () => {
      try {
        const [freshNews, freshTelemetry] = await Promise.all([
          fetchJson<NewsResponse>("/api/missions/artemis-2/news"),
          fetchJson<TelemetryResponse>("/api/missions/artemis-2/telemetry"),
        ]);
        setNews(freshNews);
        setTelemetry(freshTelemetry.data);
      } catch {
        // silent — keep last known values
      }
    };
    const id = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <main className={styles.page}>
      <TelemetryHotbar telemetry={visibleTelemetry} missionStartIso={missionStartIso} />
      <div className={styles.mapArea}>
        <FlightMap2D
          trajectory={flightPlan.trajectory}
          progress={displayProgress}
          activeStageTitle={stage.title}
        />
      </div>
    </main>
  );
}
