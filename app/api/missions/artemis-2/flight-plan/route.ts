import { NextResponse } from "next/server";
import { getFlightPlan } from "@/lib/flight-plan";

export const revalidate = 1200;

export async function GET() {
  return NextResponse.json(getFlightPlan());
}
