export async function getProduct(url: string, barcode: string) {
  const response = await fetch(`${url}/${barcode}`, {
    method: 'GET',
    headers: { Authorization: `Basic ${btoa('off:off')}` },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}
