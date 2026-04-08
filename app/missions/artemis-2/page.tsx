import { MissionDashboard } from "@/components/mission-dashboard/MissionDashboard";
import { getFlightPlan } from "@/lib/flight-plan";
import { fetchMissionNews } from "@/lib/nasa/news";
import { fetchArowTelemetry } from "@/lib/nasa/arow";
import { fetchHorizonsTelemetry } from "@/lib/nasa/horizons";
import { prelaunchTelemetry } from "@/lib/telemetry";
import { withLastKnownCache } from "@/lib/server-cache";
import type { NewsResponse } from "@/lib/types";

const MISSION_START_ISO = process.env.ARTEMIS2_LAUNCH_ISO ?? undefined;

export default async function Artemis2Page() {
  const flightPlan = getFlightPlan();

  const [newsResult, arowResult, horizonsResult] = await Promise.allSettled([
    withLastKnownCache("artemis-news", fetchMissionNews),
    fetchArowTelemetry(),
    fetchHorizonsTelemetry(),
  ]);

  const news: NewsResponse =
    newsResult.status === "fulfilled"
      ? { items: newsResult.value.data, fallback: newsResult.value.fallback, updatedAt: newsResult.value.updatedAt }
      : { items: [], fallback: true, updatedAt: new Date().toISOString() };

  const initialTelemetry =
    (arowResult.status === "fulfilled" && arowResult.value !== null)
      ? arowResult.value
      : (horizonsResult.status === "fulfilled" && horizonsResult.value !== null)
        ? horizonsResult.value
        : prelaunchTelemetry();

  return (
    <MissionDashboard
      initialFlightPlan={flightPlan}
      initialNews={news}
      initialTelemetry={initialTelemetry}
      missionStartIso={MISSION_START_ISO}
    />
  );
}
