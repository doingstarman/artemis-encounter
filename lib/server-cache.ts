type CacheEntry<T> = {
  data: T;
  updatedAt: string;
};

const runtimeCache = new Map<string, CacheEntry<unknown>>();

export async function withLastKnownCache<T>(
  key: string,
  loader: () => Promise<T>,
): Promise<{ data: T; fallback: boolean; updatedAt: string }> {
  try {
    const data = await loader();
    const updatedAt = new Date().toISOString();
    runtimeCache.set(key, { data, updatedAt });
    return { data, fallback: false, updatedAt };
  } catch (error) {
    const existing = runtimeCache.get(key) as CacheEntry<T> | undefined;
    if (existing) {
      return { data: existing.data, fallback: true, updatedAt: existing.updatedAt };
    }

    throw error;
  }
}
