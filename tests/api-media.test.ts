import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

const SAMPLE_NASA_IMAGES = {
  collection: {
    items: [
      {
        data: [
          {
            nasa_id: "art-img-1",
            title: "Artemis Launch Pad",
            description: "SLS rocket on the artemis launch pad at Kennedy Space Center",
            date_created: "2024-11-01T00:00:00Z",
          },
        ],
        links: [{ href: "https://images.nasa.gov/artemis-pad.jpg" }],
      },
    ],
  },
};

describe("GET /api/missions/artemis-2/media", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("returns 200 with items on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => SAMPLE_NASA_IMAGES,
      }),
    );

    const { GET } = await import("@/app/api/missions/artemis-2/media/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(body.items)).toBe(true);
    expect(body).toHaveProperty("fallback");
    expect(body).toHaveProperty("updatedAt");
  });

  it("returns 502 fallback on fetch failure (no cache)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network unavailable")),
    );

    const { GET } = await import("@/app/api/missions/artemis-2/media/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.fallback).toBe(true);
    expect(body.items).toEqual([]);
  });
});
