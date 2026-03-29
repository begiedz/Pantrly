export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${btoa('off:off')}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
