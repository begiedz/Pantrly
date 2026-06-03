const REQUEST_TIMEOUT_MS = 10_000;

export async function apiGet<T>(url: string): Promise<T> {
  const controller = new AbortController();
  // limited request time so scanner and barcode fill flows can recover instead of leaving the ui waiting forever on a slow or stalled network call
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        // open food facts accepts the anonymous "off:off" credential pattern
        // sending it keeps requests compatible with their api rules
        Authorization: `Basic ${btoa('off:off')}`,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json().catch(() => {
      throw new Error('Request returned invalid JSON');
    });

    if (__DEV__) {
      console.debug('API response:', { url, data });
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
