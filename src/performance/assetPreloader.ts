import { assetsForGroup, type AssetGroup } from "./assetRegistry";

const loaded = new Set<string>();
const pending = new Map<string, Promise<void>>();

function preloadImage(src: string) {
  if (!src || loaded.has(src)) return Promise.resolve();
  const existing = pending.get(src);
  if (existing) return existing;
  const request = new Promise<void>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.loading = "eager";
    image.onload = () => {
      loaded.add(src);
      pending.delete(src);
      resolve();
    };
    image.onerror = () => {
      pending.delete(src);
      resolve();
    };
    image.src = src;
  });
  pending.set(src, request);
  return request;
}

export function preloadAssetGroup(group: AssetGroup) {
  return Promise.all(assetsForGroup(group).map(preloadImage));
}

export function schedulePreloadAssetGroup(group: AssetGroup) {
  const run = () => void preloadAssetGroup(group);
  if (typeof window === "undefined") return;
  const idle = (window as typeof window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number }).requestIdleCallback;
  if (idle) idle(run, { timeout: 1800 });
  else window.setTimeout(run, 300);
}
