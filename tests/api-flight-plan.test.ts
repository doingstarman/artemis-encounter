import { describe, it, expect, vi } from "vitest";

// Mock next/server before importing the route
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

describe("GET /api/missions/artemis-2/flight-plan", () => {
  it("returns 200 with correct shape", async () => {
    const { GET } = await import("@/app/api/missions/artemis-2/flight-plan/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty("mission");
    expect(body).toHaveProperty("stages");
    expect(body).toHaveProperty("trajectory");
    expect(body).toHaveProperty("keyPoints");
    expect(body).toHaveProperty("updatedAt");
    expect(body).toHaveProperty("fallback", false);
  });

  it("trajectory has 180 points", async () => {
    const { GET } = await import("@/app/api/missions/artemis-2/flight-plan/route");
    const body = await (await GET()).json();
    expect(body.trajectory).toHaveLength(180);
  });

  it("returns 5 flight stages", async () => {
    const { GET } = await import("@/app/api/missions/artemis-2/flight-plan/route");
    const body = await (await GET()).json();
    expect(body.stages).toHaveLength(5);
  });

  it("mission has correct id", async () => {
    const { GET } = await import("@/app/api/missions/artemis-2/flight-plan/route");
    const body = await (await GET()).json();
    expect(body.mission.id).toBe("artemis-2");
    expect(body.mission.name).toBe("Artemis II");
  });
});
