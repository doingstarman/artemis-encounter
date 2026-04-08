import type { MissionNewsItem } from "@/lib/types";

// Map news keywords to approximate mission progress values.
// Ordered from latest mission phase to earliest so the first match wins
// (latest news is most representative of current state).
const PHASE_RULES: { pattern: RegExp; progress: number }[] = [
  { pattern: /splashdown|recovery|landed|retrieved/i,       progress: 0.98 },
  { pattern: /reentry|re-entry|atmospheric|decelerat/i,     progress: 0.92 },
  { pattern: /return|homeward|heading back|earth bound/i,   progress: 0.78 },
  { pattern: /lunar flyby|flyby|closest approach|perilune/i, progress: 0.52 },
  { pattern: /lunar orbit|moon orbit|loi|lunar insertion/i, progress: 0.48 },
  { pattern: /translunar|tli|trans-lunar|injection burn/i,  progress: 0.25 },
  { pattern: /liftoff|launched|launch|liftoff|ascent|orbit insertion/i, progress: 0.05 },
];

export function inferProgressFromNews(items: MissionNewsItem[]): number | null {
  // Only look at the 5 most recent items — older news isn't indicative of current phase
  const recent = items.slice(0, 5);

  for (const item of recent) {
    const text = `${item.title} ${item.summary}`;
    for (const rule of PHASE_RULES) {
      if (rule.pattern.test(text)) {
        return rule.progress;
      }
    }
  }

  return null;
}
