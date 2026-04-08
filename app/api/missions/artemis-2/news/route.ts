import { NextResponse } from "next/server";
import { fetchMissionNews } from "@/lib/nasa/news";
import { withLastKnownCache } from "@/lib/server-cache";

export const revalidate = 1200;

export async function GET() {
  try {
    const result = await withLastKnownCache("artemis-news", fetchMissionNews);

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
        error: "Данные NASA временно недоступны",
      },
      { status: 502 },
    );
  }
}
