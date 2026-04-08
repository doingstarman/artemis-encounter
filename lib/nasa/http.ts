const DEFAULT_TIMEOUT_MS = 12_000;

export async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      next: { revalidate: 1200, ...(init?.next ?? {}) },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}
