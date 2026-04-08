import { describe, it, expect } from "vitest";
import { parseRssItems, isRelevant } from "@/lib/nasa/news";

const MINIMAL_RSS = `
<rss>
  <channel>
    <item>
      <title>Artemis II crew completes training</title>
      <description>The crew of Artemis II has finished lunar orbit simulation training.</description>
      <link>https://www.nasa.gov/artemis-ii-training</link>
      <pubDate>Wed, 01 Jan 2025 12:00:00 GMT</pubDate>
      <guid>guid-artemis-001</guid>
    </item>
    <item>
      <title>Mars rover finds new rock samples</title>
      <description>Perseverance rover discovers interesting formations.</description>
      <link>https://www.nasa.gov/mars-rover</link>
      <pubDate>Tue, 31 Dec 2024 12:00:00 GMT</pubDate>
      <guid>guid-mars-001</guid>
    </item>
  </channel>
</rss>
`;

const CDATA_RSS = `
<rss>
  <channel>
    <item>
      <title><![CDATA[Orion capsule & SLS: Mission Update]]></title>
      <description><![CDATA[<p>The <strong>Orion</strong> capsule is ready.</p>]]></description>
      <link>https://www.nasa.gov/orion-update</link>
      <pubDate>Mon, 30 Dec 2024 10:00:00 GMT</pubDate>
      <guid>guid-orion-001</guid>
    </item>
  </channel>
</rss>
`;

describe("parseRssItems", () => {
  it("parses standard item fields", () => {
    const items = parseRssItems(MINIMAL_RSS, "NASA");
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe("Artemis II crew completes training");
    expect(items[0].link).toBe("https://www.nasa.gov/artemis-ii-training");
    expect(items[0].source).toBe("NASA");
    expect(items[0].id).toBe("guid-artemis-001");
  });

  it("decodes CDATA sections", () => {
    const items = parseRssItems(CDATA_RSS, "NASA");
    expect(items[0].title).toBe("Orion capsule & SLS: Mission Update");
  });

  it("strips HTML tags from description in CDATA", () => {
    const items = parseRssItems(CDATA_RSS, "NASA");
    expect(items[0].summary).not.toContain("<p>");
    expect(items[0].summary).not.toContain("<strong>");
    expect(items[0].summary).toContain("Orion");
  });

  it("decodes HTML entities", () => {
    const items = parseRssItems(CDATA_RSS, "NASA");
    expect(items[0].title).toContain("&");
  });

  it("returns empty array for empty xml", () => {
    expect(parseRssItems("<rss></rss>", "NASA")).toHaveLength(0);
  });

  it("falls back to generated id when guid is missing", () => {
    const xml = `
      <rss><channel>
        <item>
          <title>Test</title>
          <link>https://example.com</link>
          <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
        </item>
      </channel></rss>
    `;
    const items = parseRssItems(xml, "NASA");
    expect(items[0].id).toContain("NASA");
  });
});

describe("isRelevant", () => {
  const makeItem = (title: string, summary = "") => ({
    id: "x",
    title,
    summary,
    link: "https://nasa.gov",
    publishedAt: "",
    source: "NASA",
  });

  it("returns true for 'artemis' in title", () => {
    expect(isRelevant(makeItem("Artemis II mission update"))).toBe(true);
  });

  it("returns true for 'orion' in title", () => {
    expect(isRelevant(makeItem("Orion capsule ready"))).toBe(true);
  });

  it("returns true for 'sls' in title", () => {
    expect(isRelevant(makeItem("SLS rocket integration complete"))).toBe(true);
  });

  it("returns true for 'moon' in summary only", () => {
    expect(isRelevant(makeItem("NASA Update", "New moon mission details"))).toBe(true);
  });

  it("returns true for 'lunar' keyword", () => {
    expect(isRelevant(makeItem("Lunar orbit achieved"))).toBe(true);
  });

  it("returns false for unrelated content", () => {
    expect(isRelevant(makeItem("Mars rover discovers water"))).toBe(false);
    expect(isRelevant(makeItem("Webb telescope images galaxy"))).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isRelevant(makeItem("ARTEMIS LAUNCH"))).toBe(true);
    expect(isRelevant(makeItem("", "LUNAR orbit"))).toBe(true);
  });
});
