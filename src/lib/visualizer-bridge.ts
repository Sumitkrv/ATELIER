/**
 * Non-Destructive Integration Bridge to the standalone `Wall-Priyanka` WebGL Visualizer.
 *
 * Inspection of `/Users/sumitthakur/Desktop/Wall- Priyanka/wall vision/lib/imageProcessing.ts`
 * established that `Wall-Priyanka` reads its active design on `/visualizer` mount from:
 *   1. IndexedDB database: `"wallvision_store_v1"` -> store `"active_assets"` -> key `"wallvision_active_wallpaper"`
 *   2. Fallback `window.sessionStorage` key: `"wallvision_active_wallpaper_session"`
 *
 * By writing this exact `WallVisionAssetPayload` structure before navigating or opening
 * the visualizer, any design selected in `/explore-designs` is handed off without
 * modifying a single file inside `/Users/sumitthakur/Desktop/Wall- Priyanka`.
 */

export interface WallVisionAssetPayload {
  id: string;
  name: string;
  category?: string;
  /** Data URL, Object URL, or CORS-compatible image URL (e.g., Cloudinary) */
  dataUrl: string;
  width: number;
  height: number;
  fileSize?: number;
  mimeType: string;
  isSample?: boolean;
  defaultMode?: "mural" | "pattern";
  description?: string;
}

const IDB_NAME = "wallvision_store_v1";
const IDB_STORE = "active_assets";
const ACTIVE_WALLPAPER_KEY = "wallvision_active_wallpaper";
const SESSION_FALLBACK_KEY = "wallvision_active_wallpaper_session";

function openWallVisionIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("IndexedDB not available in this environment."));
      return;
    }
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Stages a selected design into `sessionStorage` and IndexedDB using the exact keys
 * expected by `Wall-Priyanka/wall vision`.
 */
export async function stageDesignForWallVisualizer(
  payload: WallVisionAssetPayload
): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      SESSION_FALLBACK_KEY,
      JSON.stringify(payload)
    );
  } catch {
    // Ignore sessionStorage quota issues
  }

  try {
    const db = await openWallVisionIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      const store = tx.objectStore(IDB_STORE);
      store.put(payload, ACTIVE_WALLPAPER_KEY);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    // Fallback to sessionStorage if IndexedDB is blocked
  }
}

/**
 * Reads any staged design payload from `sessionStorage` on the bridge page.
 */
export function readStagedDesignFromSession(): WallVisionAssetPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_FALLBACK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WallVisionAssetPayload;
    return parsed && parsed.name ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Builds the internal bridge URL (`/visualizer`) with query context for the selected design.
 */
export function buildVisualizerBridgeHref(options?: {
  designSlug?: string;
  designTitle?: string;
  categorySlot?: number;
  mode?: "camera" | "photo";
}): string {
  const params = new URLSearchParams();
  if (options?.designSlug) params.set("design", options.designSlug);
  if (options?.designTitle) params.set("title", options.designTitle);
  if (options?.categorySlot) params.set("slot", String(options.categorySlot));
  if (options?.mode) params.set("mode", options.mode);
  const qs = params.toString();
  return qs ? `/visualizer?${qs}` : "/visualizer";
}

