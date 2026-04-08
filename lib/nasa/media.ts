import type { MissionMediaItem } from "@/lib/types";
import { fetchWithTimeout } from "@/lib/nasa/http";
import { matchesMissionKeyword } from "@/lib/nasa/keywords";

type NasaImageResponse = {
  collection?: {
    items?: Array<{
      data?: Array<{
        nasa_id?: string;
        title?: string;
        description?: string;
        date_created?: string;
      }>;
      links?: Array<{ href?: string }>;
    }>;
  };
};

export function includesKeyword(text: string): boolean {
  return matchesMissionKeyword(text);
}

export async function fetchMissionMedia(): Promise<MissionMediaItem[]> {
  const query = encodeURIComponent("Artemis Orion SLS Moon mission");
  const url = `https://images-api.nasa.gov/search?q=${query}&media_type=image&page=1`;
  const response = await fetchWithTimeout(url);
  const json = (await response.json()) as NasaImageResponse;

  const items = json.collection?.items ?? [];

  return items
    .flatMap((item): MissionMediaItem[] => {
      const data = item.data?.[0];
      const imageUrl = item.links?.[0]?.href;
      if (!data || !imageUrl) return [];

      const title = data.title ?? "NASA image";
      const description = data.description ?? "";
      if (!includesKeyword(`${title} ${description}`)) return [];

      return [{
        id: data.nasa_id ?? `${title}-${imageUrl}`,
        title,
        imageUrl,
        nasaUrl: `https://images.nasa.gov/details-${data.nasa_id}`,
        capturedAt: data.date_created,
      }];
    })
    .slice(0, 15);
}
