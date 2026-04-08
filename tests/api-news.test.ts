import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

const SAMPLE_RSS = `
<rss><channel>
  <item>
    <title>Artemis II launch update</title>
    <description>Mission status for Artemis II lunar flyby.</description>
    <link>https://www.nasa.gov/artemis2</link>
    <pubDate>Wed, 01 Jan 2025 12:00:00 GMT</pubDate>
    <guid>guid-a2-001</guid>
  </item>
</channel></rss>
`;

describe("GET /api/missions/artemis-2/news", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("returns 200 with items on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => SAMPLE_RSS,
      }),
    );

    const { GET } = await import("@/app/api/missions/artemis-2/news/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty("items");
    expect(Array.isArray(body.items)).toBe(true);
    expect(body).toHaveProperty("fallback");
    expect(body).toHaveProperty("updatedAt");
  });

  it("returns fallback on fetch failure (no cache)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    const { GET } = await import("@/app/api/missions/artemis-2/news/route");
    const response = await GET();
    const body = await response.json();

    // When cache is empty and fetch fails, route returns 502
    expect(response.status).toBe(502);
    expect(body.fallback).toBe(true);
    expect(body.items).toEqual([]);
  });
});
