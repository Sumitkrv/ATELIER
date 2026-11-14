/**
 * Guest-Session Browser Draft Storage & Editor Domain Types for Wall Visualizer Studio.
 *
 * Persists user-saved wall previews honestly in the visitor's browser `localStorage`
 * (`atelier_visualizer_saved_projects_v1`), scoped strictly to this browser device.
 * Never claims cloud persistence when no visitor account system is active.
 */

export type SurfaceFinishId = "plaster" | "limewash" | "textured" | "matte";

export type MeasurementUnit = "ft" | "in" | "m";

export interface StudioMeasurementState {
  widthInput: string;
  heightInput: string;
  unit: MeasurementUnit;
}

export interface ForegroundMaskRect {
  enabled: boolean;
  x: number; // normalized [0..1]
  y: number; // normalized [0..1]
  w: number; // normalized [0.05..0.9]
  h: number; // normalized [0.05..0.9]
}

export interface StudioLayersState {
  artworkVisible: boolean;
  artworkLocked: boolean;
  guidesVisible: boolean;
  guidesLocked: boolean;
  foregroundMask: ForegroundMaskRect;
}

export interface StudioPoint2D {
  x: number;
  y: number;
}

export type StudioQuadCorners = [
  StudioPoint2D,
  StudioPoint2D,
  StudioPoint2D,
  StudioPoint2D,
];

export interface StudioSavedProject {
  id: string;
  savedAt: string;
  designId: string;
  designSlug: string;
  designTitle: string;
  categoryLabel: string;
  roomSourceKind: "sample" | "upload" | "camera";
  sampleRoomId: string;
  roomLabel: string;
  corners: StudioQuadCorners;
  applicationMode: "mural" | "pattern";
  scale: number;
  patternRepeatScale: number;
  panX: number;
  panY: number;
  rotationDegrees: number;
  rotationQuarterTurns: number;
  flipHorizontal: boolean;
  opacity: number;
  brightness: number;
  blendMultiply: boolean;
  surfaceFinish: SurfaceFinishId;
  layers: StudioLayersState;
  measurement: StudioMeasurementState;
  previewThumbnailDataUrl: string | null;
}

const STORAGE_KEY = "atelier_visualizer_saved_projects_v1";
const MAX_SAVED_PROJECTS = 12;

export function loadSavedStudioProjects(): StudioSavedProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is StudioSavedProject =>
        Boolean(item && typeof item.id === "string" && Array.isArray(item.corners) && item.corners.length === 4)
    );
  } catch {
    return [];
  }
}

export function saveStudioProjectToBrowser(
  project: StudioSavedProject
): { ok: true; projects: StudioSavedProject[] } | { ok: false; error: string } {
  if (typeof window === "undefined") {
    return {
      ok: false,
      error: "Browser local storage is unavailable in this environment.",
    };
  }

  try {
    const existing = loadSavedStudioProjects();
    const deduped = existing.filter((p) => p.id !== project.id);
    const updated = [project, ...deduped].slice(0, MAX_SAVED_PROJECTS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { ok: true, projects: updated };
  } catch {
    // Retry once without thumbnail if storage quota is tight
    try {
      const existing = loadSavedStudioProjects();
      const slimProject: StudioSavedProject = {
        ...project,
        previewThumbnailDataUrl: null,
      };
      const updated = [
        slimProject,
        ...existing.filter((p) => p.id !== project.id),
      ].slice(0, MAX_SAVED_PROJECTS);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { ok: true, projects: updated };
    } catch {
      return {
        ok: false,
        error:
          "Browser storage is full or disabled (e.g., private browsing). Export a snapshot instead.",
      };
    }
  }
}

export function deleteSavedStudioProject(projectId: string): StudioSavedProject[] {
  if (typeof window === "undefined") return [];
  try {
    const updated = loadSavedStudioProjects().filter((p) => p.id !== projectId);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return loadSavedStudioProjects();
  }
}

export function formatCalibratedMeasurementSummary(
  measurement: StudioMeasurementState
): {
  isCalibrated: boolean;
  areaLabel: string | null;
  aspectRatioLabel: string | null;
  summaryText: string;
  queryValue: string | null;
} {
  const w = Number.parseFloat(measurement.widthInput);
  const h = Number.parseFloat(measurement.heightInput);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return {
      isCalibrated: false,
      areaLabel: null,
      aspectRatioLabel: null,
      summaryText: "Perspective Preview — Physical Scale Not Calibrated",
      queryValue: null,
    };
  }

  const ratio = (w / h).toFixed(2);
  let areaLabel = "";
  if (measurement.unit === "ft") {
    areaLabel = `${(w * h).toFixed(1)} sq. ft.`;
  } else if (measurement.unit === "m") {
    areaLabel = `${(w * h).toFixed(2)} sq. m.`;
  } else {
    const sqFt = (w * h) / 144;
    areaLabel = `${sqFt.toFixed(1)} sq. ft. (${Math.round(w * h)} sq. in.)`;
  }

  const cleanW = Number(w.toFixed(2));
  const cleanH = Number(h.toFixed(2));
  return {
    isCalibrated: true,
    areaLabel,
    aspectRatioLabel: `${ratio} : 1`,
    summaryText: `Calibrated Reference: ${cleanW} × ${cleanH} ${measurement.unit} (${areaLabel})`,
    queryValue: `${cleanW}x${cleanH} ${measurement.unit} (${areaLabel})`,
  };
}

