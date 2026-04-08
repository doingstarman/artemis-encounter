import { NextResponse } from "next/server";
import { fetchMissionMedia } from "@/lib/nasa/media";
import { withLastKnownCache } from "@/lib/server-cache";

export const revalidate = 1200;

export async function GET() {
  try {
    const result = await withLastKnownCache("artemis-media", fetchMissionMedia);

    return NextResponse.json({
      items: result.data,
      fallback: result.fallback,
      updatedAt: result.updatedAt,
    });
  } catch {
    return NextResponse.json(
      {
        items: [],
        fallback: true,
        updatedAt: new Date().toISOString(),
        error: "Медиа NASA временно недоступны",
      },
      { status: 502 },
    );
  }
}
