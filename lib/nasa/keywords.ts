export const MISSION_KEYWORDS = ["artemis", "orion", "sls", "moon", "lunar"];

export function matchesMissionKeyword(text: string): boolean {
  const lowered = text.toLowerCase();
  return MISSION_KEYWORDS.some((kw) => lowered.includes(kw));
}
