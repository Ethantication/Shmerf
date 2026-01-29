export async function fetchJson<T>(url: string, init?: RequestInit, retries = 3): Promise<T> {
  let attempt = 0;
  let lastError: Error | null = null;
  while (attempt < retries) {
    try {
      const response = await fetch(url, init);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      lastError = error as Error;
      await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, attempt)));
      attempt += 1;
    }
  }
  throw lastError ?? new Error(`Failed to fetch ${url}`);
}

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}
