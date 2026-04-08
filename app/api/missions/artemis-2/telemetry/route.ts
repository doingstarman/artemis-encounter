import { NextResponse } from "next/server";
import { fetchArowTelemetry } from "@/lib/nasa/arow";
import { fetchHorizonsTelemetry } from "@/lib/nasa/horizons";
import { prelaunchTelemetry } from "@/lib/telemetry";

export const revalidate = 60;

export async function GET() {
  // Priority 1: AROW Community API (live, 5-min granularity, richest data)
  const arow = await fetchArowTelemetry();
  if (arow) {
    return NextResponse.json({ data: arow, updatedAt: new Date().toISOString(), fallback: false });
  }

  // Priority 2: JPL Horizons (live vectors, post-launch only)
  const horizons = await fetchHorizonsTelemetry();
  if (horizons) {
    return NextResponse.json({ data: horizons, updatedAt: new Date().toISOString(), fallback: false });
  }

  // Fallback: pre-launch zeros
  return NextResponse.json({ data: prelaunchTelemetry(), updatedAt: new Date().toISOString(), fallback: true });
}
