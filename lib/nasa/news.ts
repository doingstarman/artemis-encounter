import type { MissionNewsItem } from "@/lib/types";
import { fetchWithTimeout } from "@/lib/nasa/http";
import { matchesMissionKeyword } from "@/lib/nasa/keywords";

const RSS_FEEDS = [
  "https://www.nasa.gov/rss/dyn/breaking_news.rss",
  "https://www.nasa.gov/rss/dyn/lg_image_of_the_day.rss",
  "https://www.nasa.gov/feed/",
];

function decodeXml(input: string): string {
  return input
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function getTagValue(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

export function parseRssItems(xml: string, source: string): MissionNewsItem[] {
  const matches = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

  return matches
    .map((itemXml, index) => {
      const title = getTagValue(itemXml, "title");
      const summary = getTagValue(itemXml, "description");
      const link = getTagValue(itemXml, "link");
      const publishedAt = getTagValue(itemXml, "pubDate");
      const id = getTagValue(itemXml, "guid") || `${source}-${index}-${link}`;

      return {
        id,
        title,
        link,
        publishedAt,
        summary,
        source,
      } satisfies MissionNewsItem;
    })
    .filter((item) => item.title || item.summary);
}

export function isRelevant(item: MissionNewsItem): boolean {
  return matchesMissionKeyword(`${item.title} ${item.summary}`);
}

export async function fetchMissionNews(): Promise<MissionNewsItem[]> {
  const batches = await Promise.all(
    RSS_FEEDS.map(async (feedUrl) => {
      const response = await fetchWithTimeout(feedUrl);
      const xml = await response.text();
      return parseRssItems(xml, "NASA");
    }),
  );

  const seen = new Set<string>();
  return batches
    .flat()
    .filter((item) => item.link)
    .filter((item) => {
      if (seen.has(item.link)) return false;
      seen.add(item.link);
      return true;
    })
    .filter(isRelevant)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 18);
}
