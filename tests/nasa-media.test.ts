import { describe, it, expect, vi, beforeEach } from "vitest";
import { includesKeyword } from "@/lib/nasa/media";

describe("includesKeyword", () => {
  it("returns true for 'artemis'", () => {
    expect(includesKeyword("Artemis II launch")).toBe(true);
  });

  it("returns true for 'orion'", () => {
    expect(includesKeyword("Orion capsule test")).toBe(true);
  });

  it("returns true for 'sls'", () => {
    expect(includesKeyword("SLS rocket static fire")).toBe(true);
  });

  it("returns true for 'moon'", () => {
    expect(includesKeyword("Moon surface imagery")).toBe(true);
  });

  it("returns true for 'lunar'", () => {
    expect(includesKeyword("Lunar reconnaissance orbiter")).toBe(true);
  });

  it("returns false for unrelated text", () => {
    expect(includesKeyword("Mars Perseverance rover")).toBe(false);
    expect(includesKeyword("International Space Station")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(includesKeyword("ARTEMIS MISSION")).toBe(true);
    expect(includesKeyword("LUNAR GATEWAY")).toBe(true);
  });
});

describe("fetchMissionMedia", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("filters out items without image links", async () => {
    const mockResponse = {
      collection: {
        items: [
          {
            data: [{ nasa_id: "id-1", title: "Artemis Launch", description: "artemis launch" }],
            links: [], // no link
          },
          {
            data: [{ nasa_id: "id-2", title: "Orion Test", description: "orion capsule test" }],
            links: [{ href: "https://images.nasa.gov/img.jpg" }],
          },
        ],
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      }),
    );

    const { fetchMissionMedia } = await import("@/lib/nasa/media");
    const items = await fetchMissionMedia();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("id-2");
  });

  it("filters out items without matching keywords", async () => {
    const mockResponse = {
      collection: {
        items: [
          {
            data: [{ nasa_id: "mars-1", title: "Mars surface", description: "perseverance data" }],
            links: [{ href: "https://images.nasa.gov/mars.jpg" }],
          },
          {
            data: [{ nasa_id: "art-1", title: "Artemis crew", description: "artemis II mission" }],
            links: [{ href: "https://images.nasa.gov/crew.jpg" }],
          },
        ],
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      }),
    );

    const { fetchMissionMedia } = await import("@/lib/nasa/media");
    const items = await fetchMissionMedia();
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("Artemis crew");
  });

  it("maps item to correct MissionMediaItem shape", async () => {
    const mockResponse = {
      collection: {
        items: [
          {
            data: [
              {
                nasa_id: "art-42",
                title: "Artemis II Crew Portrait",
                description: "The artemis crew",
                date_created: "2024-12-01T00:00:00Z",
              },
            ],
            links: [{ href: "https://images.nasa.gov/portrait.jpg" }],
          },
        ],
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      }),
    );

    const { fetchMissionMedia } = await import("@/lib/nasa/media");
    const items = await fetchMissionMedia();
    expect(items[0]).toMatchObject({
      id: "art-42",
      title: "Artemis II Crew Portrait",
      imageUrl: "https://images.nasa.gov/portrait.jpg",
      nasaUrl: "https://images.nasa.gov/details-art-42",
      capturedAt: "2024-12-01T00:00:00Z",
    });
  });
});
