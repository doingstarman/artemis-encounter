import type { TelemetryData } from "@/lib/types";

// Reference points derived from Artemis I actual telemetry profile.
// Each entry: [progress, speedKms, altitudeKm, distanceFromEarthKm, distanceFromMoonKm, outsideTempC]
const PROFILE: [number, number, number, number, number, number][] = [
  [0.00,  0.0,      0,        6_371,   384_400,    20],
  [0.05,  7.9,    185,        6_556,   384_215,   -60],
  [0.18, 10.4,  1_800,        8_171,   382_600,  -120],
  [0.43,  5.4, 383_000,     389_371,     8_900,  -160],
  [0.50,  5.2, 384_400,     390_771,     8_000,  -165],
  [0.57,  5.4, 380_000,     386_371,    10_000,  -160],
  [0.67,  5.8, 370_000,     376_371,    20_000,  -155],
  [0.92, 10.9,  12_000,      18_371,   372_400, 1_700],
  [1.00, 11.1,      0,        6_371,   384_400,    25],
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function calculateTelemetry(progress: number): TelemetryData {
  const clamped = Math.max(0, Math.min(1, progress));

  let lo = PROFILE[0];
  let hi = PROFILE[PROFILE.length - 1];

  for (let i = 0; i < PROFILE.length - 1; i++) {
    if (clamped >= PROFILE[i][0] && clamped <= PROFILE[i + 1][0]) {
      lo = PROFILE[i];
      hi = PROFILE[i + 1];
      break;
    }
  }

  const span = hi[0] - lo[0];
  const t = span === 0 ? 0 : (clamped - lo[0]) / span;

  return {
    speedKms: lerp(lo[1], hi[1], t),
    altitudeKm: lerp(lo[2], hi[2], t),
    distanceFromEarthKm: lerp(lo[3], hi[3], t),
    distanceFromMoonKm: lerp(lo[4], hi[4], t),
    outsideTempC: lerp(lo[5], hi[5], t),
    missionElapsedMs: null,
    isLive: false,
    source: "calculated",
  };
}

// Returns TelemetryData for the pre-launch state (on-pad).
export function prelaunchTelemetry(): TelemetryData {
  return {
    speedKms: 0,
    altitudeKm: 0,
    distanceFromEarthKm: 6_371,
    distanceFromMoonKm: 384_400,
    outsideTempC: 20,
    missionElapsedMs: null,
    isLive: false,
    source: "prelaunch",
  };
}
