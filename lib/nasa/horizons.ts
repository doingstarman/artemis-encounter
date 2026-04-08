import type { TelemetryData } from "@/lib/types";

const ORION_ID = "-1024"; // Artemis II Orion EM-2 (NAIF spacecraft ID)
const MOON_ID = "301";
const EARTH_RADIUS_KM = 6_371;

type Vec3 = { x: number; y: number; z: number };

function parseVec3(text: string): Vec3 | null {
  const soe = text.indexOf("$$SOE");
  const eoe = text.indexOf("$$EOE");
  if (soe === -1 || eoe === -1) return null;

  const block = text.slice(soe + 5, eoe).trim();
  if (!block) return null;

  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;

  // Horizons VECTORS format: line after timestamp has X= Y= Z=
  for (const line of lines) {
    const m = line.match(/X\s*=\s*([-\d.E+]+)\s+Y\s*=\s*([-\d.E+]+)\s+Z\s*=\s*([-\d.E+]+)/i);
    if (m) return { x: parseFloat(m[1]), y: parseFloat(m[2]), z: parseFloat(m[3]) };
  }
  return null;
}

function parseVelocity(text: string): Vec3 | null {
  const soe = text.indexOf("$$SOE");
  const eoe = text.indexOf("$$EOE");
  if (soe === -1 || eoe === -1) return null;

  const block = text.slice(soe + 5, eoe).trim();
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const m = line.match(/VX\s*=\s*([-\d.E+]+)\s+VY\s*=\s*([-\d.E+]+)\s+VZ\s*=\s*([-\d.E+]+)/i);
    if (m) return { x: parseFloat(m[1]), y: parseFloat(m[2]), z: parseFloat(m[3]) };
  }
  return null;
}

function magnitude(v: Vec3): number {
  return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
}

function fmtDate(d: Date): string {
  return (
    `${d.getUTCFullYear()}-` +
    `${String(d.getUTCMonth() + 1).padStart(2, "0")}-` +
    `${String(d.getUTCDate()).padStart(2, "0")} ` +
    `${String(d.getUTCHours()).padStart(2, "0")}:` +
    `${String(d.getUTCMinutes()).padStart(2, "0")}`
  );
}

async function queryHorizons(command: string, start: Date, stop: Date): Promise<string> {
  const params = new URLSearchParams({
    format: "text",
    COMMAND: command,
    OBJ_DATA: "NO",
    MAKE_EPHEM: "YES",
    EPHEM_TYPE: "VECTORS",
    CENTER: "500@399",       // geocenter
    START_TIME: fmtDate(start),
    STOP_TIME: fmtDate(stop),
    STEP_SIZE: "1m",
    OUT_UNITS: "KM-S",
    CSV_FORMAT: "NO",
  });

  const res = await fetch(`https://ssd.jpl.nasa.gov/api/horizons.api?${params}`, {
    signal: AbortSignal.timeout(12_000),
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`Horizons HTTP ${res.status}`);
  return res.text();
}

export async function fetchHorizonsTelemetry(): Promise<TelemetryData | null> {
  try {
    const now = new Date();
    const start = new Date(now.getTime() - 60_000);
    const stop = new Date(now.getTime() + 60_000);

    // Query spacecraft and Moon in parallel
    const [shipText, moonText] = await Promise.all([
      queryHorizons(ORION_ID, start, stop),
      queryHorizons(MOON_ID, start, stop),
    ]);

    // Spacecraft not yet tracked (pre-launch or API gap)
    if (!shipText.includes("$$SOE")) return null;

    const shipPos = parseVec3(shipText);
    const shipVel = parseVelocity(shipText);
    if (!shipPos || !shipVel) return null;

    const distanceFromEarthKm = magnitude(shipPos);
    const speedKms = magnitude(shipVel);
    const altitudeKm = Math.max(0, distanceFromEarthKm - EARTH_RADIUS_KM);

    // Use real Moon position if available, otherwise approximate
    let distanceFromMoonKm: number;
    const moonPos = moonText.includes("$$SOE") ? parseVec3(moonText) : null;
    if (moonPos) {
      const dx = shipPos.x - moonPos.x;
      const dy = shipPos.y - moonPos.y;
      const dz = shipPos.z - moonPos.z;
      distanceFromMoonKm = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
    } else {
      // Rough fallback: Moon distance varies 356k–407k km from Earth center
      distanceFromMoonKm = Math.max(0, 384_400 - distanceFromEarthKm);
    }

    // Rough exterior temperature: cold in translunar space, varies near Earth
    const outsideTempC = altitudeKm < 2_000
      ? Math.round(-60 - altitudeKm * 0.03)
      : -155;

    return {
      speedKms,
      altitudeKm,
      distanceFromEarthKm,
      distanceFromMoonKm,
      outsideTempC,
      missionElapsedMs: null,
      isLive: true,
      source: "horizons",
    };
  } catch {
    return null;
  }
}
