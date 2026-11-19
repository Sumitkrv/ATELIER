"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  Image as ImageIcon,
  LoaderCircle,
  Maximize2,
  Minus,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import {
  SelectedArtworkSelectorModal,
} from "@/components/visualizer/SelectedArtworkSelector";
import {
  CatalogueCategoryRecord,
  CatalogueDesignItem,
} from "@/lib/designs-catalogue";
import {
  AutoFitProjectMeta,
  deleteAutoFitProject,
  listAutoFitProjects,
  loadAutoFitProject,
  saveAutoFitProject,
} from "@/lib/auto-fit-projects";
import {
  analyzeWallPhoto,
  renderAutoFitComposite,
  WallCandidate,
  WallPoint,
  WallQuad,
} from "@/lib/wall-auto-fit";
import { cn } from "@/lib/cn";

type WorkflowStep = 1 | 2 | 3;
type DetectionState = "empty" | "loading" | "detecting" | "ready" | "manual" | "error";
type FitMode = "cover" | "contain" | "repeat";
type ProtectionStroke = { points: WallPoint[]; width: number };

interface AutoFitWallStudioProps {
  isOpen: boolean;
  selectedDesign: CatalogueDesignItem;
  designs: ReadonlyArray<CatalogueDesignItem>;
  categories: ReadonlyArray<CatalogueCategoryRecord>;
  onSelectDesign: (design: CatalogueDesignItem) => void;
  onClose: () => void;
}

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 40_000_000;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ACCEPTED_EXTENSIONS = /\.(jpe?g|png|webp)$/i;
const STEP_LABELS = ["Upload Wall", "Choose Design", "Auto-Fit Preview"] as const;

function galleryArtworkUrl(design: CatalogueDesignItem) {
  return design.visualizerConfig.textureUrl || design.coverImage.secureUrl;
}

function isSupportedImage(file: File) {
  return ACCEPTED_IMAGE_TYPES.has(file.type.toLowerCase()) || ACCEPTED_EXTENSIONS.test(file.name);
}

function isValidQuad(corners: WallQuad) {
  let previousSign = 0;
  for (let index = 0; index < corners.length; index += 1) {
    const a = corners[index];
    const b = corners[(index + 1) % 4];
    const c = corners[(index + 2) % 4];
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (Math.abs(cross) < 0.0001) return false;
    const sign = cross > 0 ? 1 : -1;
    if (previousSign && sign !== previousSign) return false;
    previousSign = sign;
  }
  return true;
}

function makeObjectUrl(blob: Blob) {
  return URL.createObjectURL(blob);
}

function formatFileSize(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function AutoFitWallStudio({
  isOpen,
  selectedDesign,
  designs,
  categories,
  onSelectDesign,
  onClose,
}: AutoFitWallStudioProps) {
  const [step, setStep] = useState<WorkflowStep>(1);
  const [roomFile, setRoomFile] = useState<File | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [roomImage, setRoomImage] = useState<HTMLImageElement | null>(null);
  const [roomName, setRoomName] = useState("");
  const [roomProgress, setRoomProgress] = useState(0);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);
  const [savedArtworkUrl, setSavedArtworkUrl] = useState<string | null>(null);
  const [artworkImage, setArtworkImage] = useState<HTMLImageElement | null>(null);
  const [artworkName, setArtworkName] = useState("");
  const [artworkProgress, setArtworkProgress] = useState(0);
  const [detectionState, setDetectionState] = useState<DetectionState>("empty");
  const [detectionResult, setDetectionResult] = useState<{
    candidates: WallCandidate[];
    confidence: number;
    confident: boolean;
  } | null>(null);
  const [wallCorners, setWallCorners] = useState<WallQuad | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualPoints, setManualPoints] = useState<WallPoint[]>([]);
  const [draggingCorner, setDraggingCorner] = useState<number | null>(null);
  const [mode, setMode] = useState<FitMode>("cover");
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [opacity, setOpacity] = useState(0.9);
  const [lighting, setLighting] = useState(0.55);
  const [brightness, setBrightness] = useState(100);
  const [compareX, setCompareX] = useState(0.5);
  const [zoom, setZoom] = useState(1);
  const [protectMode, setProtectMode] = useState(false);
  const [protectionStrokes, setProtectionStrokes] = useState<ProtectionStroke[]>([]);
  const [brushWidth, setBrushWidth] = useState(0.035);
  const [isPainting, setIsPainting] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [draggingUpload, setDraggingUpload] = useState<"room" | "artwork" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<AutoFitProjectMeta[]>([]);
  const [savedProjectsOpen, setSavedProjectsOpen] = useState(false);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<number | null>(null);

  const roomInputRef = useRef<HTMLInputElement | null>(null);
  const artworkInputRef = useRef<HTMLInputElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const roomUrlRef = useRef<string | null>(null);
  const artworkUrlRef = useRef<string | null>(null);
  const analysisTokenRef = useRef(0);
  const renderTokenRef = useRef(0);
  const activeStrokeRef = useRef<ProtectionStroke | null>(null);
  const restoredCornersRef = useRef<WallQuad | null>(null);

  const displayArtworkUrl = artworkUrl || savedArtworkUrl || galleryArtworkUrl(selectedDesign);
  const displayArtworkName = artworkFile?.name || (savedArtworkUrl ? artworkName : selectedDesign.title);
  const roomAspectRatio = useMemo(() => {
    if (!roomImage?.naturalWidth || !roomImage.naturalHeight) return 1.5;
    return roomImage.naturalWidth / roomImage.naturalHeight;
  }, [roomImage]);
  const detectionPercent = detectionResult ? Math.round(detectionResult.confidence * 100) : null;
  const currentDesignSlug = artworkFile || savedArtworkUrl ? null : selectedDesign.slug;

  const flashNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice((current) => (current === message ? null : current)), 4200);
  }, []);

  useEffect(() => {
    roomUrlRef.current = roomUrl;
  }, [roomUrl]);
  useEffect(() => {
    artworkUrlRef.current = artworkUrl;
  }, [artworkUrl]);
  useEffect(
    () => () => {
      if (roomUrlRef.current) URL.revokeObjectURL(roomUrlRef.current);
      if (artworkUrlRef.current) URL.revokeObjectURL(artworkUrlRef.current);
      analysisTokenRef.current += 1;
      renderTokenRef.current += 1;
    },
    []
  );

  const setRoomBlob = useCallback((file: File, name = file.name) => {
    if (roomUrlRef.current) URL.revokeObjectURL(roomUrlRef.current);
    const nextUrl = makeObjectUrl(file);
    roomUrlRef.current = nextUrl;
    setRoomFile(file);
    setRoomName(name.replace(/\.[^/.]+$/, ""));
    setRoomUrl(nextUrl);
    setRoomImage(null);
    restoredCornersRef.current = null;
    setRoomProgress(100);
    setWallCorners(null);
    setManualPoints([]);
    setManualMode(false);
    setProtectionStrokes([]);
    setDetectionResult(null);
    setSelectedCandidateIndex(null);
    setDetectionState("loading");
    setUploadError(null);
    setRenderError(null);
    setStep(1);
  }, []);

  const loadRoomFile = useCallback(
    (file: File) => {
      setUploadError(null);
      if (!isSupportedImage(file)) {
        setUploadError("Choose a JPG, PNG, or WebP room photo.");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setUploadError("This photo is over 25 MB. Resize it or choose a smaller image, then try again.");
        return;
      }
      setRoomProgress(0);
      setDetectionState("loading");
      const reader = new FileReader();
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          setRoomProgress(Math.min(96, Math.round((event.loaded / event.total) * 100)));
        }
      };
      reader.onerror = () => {
        setDetectionState("error");
        setUploadError("The photo could not be read. Try another JPG, PNG, or WebP file.");
      };
      reader.onload = () => setRoomBlob(file);
      reader.readAsArrayBuffer(file);
    },
    [setRoomBlob]
  );

  const loadArtworkFile = useCallback((file: File) => {
    setUploadError(null);
    if (!isSupportedImage(file)) {
      setUploadError("Choose a JPG, PNG, or WebP design. Transparent PNG and WebP files are supported.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setUploadError("This design is over 25 MB. Choose a smaller image and try again.");
      return;
    }
    setArtworkProgress(0);
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        setArtworkProgress(Math.min(96, Math.round((event.loaded / event.total) * 100)));
      }
    };
    reader.onerror = () => setUploadError("The design file could not be read. Try another image.");
    reader.onload = () => {
      if (artworkUrlRef.current) URL.revokeObjectURL(artworkUrlRef.current);
      const nextUrl = makeObjectUrl(file);
      artworkUrlRef.current = nextUrl;
      setArtworkFile(file);
      setArtworkName(file.name.replace(/\.[^/.]+$/, ""));
      setArtworkUrl(nextUrl);
      setSavedArtworkUrl(null);
      setArtworkImage(null);
      setArtworkProgress(100);
      setUploadError(null);
      setRenderError(null);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  useEffect(() => {
    if (!roomUrl) return;
    const token = ++analysisTokenRef.current;
    const image = new Image();
    image.onload = async () => {
      if (token !== analysisTokenRef.current) return;
      if (image.naturalWidth * image.naturalHeight > MAX_IMAGE_PIXELS) {
        setDetectionState("error");
        setUploadError("This photo has more than 40 megapixels. Choose a smaller photo to keep editing responsive.");
        return;
      }
      setRoomImage(image);
      setDetectionState("detecting");
      setUploadError(null);
      try {
        const result = await analyzeWallPhoto(image, image.naturalWidth, image.naturalHeight);
        if (token !== analysisTokenRef.current) return;
        setDetectionResult(result);
        const restoredCorners = restoredCornersRef.current;
        if (restoredCorners) {
          restoredCornersRef.current = null;
          setWallCorners(restoredCorners);
          setSelectedCandidateIndex(null);
          setDetectionState("ready");
          setManualMode(false);
          return;
        }
        if (result.confident && result.candidates[0]) {
          setWallCorners(result.candidates[0].corners);
          setSelectedCandidateIndex(0);
          setDetectionState("ready");
          setManualMode(false);
        } else {
          setWallCorners(null);
          setSelectedCandidateIndex(null);
          setDetectionState("manual");
          setManualMode(true);
        }
      } catch (error) {
        if (token !== analysisTokenRef.current) return;
        setDetectionState("error");
        setWallCorners(null);
        setManualMode(true);
        setUploadError(
          error instanceof Error
            ? `${error.message} You can still mark the wall corners manually.`
            : "Automatic wall analysis failed. You can still mark the wall corners manually."
        );
      }
    };
    image.onerror = () => {
      if (token !== analysisTokenRef.current) return;
      setDetectionState("error");
      setUploadError("This photo could not be opened. Try a different JPG, PNG, or WebP image.");
    };
    image.src = roomUrl;
    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [roomUrl]);

  useEffect(() => {
    setArtworkImage(null);
    setIsRendering(false);
    if (!displayArtworkUrl) return;
    let cancelled = false;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (!cancelled) {
        if (image.naturalWidth * image.naturalHeight > MAX_IMAGE_PIXELS) {
          setArtworkImage(null);
          setRenderError("This artwork has more than 40 megapixels. Choose a smaller source image to keep the preview responsive.");
          return;
        }
        setArtworkImage(image);
        setRenderError(null);
      }
    };
    image.onerror = () => {
      if (!cancelled) {
        setArtworkImage(null);
        setRenderError("This artwork could not be loaded for the preview. Choose another design or upload a new file.");
      }
    };
    image.src = displayArtworkUrl;
    return () => {
      cancelled = true;
    };
  }, [displayArtworkUrl]);

  useEffect(() => {
    if (!isOpen || step !== 3 || !roomImage || !artworkImage || !wallCorners || isPainting) return;
    const token = ++renderTokenRef.current;
    setIsRendering(true);
    setRenderError(null);
    const frame = requestAnimationFrame(() => {
      try {
        const composite = renderAutoFitComposite({
          room: roomImage,
          artwork: artworkImage,
          corners: wallCorners,
          mode,
          scale,
          offsetX,
          offsetY,
          opacity,
          lighting,
          brightness,
          protectionStrokes,
          maxPixels: 2_000_000,
        });
        if (token !== renderTokenRef.current) return;
        const canvas = resultCanvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) throw new Error("The preview canvas is not available.");
        canvas.width = composite.width;
        canvas.height = composite.height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(composite, 0, 0);
        setIsRendering(false);
      } catch (error) {
        if (token !== renderTokenRef.current) return;
        setIsRendering(false);
        setRenderError(
          error instanceof Error
            ? error.message
            : "The preview could not be rendered. Try changing the wall corners or artwork mode."
        );
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [
    artworkImage,
    brightness,
    isOpen,
    lighting,
    mode,
    offsetX,
    offsetY,
    opacity,
    protectionStrokes,
    roomImage,
    scale,
    step,
    wallCorners,
    isPainting,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    listAutoFitProjects().then(setSavedProjects).catch(() => setSavedProjects([]));
  }, [isOpen]);

  const startManualPlacement = useCallback(() => {
    analysisTokenRef.current += 1;
    if (!wallCorners) setManualPoints([]);
    setManualMode(true);
    setSelectedCandidateIndex(null);
    setDetectionState("manual");
    setUploadError(null);
    flashNotice(wallCorners ? "Drag the four handles to align the wall edges." : "Select the wall corners in order: top left, top right, bottom right, bottom left.");
  }, [flashNotice, wallCorners]);

  const chooseCandidate = useCallback((candidate: WallCandidate, index: number) => {
    setWallCorners(candidate.corners);
    setSelectedCandidateIndex(index);
    setDetectionResult((current) => current ? {
      ...current,
      confidence: candidate.confidence,
      confident: candidate.confidence >= 0.74,
    } : current);
    setManualPoints([]);
    setManualMode(false);
    setDetectionState("ready");
    setUploadError(null);
  }, []);

  const retryDetection = useCallback(async () => {
    if (!roomImage) return;
    const token = ++analysisTokenRef.current;
    setDetectionState("detecting");
    setUploadError(null);
    setDetectionResult(null);
    setManualMode(false);
    try {
      const result = await analyzeWallPhoto(roomImage, roomImage.naturalWidth, roomImage.naturalHeight);
      if (token !== analysisTokenRef.current) return;
      setDetectionResult(result);
      if (result.confident && result.candidates[0]) {
        chooseCandidate(result.candidates[0], 0);
      } else {
        setDetectionState("manual");
        setManualMode(true);
        flashNotice(result.candidates.length ? "Several wall regions may fit. Choose one or mark the corners yourself." : "No clear wall outline found. Mark the wall corners manually.");
      }
    } catch {
      if (token !== analysisTokenRef.current) return;
      setDetectionState("error");
      setManualMode(true);
      setUploadError("Automatic analysis could not finish. Mark the wall corners manually or replace the photo.");
    }
  }, [chooseCandidate, flashNotice, roomImage]);

  const pointFromPointer = useCallback((clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
    };
  }, []);

  const handleStagePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (draggingCorner !== null) return;
      const point = pointFromPointer(event.clientX, event.clientY);
      if (!point) return;
      if (protectMode && step === 3) {
        event.currentTarget.setPointerCapture(event.pointerId);
        setIsPainting(true);
        setIsRendering(false);
        const nextStroke = { points: [point], width: brushWidth };
        activeStrokeRef.current = nextStroke;
        setProtectionStrokes((current) => [...current, nextStroke]);
        return;
      }
      if (manualMode && wallCorners === null && step === 1) {
        event.preventDefault();
        const nextPoints = [...manualPoints, point].slice(0, 4);
        setManualPoints(nextPoints);
        if (nextPoints.length === 4) {
          const candidate = nextPoints as WallQuad;
          if (isValidQuad(candidate)) {
            setWallCorners(candidate);
            setManualMode(true);
            setDetectionState("manual");
            flashNotice("Wall corners added. Drag a corner handle to refine the fit.");
          } else {
            setManualPoints([]);
            flashNotice("Those points cross over each other. Select the four corners again in clockwise order.");
          }
        }
      }
    },
    [brushWidth, draggingCorner, flashNotice, manualMode, manualPoints, pointFromPointer, protectMode, step, wallCorners]
  );

  const handleStagePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const point = pointFromPointer(event.clientX, event.clientY);
      if (!point) return;
      if (draggingCorner !== null && wallCorners) {
        setWallCorners((current) => {
          if (!current) return current;
          const next = current.map((corner, index) =>
            index === draggingCorner ? point : corner
          ) as WallQuad;
          return isValidQuad(next) ? next : current;
        });
      }
      if (isPainting && activeStrokeRef.current) {
        const updated = {
          ...activeStrokeRef.current,
          points: [...activeStrokeRef.current.points, point],
        };
        activeStrokeRef.current = updated;
        setProtectionStrokes((current) => [...current.slice(0, -1), updated]);
      }
    },
    [draggingCorner, isPainting, pointFromPointer, wallCorners]
  );

  const finishPointerAction = useCallback(() => {
    setDraggingCorner(null);
    setIsPainting(false);
    activeStrokeRef.current = null;
  }, []);

  const handleGallerySelection = useCallback(
    (design: CatalogueDesignItem) => {
      if (artworkUrlRef.current) URL.revokeObjectURL(artworkUrlRef.current);
      artworkUrlRef.current = null;
      setArtworkFile(null);
      setArtworkUrl(null);
      setSavedArtworkUrl(null);
      setArtworkName("");
      onSelectDesign(design);
      setGalleryOpen(false);
    },
    [onSelectDesign]
  );

  const openArtworkPicker = useCallback(() => setGalleryOpen(true), []);

  const applyLoadedProject = useCallback(
    async (id: string) => {
      setSavedProjectsOpen(false);
      setUploadError(null);
      setDetectionState("loading");
      try {
        const project = await loadAutoFitProject(id);
        if (!project) throw new Error("This saved project could not be found.");
        const room = new File([project.roomBlob], project.roomName, {
          type: project.roomBlob.type || "image/jpeg",
        });
        setRoomBlob(room, project.roomName);
        restoredCornersRef.current = project.corners;
        setWallCorners(project.corners);
        setDetectionState("ready");
        setStep(3);
        setMode(project.mode);
        setScale(project.scale);
        setOffsetX(project.offsetX);
        setOffsetY(project.offsetY);
        setOpacity(project.opacity);
        setLighting(project.lighting);
        setManualMode(false);
        setProtectionStrokes(project.protectionStrokes || []);
        setSavedArtworkUrl(project.designSlug ? null : project.artworkUrl);
        setArtworkName(project.artworkName);
        setArtworkFile(null);
        if (artworkUrlRef.current) URL.revokeObjectURL(artworkUrlRef.current);
        artworkUrlRef.current = null;
        setArtworkUrl(null);
        setArtworkImage(null);
        if (project.artworkBlob) {
          const file = new File([project.artworkBlob], project.artworkName, {
            type: project.artworkBlob.type || "image/png",
          });
          setArtworkFile(file);
          if (artworkUrlRef.current) URL.revokeObjectURL(artworkUrlRef.current);
          const url = makeObjectUrl(file);
          artworkUrlRef.current = url;
          setArtworkUrl(url);
          setSavedArtworkUrl(null);
        } else if (project.designSlug) {
          const design = designs.find((item) => item.slug === project.designSlug);
          if (design) onSelectDesign(design);
        }
        flashNotice(`Opened “${project.roomName}” from saved projects.`);
      } catch (error) {
        setDetectionState("error");
        setUploadError(error instanceof Error ? error.message : "The saved project could not be opened.");
      }
    },
    [designs, flashNotice, onSelectDesign, setRoomBlob]
  );

  const handleSaveProject = useCallback(async () => {
    if (!roomFile || !wallCorners) return;
    setIsSaving(true);
    try {
      const meta: AutoFitProjectMeta = {
        id: `auto-fit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        savedAt: new Date().toISOString(),
        roomName: roomFile.name,
        artworkName: displayArtworkName,
        designSlug: currentDesignSlug,
        artworkUrl: artworkFile ? null : displayArtworkUrl,
        corners: wallCorners,
        mode,
        scale,
        offsetX,
        offsetY,
        opacity,
        lighting,
        protectionStrokes,
      };
      await saveAutoFitProject(meta, {
        roomBlob: roomFile,
        artworkBlob: artworkFile,
      });
      setSavedProjects(await listAutoFitProjects());
      flashNotice("Project saved on this device. Find it in Saved Projects.");
    } catch (error) {
      flashNotice(
        error instanceof Error
          ? `${error.message} Try a smaller photo or free device storage.`
          : "The project could not be saved. Try a smaller photo or free device storage."
      );
    } finally {
      setIsSaving(false);
    }
  }, [artworkFile, currentDesignSlug, displayArtworkName, displayArtworkUrl, flashNotice, lighting, mode, offsetX, offsetY, opacity, protectionStrokes, roomFile, scale, wallCorners]);

  const handleDownload = useCallback(async () => {
    if (!roomImage || !artworkImage || !wallCorners) return;
    setIsRendering(true);
    setRenderError(null);
    try {
      const composite = renderAutoFitComposite({
        room: roomImage,
        artwork: artworkImage,
        corners: wallCorners,
        mode,
        scale,
        offsetX,
        offsetY,
        opacity,
        lighting,
        brightness,
        protectionStrokes,
      });
      const blob = await new Promise<Blob>((resolve, reject) => {
        composite.toBlob(
          (result) => (result ? resolve(result) : reject(new Error("The browser could not create the download."))),
          "image/png"
        );
      });
      const link = document.createElement("a");
      const downloadUrl = URL.createObjectURL(blob);
      link.href = downloadUrl;
      link.download = `atelier-auto-fit-${(roomName || "wall").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1500);
      flashNotice(`Preview downloaded at ${composite.width} × ${composite.height} px.`);
    } catch (error) {
      setRenderError(
        error instanceof Error
          ? `${error.message} Check that the selected gallery image allows browser export, or upload the artwork file.`
          : "The preview could not be exported. Try another image or reduce its size."
      );
    } finally {
      setIsRendering(false);
    }
  }, [artworkImage, brightness, flashNotice, lighting, mode, offsetX, offsetY, opacity, protectionStrokes, roomImage, roomName, scale, wallCorners]);

  const handleDeleteProject = useCallback(async (id: string) => {
    await deleteAutoFitProject(id);
    setSavedProjects(await listAutoFitProjects());
  }, []);

  const goToPreview = useCallback(() => {
    if (!wallCorners || !artworkImage) return;
    setStep(3);
    setManualMode(false);
    setProtectMode(false);
    setCompareX(0.5);
  }, [artworkImage, wallCorners]);

  const selectStep = useCallback((nextStep: WorkflowStep) => {
    if (nextStep === 2 && !wallCorners) return;
    if (nextStep === 3 && (!wallCorners || !artworkImage)) return;
    setStep(nextStep);
    setProtectMode(false);
  }, [artworkImage, wallCorners]);

  const stageWidthStyle = useMemo<React.CSSProperties>(
    () => ({
      width: "100%",
      maxWidth: `${Math.max(20, 68 * roomAspectRatio)}vh`,
      aspectRatio: `${roomAspectRatio}`,
    }),
    [roomAspectRatio]
  );

  const enquiryHref = `/contact?design=${encodeURIComponent(currentDesignSlug || "custom")}&title=${encodeURIComponent(displayArtworkName)}`;

  if (!isOpen) return null;

  return (
    <section className="min-h-[calc(100vh-74px)] bg-[#FAF6F0] px-3 py-4 sm:px-6 sm:py-6 lg:px-9">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5D9CA] pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#9B1C1C]/10 text-[#9B1C1C]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.19em] text-[#9B1C1C]">ATELIER WALL VISUALIZER</p>
              <h1 className="truncate font-serif text-[23px] leading-tight text-[#1A1A1A] sm:text-2xl">Upload Wall &amp; Auto-Fit Design</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                listAutoFitProjects().then((projects) => {
                  setSavedProjects(projects);
                  setSavedProjectsOpen(true);
                }).catch(() => flashNotice("Saved projects are not available in this browser."));
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#DFD0C0] bg-[#FFFDF9] px-4 py-2 text-xs font-semibold text-[#2A231F] hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
            >
              <ImageIcon className="h-4 w-4" /> Saved Projects
            </button>
            <button type="button" onClick={onClose} aria-label="Close auto-fit studio" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DFD0C0] bg-[#FFFDF9] text-[#2A231F] hover:border-[#9B1C1C] hover:text-[#9B1C1C]">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <nav aria-label="Auto-fit preview steps" className="mx-auto my-5 flex max-w-3xl items-center justify-between gap-1 sm:my-7">
          {STEP_LABELS.map((label, index) => {
            const number = (index + 1) as WorkflowStep;
            const complete = step > number || (number === 1 && Boolean(wallCorners));
            return (
              <React.Fragment key={label}>
                <button type="button" aria-current={step === number ? "step" : undefined} onClick={() => selectStep(number)} className="group flex min-w-0 items-center gap-2 text-left disabled:cursor-not-allowed">
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors", step === number ? "border-[#9B1C1C] bg-[#9B1C1C] text-white" : complete ? "border-[#9B1C1C]/35 bg-[#9B1C1C]/10 text-[#9B1C1C]" : "border-[#DFD0C0] bg-[#FFFDF9] text-[#746B64]")}>{complete ? <Check className="h-4 w-4" /> : number}</span>
                  <span className={cn("hidden truncate text-xs font-semibold sm:block", step === number ? "text-[#1A1A1A]" : "text-[#746B64]")}>{label}</span>
                </button>
                {index < STEP_LABELS.length - 1 && <span aria-hidden="true" className="mx-1 h-px min-w-3 flex-1 bg-[#DFD0C0] sm:mx-4" />}
              </React.Fragment>
            );
          })}
        </nav>

        {notice && <div role="status" className="mx-auto mb-4 max-w-3xl rounded-xl border border-[#D8C1A6] bg-[#FFFDF9] px-4 py-3 text-sm text-[#4D4036]">{notice}</div>}
        {uploadError && <div role="alert" className="mx-auto mb-4 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DDB6AE] bg-[#FFF8F6] px-4 py-3 text-sm text-[#6D2724]"><span>{uploadError}</span>{roomImage && <button type="button" onClick={startManualPlacement} className="shrink-0 font-semibold underline">Mark wall manually</button>}</div>}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <main className="min-w-0 rounded-2xl border border-[#E5D9CA] bg-[#FFFDF9] p-3 shadow-[0_16px_50px_rgba(32,24,18,0.06)] sm:p-5">
            {step === 1 && (
              <div className="mx-auto max-w-4xl">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9B1C1C]">STEP 01 · YOUR SPACE</p><h2 className="mt-1 font-serif text-2xl text-[#1A1A1A]">Upload a photo of the wall</h2><p className="mt-1 max-w-xl text-sm leading-relaxed text-[#746B64]">JPG, PNG, and WebP photos up to 25 MB. Photos stay in this browser while you work.</p></div>
                  {roomImage && <button type="button" onClick={() => roomInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-[#DFD0C0] px-4 py-2 text-xs font-semibold text-[#2A231F] hover:border-[#9B1C1C] hover:text-[#9B1C1C]"><RefreshCw className="h-3.5 w-3.5" /> Replace Wall Image</button>}
                </div>
                <input ref={roomInputRef} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) loadRoomFile(file); }} />
                {!roomImage ? (
                  <button type="button" onClick={() => roomInputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDraggingUpload("room"); }} onDragLeave={() => setDraggingUpload(null)} onDrop={(event) => { event.preventDefault(); setDraggingUpload(null); const file = event.dataTransfer.files?.[0]; if (file) loadRoomFile(file); }} className={cn("flex min-h-[250px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-10 text-center transition-colors sm:min-h-[320px]", draggingUpload === "room" ? "border-[#9B1C1C] bg-[#FAF0EC]" : "border-[#DFD0C0] bg-[#FCFAF6] hover:border-[#9B1C1C]")}>
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#9B1C1C]/10 text-[#9B1C1C]"><Upload className="h-6 w-6" /></span><span className="mt-4 font-serif text-xl text-[#1A1A1A]">Drop your room photo here</span><span className="mt-1 text-sm text-[#746B64]">or choose a photo from your device</span><span className="mt-4 rounded-full bg-[#9B1C1C] px-5 py-2.5 text-sm font-semibold text-white">Choose Room Photo</span><span className="mt-3 text-[11px] text-[#8A8179]">JPG · PNG · WebP · up to 25 MB</span>{detectionState === "loading" && <span role="status" className="mt-4 block w-full max-w-sm text-left"><span className="mb-1 block text-[11px] font-medium text-[#746B64]">{roomProgress < 100 ? `Reading photo · ${roomProgress}%` : "Preparing full-resolution photo…"}</span><span className="block h-1.5 overflow-hidden rounded-full bg-[#E9DED0]"><span className="block h-full rounded-full bg-[#9B1C1C] transition-all" style={{ width: `${Math.max(4, roomProgress)}%` }} /></span></span>}
                  </button>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <div className="overflow-hidden rounded-xl border border-[#E5D9CA] bg-[#F1EBE2] p-2">
                      <div ref={stageRef} style={stageWidthStyle} onPointerDown={handleStagePointerDown} onPointerMove={handleStagePointerMove} onPointerUp={finishPointerAction} onPointerCancel={finishPointerAction} className={cn("relative mx-auto touch-none overflow-hidden rounded-lg bg-[#E8E0D6]", manualMode && !wallCorners && "cursor-crosshair")}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}<img src={roomUrl || ""} alt="Uploaded room" className="absolute inset-0 h-full w-full object-fill" />
                        {wallCorners && <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full"><polygon points={wallCorners.map((point) => `${point.x * 100},${point.y * 100}`).join(" ")} fill="rgba(155,28,28,0.08)" stroke="#9B1C1C" strokeWidth="0.55" strokeDasharray={manualMode ? undefined : "1.3 0.8"} /></svg>}
                        {detectionResult && (!detectionResult.confident || detectionResult.candidates.length > 1) && <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">{detectionResult.candidates.map((candidate, index) => index !== selectedCandidateIndex && <polygon key={index} points={candidate.corners.map((point) => `${point.x * 100},${point.y * 100}`).join(" ")} fill="rgba(213,168,85,0.07)" stroke="#A7772F" strokeWidth="0.5" strokeDasharray="1.5 1" />)}</svg>}
                        {manualMode && !wallCorners && manualPoints.map((point, index) => <span key={index} className="pointer-events-none absolute z-20 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#9B1C1C] text-[10px] font-bold text-white shadow" style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}>{index + 1}</span>)}
                        {wallCorners && manualMode && wallCorners.map((point, index) => <button key={index} type="button" aria-label={`Adjust wall corner ${index + 1}`} onPointerDown={(event) => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); setDraggingCorner(index); }} onKeyDown={(event) => { const delta = event.shiftKey ? 0.03 : 0.01; const updates: Record<string, WallPoint> = { ArrowLeft: { x: Math.max(0, point.x - delta), y: point.y }, ArrowRight: { x: Math.min(1, point.x + delta), y: point.y }, ArrowUp: { x: point.x, y: Math.max(0, point.y - delta) }, ArrowDown: { x: point.x, y: Math.min(1, point.y + delta) } }; const update = updates[event.key]; if (update) { event.preventDefault(); setWallCorners((current) => { if (!current) return current; const next = [...current] as WallQuad; next[index] = update; return isValidQuad(next) ? next : current; }); } }} className="absolute z-20 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border-2 border-white bg-[#9B1C1C] text-[10px] font-bold text-white shadow-md touch-none active:cursor-grabbing" style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}>{index + 1}</button>)}
                        {detectionState === "detecting" && <div className="absolute inset-x-0 top-0 z-30 flex items-center gap-2 bg-[#1A1A1A]/80 px-3 py-2 text-xs font-medium text-white"><LoaderCircle className="h-4 w-4 animate-spin" /> Analyzing image edges for wall regions…</div>}
                      </div>
                    </div>
                    <aside className="flex flex-col gap-3">
                      <div className="rounded-xl border border-[#E5D9CA] bg-[#FCFAF6] p-4">
                        <div className="flex items-center gap-2"><span className={cn("flex h-8 w-8 items-center justify-center rounded-full", detectionState === "ready" ? "bg-emerald-100 text-emerald-800" : detectionState === "detecting" ? "bg-[#F2E6D6] text-[#8A5A22]" : "bg-[#9B1C1C]/10 text-[#9B1C1C]")}>{detectionState === "detecting" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : detectionState === "ready" ? <Check className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</span><div><p className="text-xs font-semibold text-[#1A1A1A]">{detectionState === "detecting" ? "Detecting wall" : detectionState === "ready" ? "Wall outline found" : wallCorners ? "Wall selected" : "Choose the wall"}</p><p className="text-[11px] text-[#746B64]">{detectionState === "ready" && detectionPercent !== null ? `${detectionPercent}% geometry confidence` : detectionState === "detecting" ? "Local image analysis" : "Review or mark four corners"}</p></div></div>
                        {roomProgress < 100 && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E9DED0]"><span className="block h-full rounded-full bg-[#9B1C1C] transition-all" style={{ width: `${roomProgress}%` }} /></div>}
                        {detectionResult && detectionResult.candidates.length > 0 && (!detectionResult.confident || detectionResult.candidates.length > 1) && <div className="mt-4"><p className="text-[11px] leading-relaxed text-[#63584F]">{detectionResult.confident ? "Choose a different possible wall, or keep the highlighted outline." : "We found possible wall edges, but they need your confirmation."}</p><div className="mt-2 flex flex-wrap gap-2">{detectionResult.candidates.map((candidate, index) => <button key={index} type="button" onClick={() => chooseCandidate(candidate, index)} className={cn("rounded-full border px-3 py-1.5 text-[11px] font-semibold", selectedCandidateIndex === index ? "border-[#9B1C1C] bg-[#9B1C1C] text-white" : "border-[#DFD0C0] text-[#4C443D]")}>Wall {index + 1} · {Math.round(candidate.confidence * 100)}%</button>)}</div></div>}
                        {detectionState === "manual" && !wallCorners && <div className="mt-3 rounded-lg bg-[#F6EEE4] px-3 py-2.5 text-[11px] leading-relaxed text-[#594D43]">No wall outline was confident enough to apply. Click the wall corners on the photo in this order: top left, top right, bottom right, bottom left.</div>}
                        <button type="button" onClick={retryDetection} disabled={detectionState === "detecting"} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#DFD0C0] bg-white px-3 py-2 text-xs font-semibold text-[#2A231F] hover:border-[#9B1C1C] disabled:opacity-50"><RefreshCw className="h-3.5 w-3.5" /> Retry Detection</button>
                        <button type="button" onClick={startManualPlacement} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-[#9B1C1C] hover:bg-[#9B1C1C]/5">{wallCorners ? "Adjust Wall Corners" : "Select Wall Manually"}</button>
                      </div>
                      {wallCorners && <button type="button" disabled={detectionState === "detecting"} onClick={() => selectStep(2)} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#9B1C1C] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(155,28,28,0.18)] hover:bg-[#7D1616] disabled:cursor-wait disabled:opacity-60">{detectionState === "detecting" ? "Detecting wall…" : "Continue to Design"} <ArrowRight className="h-4 w-4" /></button>}
                    </aside>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="mx-auto max-w-4xl">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9B1C1C]">STEP 02 · YOUR ARTWORK</p><h2 className="mt-1 font-serif text-2xl text-[#1A1A1A]">Choose a design for this wall</h2><p className="mt-1 text-sm text-[#746B64]">Use an ATELIER design or upload your own. Transparent artwork stays transparent.</p></div><button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-full border border-[#DFD0C0] px-4 py-2 text-xs font-semibold hover:border-[#9B1C1C] hover:text-[#9B1C1C]"><ArrowLeft className="h-3.5 w-3.5" /> Back to Wall</button></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-[#E5D9CA] bg-[#FCFAF6] p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold text-[#1A1A1A]">ATELIER Gallery</p><p className="mt-1 text-xs text-[#746B64]">Select from the existing design collection.</p></div><ImageIcon className="h-5 w-5 text-[#9B1C1C]" /></div><button type="button" onClick={openArtworkPicker} className="mt-4 flex w-full items-center gap-3 rounded-xl border border-[#E5D9CA] bg-white p-3 text-left hover:border-[#9B1C1C]"><span className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#EAE0D3]"><img src={galleryArtworkUrl(selectedDesign)} alt="" className="h-full w-full object-cover" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[#1A1A1A]">{selectedDesign.title}</span><span className="mt-1 block text-xs text-[#746B64]">{selectedDesign.categoryLabel}</span><span className="mt-1 block text-[11px] font-semibold text-[#9B1C1C]">Browse designs</span></span><ChevronDown className="h-4 w-4 -rotate-90 text-[#746B64]" /></button></div>
                  <div className="rounded-xl border border-[#E5D9CA] bg-[#FCFAF6] p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold text-[#1A1A1A]">Upload your design</p><p className="mt-1 text-xs leading-relaxed text-[#746B64]">JPG, PNG, or WebP up to 25 MB. PNG/WebP transparency is supported.</p></div><Upload className="h-5 w-5 shrink-0 text-[#9B1C1C]" /></div><input ref={artworkInputRef} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) loadArtworkFile(file); }} /><button type="button" onClick={() => artworkInputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDraggingUpload("artwork"); }} onDragLeave={() => setDraggingUpload(null)} onDrop={(event) => { event.preventDefault(); setDraggingUpload(null); const file = event.dataTransfer.files?.[0]; if (file) loadArtworkFile(file); }} className={cn("mt-4 flex min-h-[95px] w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 text-center transition-colors", draggingUpload === "artwork" ? "border-[#9B1C1C] bg-[#FAF0EC]" : "border-[#DFD0C0] bg-white hover:border-[#9B1C1C]")}><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9B1C1C]/10 text-[#9B1C1C]"><Upload className="h-4 w-4" /></span><span><span className="block text-sm font-semibold text-[#1A1A1A]">Drop artwork or browse files</span><span className="mt-1 block text-[11px] text-[#746B64]">{artworkFile ? `${artworkFile.name} · ${formatFileSize(artworkFile.size)}` : "A larger source image gives a sharper preview."}</span></span></button>{artworkProgress > 0 && artworkProgress < 100 && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E9DED0]"><span className="block h-full bg-[#9B1C1C]" style={{ width: `${artworkProgress}%` }} /></div>}</div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5D9CA] bg-white p-3"><div className="flex min-w-0 items-center gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#EAE0D3]"><img src={displayArtworkUrl} alt="" className="h-full w-full object-cover" /></div><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#746B64]">Selected artwork</p><p className="truncate text-sm font-semibold text-[#1A1A1A]">{displayArtworkName}</p></div></div>{artworkFile && <button type="button" onClick={() => { if (artworkUrlRef.current) URL.revokeObjectURL(artworkUrlRef.current); artworkUrlRef.current = null; setArtworkUrl(null); setArtworkFile(null); setSavedArtworkUrl(null); setArtworkName(""); }} className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#9B1C1C] hover:bg-[#9B1C1C]/5">Use selected gallery design</button>}</div>
                {artworkImage && <button type="button" onClick={() => selectStep(3)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#9B1C1C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#7D1616]">Auto-Fit Design <Sparkles className="h-4 w-4" /></button>}
                {!artworkImage && <p role="status" className="mt-4 flex items-center gap-2 text-xs text-[#746B64]"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading the selected artwork…</p>}
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9B1C1C]">STEP 03 · REVIEW YOUR WALL</p><h2 className="mt-1 font-serif text-2xl text-[#1A1A1A]">Your perspective-fit preview</h2><p className="mt-1 text-sm text-[#746B64]">Artwork follows the selected wall plane. Adjust the fit, lighting, or wall corners.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => selectStep(2)} className="rounded-full border border-[#DFD0C0] px-3.5 py-2 text-xs font-semibold hover:border-[#9B1C1C] hover:text-[#9B1C1C]">Replace Artwork</button><button type="button" onClick={() => selectStep(1)} className="rounded-full border border-[#DFD0C0] px-3.5 py-2 text-xs font-semibold hover:border-[#9B1C1C] hover:text-[#9B1C1C]">Replace Wall Image</button></div></div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex rounded-full border border-[#E5D9CA] bg-[#FCFAF6] p-1"><button type="button" onClick={() => { setManualMode(false); setProtectMode(false); }} className={cn("rounded-full px-4 py-2 text-xs font-semibold", !manualMode ? "bg-[#9B1C1C] text-white" : "text-[#5F554D]")}>Auto-Fit</button><button type="button" onClick={() => { setManualMode(true); setProtectMode(false); }} className={cn("rounded-full px-4 py-2 text-xs font-semibold", manualMode ? "bg-[#9B1C1C] text-white" : "text-[#5F554D]")}>Manual Adjust</button></div>
                  <div className="flex items-center gap-2"><button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(0.7, Math.round((value - 0.1) * 10) / 10))} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DFD0C0] bg-white"><Minus className="h-4 w-4" /></button><span className="min-w-[42px] text-center text-xs tabular-nums text-[#5F554D]">{Math.round(zoom * 100)}%</span><button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(1.6, Math.round((value + 0.1) * 10) / 10))} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DFD0C0] bg-white"><Plus className="h-4 w-4" /></button></div>
                </div>
                <div className="overflow-auto rounded-xl border border-[#E5D9CA] bg-[#EDE5DA] p-2 sm:p-3">
                  <div className="mx-auto overflow-hidden" style={{ ...stageWidthStyle, transform: `scale(${zoom})`, transformOrigin: "top center", marginBottom: zoom > 1 ? `${(zoom - 1) * 100}%` : undefined }}>
                    <div ref={stageRef} onPointerDown={handleStagePointerDown} onPointerMove={handleStagePointerMove} onPointerUp={finishPointerAction} onPointerCancel={finishPointerAction} className={cn("relative h-full w-full touch-none overflow-hidden rounded-lg bg-[#DED4C8]", protectMode ? "cursor-crosshair" : "")}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}<img src={roomUrl || ""} alt="Original room before artwork" className="absolute inset-0 h-full w-full object-fill" />
                      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${100 - compareX * 100}%)` }}><canvas ref={resultCanvasRef} className="absolute inset-0 h-full w-full object-fill" /></div>
                      {manualMode && wallCorners && <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full"><polygon points={wallCorners.map((point) => `${point.x * 100},${point.y * 100}`).join(" ")} fill="rgba(155,28,28,0.06)" stroke="#9B1C1C" strokeWidth="0.5" /></svg>}
                      {manualMode && wallCorners && wallCorners.map((point, index) => <button key={index} type="button" aria-label={`Adjust wall corner ${index + 1}`} onPointerDown={(event) => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); setDraggingCorner(index); }} className="absolute z-20 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-full border-2 border-white bg-[#9B1C1C] text-[10px] font-bold text-white shadow-md" style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}>{index + 1}</button>)}
                      {protectMode && protectionStrokes.map((stroke, index) => <svg key={index} viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full"><polyline points={stroke.points.map((point) => `${point.x * 100},${point.y * 100}`).join(" ")} fill="none" stroke="rgba(211,123,40,0.58)" strokeWidth={stroke.width * 100} strokeLinecap="round" strokeLinejoin="round" /></svg>)}
                      {isRendering && <div className="absolute top-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#1A1A1A]/80 px-3 py-1.5 text-[11px] font-medium text-white"><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Applying design</div>}
                      <span className="absolute top-3 left-3 rounded-full bg-[#1A1A1A]/75 px-2.5 py-1 text-[10px] font-semibold text-white">Before</span><span className="absolute top-3 right-3 rounded-full bg-[#9B1C1C]/90 px-2.5 py-1 text-[10px] font-semibold text-white">After</span>
                      <div className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-white shadow" style={{ left: `${compareX * 100}%` }} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3"><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71675F]">Before</span><input aria-label="Before and after comparison" type="range" min="0" max="100" value={Math.round(compareX * 100)} onChange={(event) => setCompareX(Number(event.target.value) / 100)} className="h-1.5 flex-1 accent-[#9B1C1C]" /><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9B1C1C]">After</span></div>
                {renderError && <div role="alert" className="mt-3 rounded-xl border border-[#DDB6AE] bg-[#FFF8F6] px-3 py-2.5 text-xs text-[#6D2724]">{renderError}</div>}
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <label className="rounded-xl border border-[#E5D9CA] bg-[#FCFAF6] p-3"><span className="block text-[11px] font-semibold text-[#1A1A1A]">Artwork fit</span><select value={mode} onChange={(event) => { const nextMode = event.target.value as FitMode; setMode(nextMode); if (nextMode === "cover") setScale((current) => Math.max(1, current)); }} className="mt-2 w-full rounded-lg border border-[#DFD0C0] bg-white px-3 py-2 text-xs"><option value="cover">Cover Wall</option><option value="contain">Contain Design</option><option value="repeat">Repeat Pattern</option></select></label>
                  <label className="rounded-xl border border-[#E5D9CA] bg-[#FCFAF6] p-3"><span className="flex justify-between text-[11px] font-semibold text-[#1A1A1A]"><span>Scale &amp; crop</span><span>{scale.toFixed(1)}×</span></span><input aria-label="Artwork scale" type="range" min={mode === "cover" ? 1 : 0.55} max="2.2" step="0.05" value={scale} onChange={(event) => setScale(Number(event.target.value))} className="mt-3 w-full accent-[#9B1C1C]" /><div className="mt-1 flex gap-2"><input aria-label="Artwork horizontal position" type="range" min="-0.45" max="0.45" step="0.01" value={offsetX} onChange={(event) => setOffsetX(Number(event.target.value))} className="w-full accent-[#9B1C1C]"/><input aria-label="Artwork vertical position" type="range" min="-0.45" max="0.45" step="0.01" value={offsetY} onChange={(event) => setOffsetY(Number(event.target.value))} className="w-full accent-[#9B1C1C]"/></div></label>
                  <label className="rounded-xl border border-[#E5D9CA] bg-[#FCFAF6] p-3"><span className="flex justify-between text-[11px] font-semibold text-[#1A1A1A]"><span>Opacity</span><span>{Math.round(opacity * 100)}%</span></span><input aria-label="Artwork opacity" type="range" min="0.2" max="1" step="0.01" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} className="mt-3 w-full accent-[#9B1C1C]" /></label>
                  <label className="rounded-xl border border-[#E5D9CA] bg-[#FCFAF6] p-3"><span className="flex justify-between text-[11px] font-semibold text-[#1A1A1A]"><span>Wall lighting blend</span><span>{Math.round(lighting * 100)}%</span></span><input aria-label="Wall lighting strength" type="range" min="0" max="1" step="0.01" value={lighting} onChange={(event) => setLighting(Number(event.target.value))} className="mt-3 w-full accent-[#9B1C1C]" /></label>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5D9CA] bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { setProtectMode((value) => !value); setManualMode(false); }} className={cn("inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold", protectMode ? "border-[#B26A27] bg-[#FFF2E2] text-[#754117]" : "border-[#DFD0C0] text-[#3E3731]")}><ShieldCheck className="h-4 w-4" />{protectMode ? "Finish protecting objects" : "Protect foreground objects"}</button>{protectionStrokes.length > 0 && <button type="button" onClick={() => setProtectionStrokes((items) => items.slice(0, -1))} className="rounded-full px-3 py-2 text-xs font-semibold text-[#9B1C1C]">Undo brush</button>}{protectMode && <label className="flex items-center gap-2 text-[11px] text-[#746B64]">Brush <input type="range" min="0.015" max="0.09" step="0.005" value={brushWidth} onChange={(event) => setBrushWidth(Number(event.target.value))} className="w-24 accent-[#9B1C1C]" /></label>}</div>
                  <p className="text-[11px] text-[#746B64]">{protectMode ? "Paint over furniture or objects to keep them in front of the artwork." : protectionStrokes.length ? `${protectionStrokes.length} foreground area${protectionStrokes.length === 1 ? "" : "s"} protected` : "Texture and room lighting blend through the artwork."}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={retryDetection} disabled={detectionState === "detecting"} className="inline-flex items-center gap-2 rounded-full border border-[#DFD0C0] px-4 py-2.5 text-xs font-semibold text-[#3B332D] hover:border-[#9B1C1C] disabled:opacity-50"><RefreshCw className="h-3.5 w-3.5" /> Apply Auto-Fit Again</button><button type="button" onClick={() => { analysisTokenRef.current += 1; setWallCorners(null); setManualPoints([]); setManualMode(true); setDetectionState("manual"); setStep(1); }} className="rounded-full border border-[#DFD0C0] px-4 py-2.5 text-xs font-semibold text-[#3B332D] hover:border-[#9B1C1C]">Select Different Wall</button><button type="button" onClick={() => { setScale(1); setOffsetX(0); setOffsetY(0); setOpacity(0.9); setLighting(0.55); setBrightness(100); setProtectionStrokes([]); setCompareX(0.5); setZoom(1); }} className="rounded-full border border-[#DFD0C0] px-4 py-2.5 text-xs font-semibold text-[#3B332D] hover:border-[#9B1C1C]">Reset Changes</button></div>
              </div>
            )}
          </main>

          <aside className="flex flex-col gap-4">
            {step === 3 && <div className="rounded-2xl border border-[#E5D9CA] bg-[#FFFDF9] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B1C1C]">YOUR PROJECT</p><div className="mt-3 flex items-center gap-3"><div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#EAE0D3]"><img src={displayArtworkUrl} alt="" className="h-full w-full object-cover" /></div><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#1A1A1A]">{displayArtworkName}</p><p className="truncate text-xs text-[#746B64]">{roomName}</p></div></div><button type="button" onClick={handleDownload} disabled={!roomImage || !artworkImage || isRendering} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#9B1C1C] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#7D1616] disabled:cursor-wait disabled:opacity-60">{isRendering ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download Preview</button><button type="button" onClick={handleSaveProject} disabled={isSaving || !roomFile || !wallCorners} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#DFD0C0] bg-white px-4 py-2.5 text-xs font-semibold text-[#2A231F] hover:border-[#9B1C1C] disabled:opacity-60">{isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Project</button><a href={enquiryHref} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#DFD0C0] px-4 py-2.5 text-xs font-semibold text-[#3B332D] hover:border-[#9B1C1C] hover:text-[#9B1C1C]">Enquire With This Design <ArrowRight className="h-4 w-4" /></a><p className="mt-3 flex items-center gap-1.5 text-[10px] leading-relaxed text-[#746B64]"><ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-700" /> Photos and project files are saved only in this browser.</p></div>}
            {step === 3 && <div className="rounded-2xl border border-[#E5D9CA] bg-[#FFFDF9] p-4"><p className="text-xs font-semibold text-[#1A1A1A]">Room photo</p><p className="mt-1 truncate text-xs text-[#746B64]">{roomName} · {roomImage ? `${roomImage.naturalWidth} × ${roomImage.naturalHeight}px` : "Preparing"}</p><p className="mt-3 text-xs font-semibold text-[#1A1A1A]">Fit quality</p>{manualMode ? <p className="mt-1 text-[11px] text-[#746B64]">Manual wall placement</p> : <div className="mt-1 flex items-center gap-2"><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E9DED0]"><span className="block h-full rounded-full bg-[#9B1C1C]" style={{ width: `${detectionPercent ?? 0}%` }} /></span><span className="text-[11px] tabular-nums text-[#746B64]">{detectionPercent ?? 0}%</span></div>}<p className="mt-2 text-[10px] leading-relaxed text-[#746B64]">Wall confidence describes detected geometry only; review the outline before using the preview.</p></div>}
            {(step === 1 || step === 2) && <div className="rounded-2xl border border-[#E5D9CA] bg-[#FFFDF9] p-4"><p className="text-xs font-semibold text-[#1A1A1A]">Your selected design</p><div className="mt-3 flex items-center gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#EAE0D3]"><img src={displayArtworkUrl} alt="" className="h-full w-full object-cover" /></div><div className="min-w-0"><p className="truncate text-xs font-semibold text-[#1A1A1A]">{displayArtworkName}</p><button type="button" onClick={openArtworkPicker} className="mt-1 text-[11px] font-semibold text-[#9B1C1C] hover:underline">Change design</button></div></div></div>}
            <div className="rounded-2xl border border-[#E5D9CA] bg-[#FFFDF9] p-4"><p className="text-xs font-semibold text-[#1A1A1A]">How wall fitting works</p><p className="mt-1.5 text-xs leading-relaxed text-[#746B64]">Wall suggestions come from image edges and perspective lines in your photo. Low-confidence results stay in manual selection so the artwork is not placed on an assumed wall.</p></div>
          </aside>
        </div>
      </div>

      <SelectedArtworkSelectorModal isOpen={galleryOpen} selectedDesign={selectedDesign} categories={categories} designs={designs} onSelectDesign={handleGallerySelection} onClose={() => setGalleryOpen(false)} />
      {savedProjectsOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1A1A]/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSavedProjectsOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby="saved-auto-fit-title" className="max-h-[80vh] w-full max-w-xl overflow-hidden rounded-2xl border border-[#E5D9CA] bg-[#FFFDF9] shadow-2xl"><div className="flex items-center justify-between border-b border-[#E5D9CA] px-5 py-4"><div><h2 id="saved-auto-fit-title" className="font-serif text-xl text-[#1A1A1A]">Saved Projects</h2><p className="mt-0.5 text-xs text-[#746B64]">Stored on this device</p></div><button type="button" onClick={() => setSavedProjectsOpen(false)} aria-label="Close saved projects" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DFD0C0]"><X className="h-4 w-4" /></button></div><div className="max-h-[60vh] overflow-y-auto p-4">{savedProjects.length ? savedProjects.map((project) => <div key={project.id} className="mb-2 flex items-center gap-3 rounded-xl border border-[#E5D9CA] bg-white p-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F6EEE4] text-[#9B1C1C]"><ImageIcon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#1A1A1A]">{project.artworkName}</p><p className="truncate text-[11px] text-[#746B64]">{project.roomName} · {new Date(project.savedAt).toLocaleDateString()}</p></div><button type="button" onClick={() => applyLoadedProject(project.id)} className="rounded-full bg-[#9B1C1C] px-3 py-1.5 text-[11px] font-semibold text-white">Open</button><button type="button" onClick={() => handleDeleteProject(project.id)} aria-label={`Delete ${project.artworkName}`} className="rounded-full px-2 py-1.5 text-[11px] font-semibold text-[#9B1C1C]">Delete</button></div>) : <p className="py-10 text-center text-sm text-[#746B64]">No projects saved on this device yet.</p>}</div></section></div>}
    </section>
  );
}
