const CACHE_NAME = 'cm-audio-v1';
const blobUrls = new Map<string, string>();

export const canDownload = () => typeof caches !== 'undefined';

export async function cachedCount(urls: string[]): Promise<number> {
  if (!canDownload()) return 0;
  const cache = await caches.open(CACHE_NAME);
  let n = 0;
  for (const u of urls) {
    if (await cache.match(u)) n++;
  }
  return n;
}

export async function downloadAll(
  urls: string[],
  onProgress?: (done: number, total: number) => void,
): Promise<number> {
  const cache = await caches.open(CACHE_NAME);
  let done = 0;
  let ok = 0;
  for (const u of urls) {
    try {
      const res = await fetch(u);
      if (res.ok) {
        await cache.put(u, res);
        ok++;
      }
    } catch {
      continue;
    }
    onProgress?.(++done, urls.length);
  }
  return ok;
}

export async function resolveUrl(url: string): Promise<string> {
  if (!canDownload()) return url;
  const hit = await caches.match(url);
  if (!hit) return url;
  const prev = blobUrls.get(url);
  if (prev) return prev;
  const obj = URL.createObjectURL(await hit.blob());
  blobUrls.set(url, obj);
  return obj;
}

export async function clearAll(): Promise<void> {
  for (const u of blobUrls.values()) URL.revokeObjectURL(u);
  blobUrls.clear();
  if (canDownload()) await caches.delete(CACHE_NAME);
}
