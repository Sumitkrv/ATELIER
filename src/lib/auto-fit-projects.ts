import { WallPoint, WallQuad } from "@/lib/wall-auto-fit";

const DATABASE_NAME = "atelier_wall_auto_fit_v1";
const DATABASE_VERSION = 1;
const PROJECTS_STORE = "projects";
const ASSETS_STORE = "assets";

export interface AutoFitProjectMeta {
  id: string;
  savedAt: string;
  roomName: string;
  artworkName: string;
  designSlug: string | null;
  artworkUrl: string | null;
  corners: WallQuad;
  mode: "cover" | "contain" | "repeat";
  scale: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
  lighting: number;
  protectionStrokes?: Array<{ points: WallPoint[]; width: number }>;
}

interface AutoFitProjectAssets {
  id: string;
  roomBlob: Blob;
  artworkBlob: Blob | null;
}

export interface AutoFitProjectRecord extends AutoFitProjectMeta {
  roomBlob: Blob;
  artworkBlob: Blob | null;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("Local project storage is unavailable in this browser."));
      return;
    }
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PROJECTS_STORE)) {
        database.createObjectStore(PROJECTS_STORE, { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains(ASSETS_STORE)) {
        database.createObjectStore(ASSETS_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open local project storage."));
  });
}

function transactionDone(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Could not save the project."));
    transaction.onabort = () => reject(transaction.error || new Error("Project save was interrupted."));
  });
}

export async function saveAutoFitProject(
  meta: AutoFitProjectMeta,
  assets: Omit<AutoFitProjectAssets, "id">
) {
  const database = await openDatabase();
  try {
    const transaction = database.transaction([PROJECTS_STORE, ASSETS_STORE], "readwrite");
    transaction.objectStore(PROJECTS_STORE).put(meta);
    transaction.objectStore(ASSETS_STORE).put({ id: meta.id, ...assets });
    await transactionDone(transaction);

    const stored = await listAutoFitProjects();
    const expired = stored
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
      .slice(8);
    if (expired.length) {
      const cleanup = database.transaction([PROJECTS_STORE, ASSETS_STORE], "readwrite");
      for (const project of expired) {
        cleanup.objectStore(PROJECTS_STORE).delete(project.id);
        cleanup.objectStore(ASSETS_STORE).delete(project.id);
      }
      await transactionDone(cleanup);
    }
  } finally {
    database.close();
  }
}

export async function listAutoFitProjects(): Promise<AutoFitProjectMeta[]> {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(PROJECTS_STORE, "readonly");
      const request = transaction.objectStore(PROJECTS_STORE).getAll();
      request.onsuccess = () =>
        resolve((request.result as AutoFitProjectMeta[]).sort((a, b) => b.savedAt.localeCompare(a.savedAt)));
      request.onerror = () => reject(request.error || new Error("Could not read saved projects."));
    });
  } finally {
    database.close();
  }
}

export async function loadAutoFitProject(id: string): Promise<AutoFitProjectRecord | null> {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction([PROJECTS_STORE, ASSETS_STORE], "readonly");
      const metaRequest = transaction.objectStore(PROJECTS_STORE).get(id);
      const assetRequest = transaction.objectStore(ASSETS_STORE).get(id);
      transaction.oncomplete = () => {
        if (!metaRequest.result || !assetRequest.result) {
          resolve(null);
          return;
        }
        resolve({ ...metaRequest.result, ...assetRequest.result });
      };
      transaction.onerror = () => reject(transaction.error || new Error("Could not open this saved project."));
    });
  } finally {
    database.close();
  }
}

export async function deleteAutoFitProject(id: string) {
  const database = await openDatabase();
  try {
    const transaction = database.transaction([PROJECTS_STORE, ASSETS_STORE], "readwrite");
    transaction.objectStore(PROJECTS_STORE).delete(id);
    transaction.objectStore(ASSETS_STORE).delete(id);
    await transactionDone(transaction);
  } finally {
    database.close();
  }
}
