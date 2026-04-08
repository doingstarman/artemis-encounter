import type { TelemetryData } from "@/lib/types";

// AROW Community API — aggregates live NASA AROW telemetry, updated every ~5 min
// Source: artemis.jakobrosin.com tracker (orbit.json endpoint)
const ORBIT_URL =
  "https://pub-20e1dfbcc1004245b17572bf8e8be3a4.r2.dev/orbit.json";

const EARTH_RADIUS_KM = 6_371;

type OrbitJson = {
  metMs?: number;
  speedKmS?: number;
  speedKmH?: number;
  altitudeKm?: number;
  earthDistKm?: number;
  moonDistKm?: number;
  gForce?: number;
};

// Rough exterior spacecraft temperature estimate.
// Translunar / lunar orbit: mostly in shadow, ~-155°C.
// LEO altitudes: average -60°C.
function estimateTempC(altitudeKm: number): number {
  if (altitudeKm < 2_000) return Math.round(-60 - altitudeKm * 0.03);
  return -155;
}

export async function fetchArowTelemetry(): Promise<TelemetryData | null> {
  try {
    const res = await fetch(ORBIT_URL, {
      signal: AbortSignal.timeout(8_000),
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as OrbitJson;
    if (data.speedKmS === undefined || data.earthDistKm === undefined) {
      return null;
    }

    const altitudeKm = data.altitudeKm ?? Math.max(0, data.earthDistKm - EARTH_RADIUS_KM);

    return {
      speedKms: data.speedKmS,
      altitudeKm,
      distanceFromEarthKm: data.earthDistKm,
      distanceFromMoonKm: data.moonDistKm ?? 0,
      outsideTempC: estimateTempC(altitudeKm),
      gForce: data.gForce,
      missionElapsedMs: data.metMs ?? null,
      isLive: true,
      source: "arow",
    };
  } catch {
    return null;
  }
}
