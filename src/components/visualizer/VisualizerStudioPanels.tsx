"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PrintableArtworkResolution } from "@/lib/artwork-source-crops";
import { CatalogueDesignItem } from "@/lib/designs-catalogue";
import {
  formatCalibratedMeasurementSummary,
  StudioLayersState,
  StudioMeasurementState,
  StudioSavedProject,
  SurfaceFinishId,
} from "@/lib/visualizer-studio-storage";
import { ArtworkSwatchThumbnail } from "@/components/visualizer/SelectedArtworkSelector";
import { cn } from "@/lib/cn";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  Copy,
  Download,
  Eye,
  EyeOff,
  FlipHorizontal,
  Info,
  Keyboard,
  Layers,
  Lock,
  Palette,
  Redo2,
  RefreshCw,
  RotateCcw,
  Ruler,
  Settings2,
  Sliders,
  Trash2,
  Undo2,
  Unlock,
  X,
} from "lucide-react";

export type InspectorPrimaryTab = "customize" | "info" | "export";
export type StudioToolId =
  | "map"
  | "adjust"
  | "compare"
  | "layers"
  | "measure"
  | "lighting"
  | "share";

export const SURFACE_FINISH_OPTIONS: ReadonlyArray<{
  id: SurfaceFinishId;
  label: string;
  swatchStyle: React.CSSProperties;
  description: string;
}> = [
  {
    id: "plaster",
    label: "Plaster",
    swatchStyle: {
      background:
        "radial-gradient(circle at 30% 30%, #DEC6AC 0%, #C5A486 58%, #AE8B6D 100%)",
    },
    description: "Warm Venetian mineral plaster blend",
  },
  {
    id: "limewash",
    label: "Limewash",
    swatchStyle: {
      background:
        "linear-gradient(135deg, #EFE7DC 0%, #DFD3C3 48%, #EDE4D8 100%)",
    },
    description: "Soft chalky architectural lime finish",
  },
  {
    id: "textured",
    label: "Textured",
    swatchStyle: {
      background:
        "radial-gradient(circle at 35% 35%, #E0D5C5 0%, #C9B9A5 65%, #B8A58F 100%)",
    },
    description: "Subtle tactile micro-relief grain",
  },
  {
    id: "matte",
    label: "Matte",
    swatchStyle: {
      background:
        "linear-gradient(145deg, #D5C9BA 0%, #BFB1A0 100%)",
    },
    description: "Color-true smooth studio matte",
  },
];

interface StudioRightInspectorProps {
  activeTab: InspectorPrimaryTab;
  activeTool: StudioToolId;
  onSelectTab: (tab: InspectorPrimaryTab) => void;
  onSelectTool: (tool: StudioToolId) => void;
  selectedDesign: CatalogueDesignItem;
  printableInfo: PrintableArtworkResolution;
  activeRoomLabel: string;
  applicationMode: "mural" | "pattern";
  onApplicationModeChange: (mode: "mural" | "pattern") => void;
  scale: number;
  onScaleChange: (val: number) => void;
  onSliderCommitStart: () => void;
  patternRepeatScale: number;
  onPatternRepeatScaleChange: (val: number) => void;
  panX: number;
  panY: number;
  onNudgePan: (dx: number, dy: number) => void;
  onCenterPan: () => void;
  rotationDegrees: number;
  onRotationDegreesChange: (deg: number) => void;
  onResetRotationDegrees: () => void;
  opacity: number;
  onOpacityChange: (val: number) => void;
  brightness: number;
  onBrightnessChange: (val: number) => void;
  surfaceFinish: SurfaceFinishId;
  onSurfaceFinishChange: (finish: SurfaceFinishId) => void;
  blendMultiply: boolean;
  onToggleBlendMultiply: () => void;
  flipHorizontal: boolean;
  onToggleFlipHorizontal: () => void;
  onRotateQuarterTurn: () => void;
  layers: StudioLayersState;
  onUpdateLayers: (next: StudioLayersState) => void;
  onResetForegroundMask: () => void;
  measurement: StudioMeasurementState;
  onUpdateMeasurement: (next: StudioMeasurementState) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onResetAdjustments: () => void;
  onResetCorners: () => void;
  exportFormat: "png" | "jpeg";
  onExportFormatChange: (fmt: "png" | "jpeg") => void;
  exportResolutionLabel: string;
  onExportSnapshot: () => void;
  onSaveProject: () => void;
  onCopyShareLink: () => void;
  copiedShareLink: boolean;
  selectedEnquirySurface: string;
  onSelectEnquirySurface: (surface: string) => void;
  enquiryHref: string;
}

export function StudioRightInspector({
  activeTab,
  activeTool,
  onSelectTab,
  onSelectTool,
  selectedDesign,
  printableInfo,
  activeRoomLabel,
  applicationMode,
  onApplicationModeChange,
  scale,
  onScaleChange,
  onSliderCommitStart,
  patternRepeatScale,
  onPatternRepeatScaleChange,
  panX,
  panY,
  onNudgePan,
  onCenterPan,
  rotationDegrees,
  onRotationDegreesChange,
  onResetRotationDegrees,
  opacity,
  onOpacityChange,
  brightness,
  onBrightnessChange,
  surfaceFinish,
  onSurfaceFinishChange,
  blendMultiply,
  onToggleBlendMultiply,
  flipHorizontal,
  onToggleFlipHorizontal,
  onRotateQuarterTurn,
  layers,
  onUpdateLayers,
  onResetForegroundMask,
  measurement,
  onUpdateMeasurement,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onResetAdjustments,
  onResetCorners,
  exportFormat,
  onExportFormatChange,
  exportResolutionLabel,
  onExportSnapshot,
  onSaveProject,
  onCopyShareLink,
  copiedShareLink,
  selectedEnquirySurface,
  onSelectEnquirySurface,
  enquiryHref,
}: StudioRightInspectorProps) {
  const [scaleGroupOpen, setScaleGroupOpen] = useState(true);
  const [visualGroupOpen, setVisualGroupOpen] = useState(true);
  const [advancedGroupOpen, setAdvancedGroupOpen] = useState(false);

  const showLayersSubpanel = activeTool === "layers" && activeTab === "customize";
  const showMeasureSubpanel = activeTool === "measure" && activeTab === "customize";

  const calibratedSummary = formatCalibratedMeasurementSummary(measurement);

  const handlePositionKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 0.08 : 0.03;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onNudgePan(-step, 0);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      onNudgePan(step, 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      onNudgePan(0, -step);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onNudgePan(0, step);
    }
  };

  return (
    <aside
      aria-label="Artwork customization and export inspector"
      className="flex h-full flex-col rounded-2xl border border-[#E5D9CA] bg-[#FFFDF9] p-3.5 sm:p-4"
    >
      {/* Top 3 Inspector Tabs */}
      <div
        role="tablist"
        aria-label="Inspector sections"
        className="flex items-center gap-1.5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "customize"}
          onClick={() => {
            onSelectTab("customize");
            if (activeTool === "layers" || activeTool === "measure" || activeTool === "share") {
              onSelectTool("adjust");
            }
          }}
          className={cn(
            "inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[11.5px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]",
            activeTab === "customize" && !showLayersSubpanel && !showMeasureSubpanel
              ? "bg-[#9B1C1C] text-[#FFFDF9]"
              : "border border-[#E5D9CA] bg-[#FAF6F0] text-[#2A231F] hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
          )}
        >
          <Sliders className="h-3.5 w-3.5 shrink-0" />
          <span>Customize</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "info"}
          onClick={() => onSelectTab("info")}
          className={cn(
            "inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[11.5px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]",
            activeTab === "info"
              ? "bg-[#9B1C1C] text-[#FFFDF9]"
              : "border border-[#E5D9CA] bg-[#FAF6F0] text-[#2A231F] hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
          )}
        >
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>Artwork Info</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "export"}
          onClick={() => {
            onSelectTab("export");
            onSelectTool("share");
          }}
          className={cn(
            "inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[11.5px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]",
            activeTab === "export"
              ? "bg-[#9B1C1C] text-[#FFFDF9]"
              : "border border-[#E5D9CA] bg-[#FAF6F0] text-[#2A231F] hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
          )}
        >
          <Download className="h-3.5 w-3.5 shrink-0" />
          <span>Export & Enquire</span>
        </button>
      </div>

      {/* Scrollable Inspector Body */}
      <div className="mt-3.5 flex-1 space-y-3 overflow-y-auto pr-0.5">
        {/* SUBPANEL A: LAYERS MANAGER (Section 21) */}
        {showLayersSubpanel && (
          <div className="rounded-xl border border-[#E5D9CA] bg-[#FAF6F0] p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#9B1C1C]" />
                <h3 className="font-sans text-sm font-semibold text-[#1A1A1A]">
                  Layers Manager
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectTool("adjust")}
                className="cursor-pointer text-xs font-medium text-[#9B1C1C] hover:underline"
              >
                All Controls
              </button>
            </div>
            <p className="mt-1 text-xs text-[#5C524B]">
              Toggle visibility or lock individual composition layers.
            </p>

            <div className="mt-3 space-y-2">
              {/* Layer 1: Corner Guides */}
              <div className="flex items-center justify-between gap-2 rounded-xl border border-[#E5D9CA] bg-[#FFFDF9] px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#1A1A1A]">
                    Corner Guides (01–04)
                  </p>
                  <p className="text-[11px] text-[#5C524B]">
                    Perspective quad boundary & pins
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateLayers({
                        ...layers,
                        guidesLocked: !layers.guidesLocked,
                      })
                    }
                    aria-label={
                      layers.guidesLocked
                        ? "Unlock corner handles"
                        : "Lock corner handles"
                    }
                    className={cn(
                      "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border text-xs transition-colors",
                      layers.guidesLocked
                        ? "border-[#9B1C1C] bg-[#9B1C1C]/10 text-[#9B1C1C]"
                        : "border-[#E5D9CA] bg-[#FAF6F0] text-[#5C524B] hover:text-[#1A1A1A]"
                    )}
                  >
                    {layers.guidesLocked ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : (
                      <Unlock className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateLayers({
                        ...layers,
                        guidesVisible: !layers.guidesVisible,
                      })
                    }
                    aria-label={
                      layers.guidesVisible
                        ? "Hide corner guides"
                        : "Show corner guides"
                    }
                    className={cn(
                      "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border text-xs transition-colors",
                      layers.guidesVisible
                        ? "border-[#DFD0C0] bg-[#FAF6F0] text-[#1A1A1A]"
                        : "border-[#E5D9CA] bg-[#FAF6F0] text-[#746B64]"
                    )}
                  >
                    {layers.guidesVisible ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Layer 2: Optional Foreground Obstacle Mask */}
              <div className="rounded-xl border border-[#E5D9CA] bg-[#FFFDF9] px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#1A1A1A]">
                      Foreground Mask
                    </p>
                    <p className="text-[11px] text-[#5C524B]">
                      Keep furniture or windows unprinted
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {layers.foregroundMask.enabled && (
                      <button
                        type="button"
                        onClick={onResetForegroundMask}
                        className="cursor-pointer rounded-lg border border-[#DFD0C0] bg-[#FAF6F0] px-2 py-1 text-[11px] font-medium text-[#2A231F] hover:border-[#9B1C1C]"
                      >
                        Reset Box
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateLayers({
                          ...layers,
                          foregroundMask: {
                            ...layers.foregroundMask,
                            enabled: !layers.foregroundMask.enabled,
                          },
                        })
                      }
                      aria-label={
                        layers.foregroundMask.enabled
                          ? "Disable foreground obstacle mask"
                          : "Enable foreground obstacle mask"
                      }
                      className={cn(
                        "inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border px-2.5 text-[11px] font-semibold transition-colors",
                        layers.foregroundMask.enabled
                          ? "border-[#9B1C1C] bg-[#9B1C1C] text-[#FFFDF9]"
                          : "border-[#DFD0C0] bg-[#FAF6F0] text-[#2A231F] hover:border-[#9B1C1C]"
                      )}
                    >
                      {layers.foregroundMask.enabled ? "Active" : "Enable"}
                    </button>
                  </div>
                </div>
                {layers.foregroundMask.enabled && (
                  <p className="mt-1.5 text-[11px] leading-relaxed text-[#5C524B]">
                    Drag the amber mask box on the canvas over a headboard, sofa, or window frame to keep it in front of the mural.
                  </p>
                )}
              </div>

              {/* Layer 3: Mapped Artwork */}
              <div className="rounded-xl border border-[#E5D9CA] bg-[#FFFDF9] px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#1A1A1A]">
                      Mapped Artwork
                    </p>
                    <p className="truncate text-[11px] text-[#5C524B]">
                      {selectedDesign.title} ({Math.round(opacity * 100)}% blend)
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateLayers({
                          ...layers,
                          artworkLocked: !layers.artworkLocked,
                        })
                      }
                      aria-label={
                        layers.artworkLocked
                          ? "Unlock mapped artwork adjustments"
                          : "Lock mapped artwork adjustments"
                      }
                      className={cn(
                        "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border text-xs transition-colors",
                        layers.artworkLocked
                          ? "border-[#9B1C1C] bg-[#9B1C1C]/10 text-[#9B1C1C]"
                          : "border-[#E5D9CA] bg-[#FAF6F0] text-[#5C524B] hover:text-[#1A1A1A]"
                      )}
                    >
                      {layers.artworkLocked ? (
                        <Lock className="h-3.5 w-3.5" />
                      ) : (
                        <Unlock className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateLayers({
                          ...layers,
                          artworkVisible: !layers.artworkVisible,
                        })
                      }
                      aria-label={
                        layers.artworkVisible
                          ? "Hide mapped artwork layer"
                          : "Show mapped artwork layer"
                      }
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#DFD0C0] bg-[#FAF6F0] text-[#1A1A1A]"
                    >
                      {layers.artworkVisible ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-[#746B64]" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2.5">
                  <span className="text-[11px] text-[#5C524B]">Opacity</span>
                  <input
                    type="range"
                    min={0.15}
                    max={1}
                    step={0.01}
                    disabled={layers.artworkLocked}
                    value={opacity}
                    onPointerDown={onSliderCommitStart}
                    onChange={(e) => onOpacityChange(Number(e.target.value))}
                    aria-label="Mapped artwork layer opacity"
                    className="h-1.5 flex-1 cursor-pointer accent-[#9B1C1C] disabled:opacity-45"
                  />
                  <span className="w-10 text-right text-[11px] font-semibold tabular-nums text-[#1A1A1A]">
                    {Math.round(opacity * 100)}%
                  </span>
                </div>
              </div>

              {/* Layer 4: Base Original Room (Protected) */}
              <div className="flex items-center justify-between gap-2 rounded-xl border border-[#E5D9CA] bg-[#F5EFE6] px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#1A1A1A]">
                    Original Room
                  </p>
                  <p className="truncate text-[11px] text-[#5C524B]">
                    {activeRoomLabel} (Protected base layer)
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#DFD0C0] bg-[#FFFDF9] px-2 py-1 text-[10px] font-semibold text-[#5C524B]">
                  <Lock className="h-3 w-3" />
                  <span>Base</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SUBPANEL B: MEASUREMENT & CALIBRATION (Section 22) */}
        {showMeasureSubpanel && (
          <div className="rounded-xl border border-[#E5D9CA] bg-[#FAF6F0] p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-[#9B1C1C]" />
                <h3 className="font-sans text-sm font-semibold text-[#1A1A1A]">
                  Wall Measurement & Scale
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectTool("adjust")}
                className="cursor-pointer text-xs font-medium text-[#9B1C1C] hover:underline"
              >
                All Controls
              </button>
            </div>

            <div
              className={cn(
                "mt-2.5 rounded-xl border px-3 py-2.5 text-xs leading-relaxed",
                calibratedSummary.isCalibrated
                  ? "border-[#9B1C1C]/30 bg-[#FFFDF9] text-[#1A1A1A]"
                  : "border-[#DFD0C0] bg-[#F5EFE6] text-[#5C524B]"
              )}
            >
              <p className="font-semibold text-[#1A1A1A]">
                {calibratedSummary.summaryText}
              </p>
              {!calibratedSummary.isCalibrated && (
                <p className="mt-1 text-[11px] text-[#5C524B]">
                  Four corner pins align perspective only. Enter known wall width and height below to plan approximate print dimensions.
                </p>
              )}
            </div>

            {/* Unit Selector */}
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#2A231F]">Unit</span>
              <div className="inline-flex rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] p-0.5">
                {(["ft", "in", "m"] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() =>
                      onUpdateMeasurement({ ...measurement, unit })
                    }
                    className={cn(
                      "cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold transition-colors",
                      measurement.unit === unit
                        ? "bg-[#9B1C1C] text-[#FFFDF9]"
                        : "text-[#5C524B] hover:text-[#1A1A1A]"
                    )}
                  >
                    {unit === "ft" ? "Feet" : unit === "in" ? "Inches" : "Meters"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="text-[11px] font-medium text-[#5C524B]">
                  Wall Width ({measurement.unit})
                </span>
                <input
                  type="number"
                  min={0.5}
                  max={2000}
                  step="0.1"
                  inputMode="decimal"
                  placeholder={measurement.unit === "m" ? "e.g. 3.6" : "e.g. 12"}
                  value={measurement.widthInput}
                  onChange={(e) =>
                    onUpdateMeasurement({
                      ...measurement,
                      widthInput: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] px-3 py-2 text-sm tabular-nums text-[#1A1A1A] focus:border-[#9B1C1C] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-medium text-[#5C524B]">
                  Wall Height ({measurement.unit})
                </span>
                <input
                  type="number"
                  min={0.5}
                  max={2000}
                  step="0.1"
                  inputMode="decimal"
                  placeholder={measurement.unit === "m" ? "e.g. 2.8" : "e.g. 9.5"}
                  value={measurement.heightInput}
                  onChange={(e) =>
                    onUpdateMeasurement({
                      ...measurement,
                      heightInput: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] px-3 py-2 text-sm tabular-nums text-[#1A1A1A] focus:border-[#9B1C1C] focus:outline-none"
                />
              </label>
            </div>

            {calibratedSummary.isCalibrated && (
              <div className="mt-3 space-y-1.5 rounded-xl border border-[#E5D9CA] bg-[#FFFDF9] p-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5C524B]">Estimated Print Area</span>
                  <span className="font-semibold tabular-nums text-[#1A1A1A]">
                    {calibratedSummary.areaLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C524B]">Wall Aspect Ratio</span>
                  <span className="font-semibold tabular-nums text-[#1A1A1A]">
                    {calibratedSummary.aspectRatioLabel}
                  </span>
                </div>
                <p className="pt-1 text-[11px] text-[#5C524B]">
                  Dimensions will be included automatically when you click Enquire with This Design.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateMeasurement({
                      ...measurement,
                      widthInput: "",
                      heightInput: "",
                    })
                  }
                  className="mt-1 cursor-pointer text-[11px] font-medium text-[#9B1C1C] hover:underline"
                >
                  Clear Dimensions
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: CUSTOMIZE (Reference Accordion Groups) */}
        {activeTab === "customize" && !showLayersSubpanel && !showMeasureSubpanel && (
          <>
            {/* Group 1: Scale & Alignment */}
            <div className="rounded-xl border border-[#E5D9CA] bg-[#FAF6F0] p-3.5">
              <button
                type="button"
                onClick={() => setScaleGroupOpen((v) => !v)}
                aria-expanded={scaleGroupOpen}
                className="flex w-full cursor-pointer items-center justify-between text-left"
              >
                <span className="flex items-center gap-2 font-sans text-sm font-semibold text-[#1A1A1A]">
                  <Sliders className="h-4 w-4 text-[#9B1C1C]" />
                  <span>Scale & Alignment</span>
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-[#5C524B] transition-transform duration-200",
                    scaleGroupOpen && "rotate-180"
                  )}
                />
              </button>

              {scaleGroupOpen && (
                <div className="mt-3.5 space-y-3.5">
                  {/* Artwork Scale */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="studio-artwork-scale"
                        className="text-xs font-medium text-[#2A231F]"
                      >
                        Artwork Scale
                      </label>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3">
                      <input
                        id="studio-artwork-scale"
                        type="range"
                        min={0.4}
                        max={2.2}
                        step={0.02}
                        disabled={layers.artworkLocked}
                        value={scale}
                        onPointerDown={onSliderCommitStart}
                        onChange={(e) => onScaleChange(Number(e.target.value))}
                        className="h-1.5 flex-1 cursor-pointer accent-[#9B1C1C] disabled:opacity-45"
                      />
                      <span className="min-w-[56px] rounded-lg border border-[#E5D9CA] bg-[#FFFDF9] px-2.5 py-1 text-center text-xs font-semibold tabular-nums text-[#1A1A1A]">
                        {Math.round(scale * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Pattern Repeat Density (when Repeating Pattern is active) */}
                  {applicationMode === "pattern" && (
                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="studio-pattern-density"
                          className="text-xs font-medium text-[#2A231F]"
                        >
                          Pattern Repeat Scale
                        </label>
                      </div>
                      <div className="mt-1.5 flex items-center gap-3">
                        <input
                          id="studio-pattern-density"
                          type="range"
                          min={0.5}
                          max={2.4}
                          step={0.05}
                          disabled={layers.artworkLocked}
                          value={patternRepeatScale}
                          onPointerDown={onSliderCommitStart}
                          onChange={(e) =>
                            onPatternRepeatScaleChange(Number(e.target.value))
                          }
                          className="h-1.5 flex-1 cursor-pointer accent-[#9B1C1C] disabled:opacity-45"
                        />
                        <span className="min-w-[56px] rounded-lg border border-[#E5D9CA] bg-[#FFFDF9] px-2.5 py-1 text-center text-xs font-semibold tabular-nums text-[#1A1A1A]">
                          {Math.round(patternRepeatScale * 100)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Position Directional Controls */}
                  <div
                    tabIndex={0}
                    onKeyDown={handlePositionKeyDown}
                    aria-label="Artwork directional position controls — use arrow keys or buttons"
                    className="flex items-center justify-between gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-[#9B1C1C]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#2A231F]">
                        Position
                      </span>
                      {(Math.abs(panX) > 0.005 || Math.abs(panY) > 0.005) && (
                        <button
                          type="button"
                          onClick={onCenterPan}
                          className="cursor-pointer text-[11px] font-medium text-[#9B1C1C] hover:underline"
                        >
                          Center
                        </button>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={layers.artworkLocked}
                        onClick={() => onNudgePan(-0.05, 0)}
                        aria-label="Move artwork left"
                        className="flex h-8 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#DFD0C0] bg-[#FFFDF9] text-[#1A1A1A] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C] disabled:opacity-45"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={layers.artworkLocked}
                        onClick={() => onNudgePan(0, -0.05)}
                        aria-label="Move artwork up"
                        className="flex h-8 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#DFD0C0] bg-[#FFFDF9] text-[#1A1A1A] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C] disabled:opacity-45"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={layers.artworkLocked}
                        onClick={() => onNudgePan(0, 0.05)}
                        aria-label="Move artwork down"
                        className="flex h-8 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#DFD0C0] bg-[#FFFDF9] text-[#1A1A1A] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C] disabled:opacity-45"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={layers.artworkLocked}
                        onClick={() => onNudgePan(0.05, 0)}
                        aria-label="Move artwork right"
                        className="flex h-8 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#DFD0C0] bg-[#FFFDF9] text-[#1A1A1A] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C] disabled:opacity-45"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rotate (-45° to +45° + Reset button) */}
                  <div className="flex items-center gap-2.5">
                    <label
                      htmlFor="studio-artwork-rotate"
                      className="shrink-0 text-xs font-medium text-[#2A231F]"
                    >
                      Rotate
                    </label>
                    <button
                      type="button"
                      disabled={layers.artworkLocked}
                      onClick={onResetRotationDegrees}
                      aria-label="Reset rotation angle to zero degrees"
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#DFD0C0] bg-[#FFFDF9] text-[#2A231F] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C] disabled:opacity-45"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    <input
                      id="studio-artwork-rotate"
                      type="range"
                      min={-45}
                      max={45}
                      step={1}
                      disabled={layers.artworkLocked}
                      value={rotationDegrees}
                      onPointerDown={onSliderCommitStart}
                      onChange={(e) =>
                        onRotationDegreesChange(Number(e.target.value))
                      }
                      className="h-1.5 min-w-0 flex-1 cursor-pointer accent-[#9B1C1C] disabled:opacity-45"
                    />
                    <span className="min-w-[52px] rounded-lg border border-[#E5D9CA] bg-[#FFFDF9] px-2 py-1 text-center text-xs font-semibold tabular-nums text-[#1A1A1A]">
                      {rotationDegrees}°
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Group 2: Visual & Surface */}
            <div className="rounded-xl border border-[#E5D9CA] bg-[#FAF6F0] p-3.5">
              <button
                type="button"
                onClick={() => setVisualGroupOpen((v) => !v)}
                aria-expanded={visualGroupOpen}
                className="flex w-full cursor-pointer items-center justify-between text-left"
              >
                <span className="flex items-center gap-2 font-sans text-sm font-semibold text-[#1A1A1A]">
                  <Palette className="h-4 w-4 text-[#9B1C1C]" />
                  <span>Visual & Surface</span>
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-[#5C524B] transition-transform duration-200",
                    visualGroupOpen && "rotate-180"
                  )}
                />
              </button>

              {visualGroupOpen && (
                <div className="mt-3.5 space-y-3.5">
                  {/* Wall Blend Opacity */}
                  <div>
                    <label
                      htmlFor="studio-wall-opacity"
                      className="text-xs font-medium text-[#2A231F]"
                    >
                      Wall Blend Opacity
                    </label>
                    <div className="mt-1.5 flex items-center gap-3">
                      <input
                        id="studio-wall-opacity"
                        type="range"
                        min={0.15}
                        max={1}
                        step={0.01}
                        disabled={layers.artworkLocked}
                        value={opacity}
                        onPointerDown={onSliderCommitStart}
                        onChange={(e) => onOpacityChange(Number(e.target.value))}
                        className="h-1.5 flex-1 cursor-pointer accent-[#9B1C1C] disabled:opacity-45"
                      />
                      <span className="min-w-[56px] rounded-lg border border-[#E5D9CA] bg-[#FFFDF9] px-2.5 py-1 text-center text-xs font-semibold tabular-nums text-[#1A1A1A]">
                        {Math.round(opacity * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Ambient Daylight Exposure */}
                  <div>
                    <label
                      htmlFor="studio-daylight-exposure"
                      className="text-xs font-medium text-[#2A231F]"
                    >
                      Ambient Daylight Exposure
                    </label>
                    <div className="mt-1.5 flex items-center gap-3">
                      <input
                        id="studio-daylight-exposure"
                        type="range"
                        min={60}
                        max={135}
                        step={1}
                        disabled={layers.artworkLocked}
                        value={brightness}
                        onPointerDown={onSliderCommitStart}
                        onChange={(e) =>
                          onBrightnessChange(Number(e.target.value))
                        }
                        className="h-1.5 flex-1 cursor-pointer accent-[#9B1C1C] disabled:opacity-45"
                      />
                      <span className="min-w-[56px] rounded-lg border border-[#E5D9CA] bg-[#FFFDF9] px-2.5 py-1 text-center text-xs font-semibold tabular-nums text-[#1A1A1A]">
                        {brightness}%
                      </span>
                    </div>
                  </div>

                  {/* Surface Finish (Visual Simulation) */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[#2A231F]">
                        Surface Finish
                      </span>
                      <span className="text-[10px] font-medium text-[#5C524B]">
                        Visual Simulation
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {SURFACE_FINISH_OPTIONS.map((item) => {
                        const isSelected = surfaceFinish === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            disabled={layers.artworkLocked}
                            onClick={() => onSurfaceFinishChange(item.id)}
                            title={item.description}
                            className={cn(
                              "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-left text-[11px] font-medium whitespace-nowrap transition-colors disabled:opacity-45",
                              isSelected
                                ? "border-[#9B1C1C] bg-[#FFFDF9] font-semibold text-[#1A1A1A] ring-1 ring-[#9B1C1C]"
                                : "border-[#DFD0C0] bg-[#FFFDF9] text-[#2A231F] hover:border-[#9B1C1C]"
                            )}
                          >
                            <span
                              aria-hidden="true"
                              style={item.swatchStyle}
                              className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                            />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-1.5 text-[10.5px] leading-snug text-[#5C524B]">
                      Digital finish simulation for preview only — request physical printed substrate samples during consultation.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Group 3: Advanced Options (Collapsible) */}
            <div className="rounded-xl border border-[#E5D9CA] bg-[#FAF6F0] p-3.5">
              <button
                type="button"
                onClick={() => setAdvancedGroupOpen((v) => !v)}
                aria-expanded={advancedGroupOpen}
                className="flex w-full cursor-pointer items-center justify-between text-left"
              >
                <span className="flex items-center gap-2 font-sans text-sm font-semibold text-[#1A1A1A]">
                  <Settings2 className="h-4 w-4 text-[#9B1C1C]" />
                  <span>Advanced Options</span>
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-[#5C524B] transition-transform duration-200",
                    advancedGroupOpen && "rotate-180"
                  )}
                />
              </button>

              {advancedGroupOpen && (
                <div className="mt-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={layers.artworkLocked}
                      onClick={onToggleFlipHorizontal}
                      className={cn(
                        "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-45",
                        flipHorizontal
                          ? "border-[#9B1C1C] bg-[#9B1C1C] text-[#FFFDF9]"
                          : "border-[#DFD0C0] bg-[#FFFDF9] text-[#2A231F] hover:border-[#9B1C1C]"
                      )}
                    >
                      <FlipHorizontal className="h-3.5 w-3.5" />
                      <span>Mirror Art</span>
                    </button>

                    <button
                      type="button"
                      disabled={layers.artworkLocked}
                      onClick={onRotateQuarterTurn}
                      className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] px-3 py-2 text-xs font-medium text-[#2A231F] transition-colors hover:border-[#9B1C1C] disabled:opacity-45"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Rotate 90°</span>
                    </button>

                    <button
                      type="button"
                      onClick={onToggleBlendMultiply}
                      className={cn(
                        "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                        blendMultiply
                          ? "border-[#9B1C1C] bg-[#9B1C1C]/10 text-[#9B1C1C]"
                          : "border-[#DFD0C0] bg-[#FFFDF9] text-[#2A231F] hover:border-[#9B1C1C]"
                      )}
                    >
                      <span>{blendMultiply ? "Multiply Blend" : "Normal Blend"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onApplicationModeChange(
                          applicationMode === "mural" ? "pattern" : "mural"
                        )
                      }
                      className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] px-3 py-2 text-xs font-medium text-[#2A231F] transition-colors hover:border-[#9B1C1C]"
                    >
                      <span>
                        {applicationMode === "mural"
                          ? "Switch to Pattern"
                          : "Switch to Mural"}
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      disabled={!canUndo}
                      onClick={onUndo}
                      className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] px-3 py-2 text-xs font-medium text-[#2A231F] transition-colors hover:border-[#9B1C1C] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                      <span>Undo</span>
                    </button>
                    <button
                      type="button"
                      disabled={!canRedo}
                      onClick={onRedo}
                      className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] px-3 py-2 text-xs font-medium text-[#2A231F] transition-colors hover:border-[#9B1C1C] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Redo2 className="h-3.5 w-3.5" />
                      <span>Redo</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E5D9CA] pt-2.5">
                    <button
                      type="button"
                      onClick={onResetAdjustments}
                      className="cursor-pointer text-xs font-medium text-[#9B1C1C] hover:underline"
                    >
                      Reset Adjustments
                    </button>
                    <button
                      type="button"
                      onClick={onResetCorners}
                      className="cursor-pointer text-xs font-medium text-[#5C524B] hover:text-[#1A1A1A] hover:underline"
                    >
                      Reset Wall Corners
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 2: ARTWORK INFO (Section 20) */}
        {activeTab === "info" && (
          <div className="space-y-3.5 rounded-xl border border-[#E5D9CA] bg-[#FAF6F0] p-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <div className="aspect-square overflow-hidden rounded-xl border border-[#DFD0C0] bg-[#EAE0D3]">
                  <ArtworkSwatchThumbnail
                    src={printableInfo.printableImageUrl}
                    alt={`${selectedDesign.title} printable artwork region`}
                  />
                </div>
                <p className="mt-1 text-center text-[10.5px] font-medium text-[#5C524B]">
                  Printable Artwork Source
                </p>
              </div>
              <div>
                <div className="aspect-square overflow-hidden rounded-xl border border-[#DFD0C0] bg-[#EAE0D3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={printableInfo.showcaseImageUrl}
                    alt={selectedDesign.coverImage.altText || selectedDesign.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-1 text-center text-[10.5px] font-medium text-[#5C524B]">
                  Installed Showcase View
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-xl font-normal text-[#1A1A1A]">
                {selectedDesign.title}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-[#9B1C1C]">
                {selectedDesign.categoryLabel} Collection •{" "}
                {applicationMode === "pattern"
                  ? "Repeating Pattern"
                  : "Full-Wall Mural"}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#2A231F]">
                {selectedDesign.description || selectedDesign.summary}
              </p>
            </div>

            <div className="space-y-2 border-t border-[#E5D9CA] pt-3 text-xs">
              <div>
                <span className="font-semibold text-[#1A1A1A]">
                  Verified Printable Surfaces
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {selectedDesign.compatibleSurfaces.map((surface) => (
                    <button
                      key={surface}
                      type="button"
                      onClick={() => onSelectEnquirySurface(surface)}
                      className={cn(
                        "cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                        selectedEnquirySurface === surface
                          ? "border-[#9B1C1C] bg-[#9B1C1C] text-[#FFFDF9]"
                          : "border-[#DFD0C0] bg-[#FFFDF9] text-[#2A231F] hover:border-[#9B1C1C]"
                      )}
                    >
                      {surface}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-[#5C524B]">Preview Source Resolution</span>
                <span className="font-semibold tabular-nums text-[#1A1A1A]">
                  {selectedDesign.visualizerConfig.width} ×{" "}
                  {selectedDesign.visualizerConfig.height} px
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#5C524B]">Sizing & Layout</span>
                <span className="text-right font-medium text-[#1A1A1A]">
                  Custom-proportioned
                </span>
              </div>

              {!printableInfo.isPatternSuitable && (
                <div className="mt-2 flex items-start gap-2 rounded-lg border border-[#DFD0C0] bg-[#FFFDF9] p-2.5 text-[11px] text-[#5C524B]">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9B1C1C]" />
                  <span>
                    Designed primarily as a panoramic Full-Wall Mural; repeating pattern tiles the isolated motif as an exploratory preview.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: EXPORT & ENQUIRE (Sections 26 & 27) */}
        {activeTab === "export" && (
          <div className="space-y-3.5 rounded-xl border border-[#E5D9CA] bg-[#FAF6F0] p-3.5">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#1A1A1A]">
                High-Resolution Snapshot Export
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#5C524B]">
                Exports your room and perspective-mapped artwork at native resolution ({exportResolutionLabel}) without pins, dashed lines, or studio controls.
              </p>
            </div>

            <div>
              <span className="text-xs font-medium text-[#2A231F]">
                Snapshot Format
              </span>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onExportFormatChange("png")}
                  className={cn(
                    "cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                    exportFormat === "png"
                      ? "border-[#9B1C1C] bg-[#9B1C1C] text-[#FFFDF9]"
                      : "border-[#DFD0C0] bg-[#FFFDF9] text-[#2A231F] hover:border-[#9B1C1C]"
                  )}
                >
                  PNG (Lossless)
                </button>
                <button
                  type="button"
                  onClick={() => onExportFormatChange("jpeg")}
                  className={cn(
                    "cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                    exportFormat === "jpeg"
                      ? "border-[#9B1C1C] bg-[#9B1C1C] text-[#FFFDF9]"
                      : "border-[#DFD0C0] bg-[#FFFDF9] text-[#2A231F] hover:border-[#9B1C1C]"
                  )}
                >
                  JPEG (Compact)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onSaveProject}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] px-3 py-2.5 text-xs font-semibold text-[#1A1A1A] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
              >
                <Bookmark className="h-3.5 w-3.5 text-[#9B1C1C]" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={onCopyShareLink}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] px-3 py-2.5 text-xs font-semibold text-[#1A1A1A] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
              >
                {copiedShareLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#9B1C1C]" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#9B1C1C]" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            <div className="border-t border-[#E5D9CA] pt-3">
              <span className="text-xs font-semibold text-[#1A1A1A]">
                Consultation Handoff Details
              </span>
              <p className="mt-1 text-xs text-[#5C524B]">
                Target Substrate for Enquiry:
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {selectedDesign.compatibleSurfaces.map((surface) => (
                  <button
                    key={surface}
                    type="button"
                    onClick={() => onSelectEnquirySurface(surface)}
                    className={cn(
                      "cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                      selectedEnquirySurface === surface
                        ? "border-[#9B1C1C] bg-[#9B1C1C] text-[#FFFDF9]"
                        : "border-[#DFD0C0] bg-[#FFFDF9] text-[#2A231F] hover:border-[#9B1C1C]"
                    )}
                  >
                    {surface}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-[#5C524B]">
                {calibratedSummary.summaryText}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Primary Export & Enquiry CTAs (Bottom of Right Inspector) */}
      <div className="mt-3.5 space-y-2.5 border-t border-[#E5D9CA] pt-3.5">
        <button
          type="button"
          onClick={onExportSnapshot}
          disabled={!printableInfo.hasValidPrintableSource}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#9B1C1C] px-4 py-3 text-sm font-semibold text-[#FFFDF9] shadow-[0_8px_20px_rgba(155,28,28,0.22)] transition-colors hover:bg-[#7F1616] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Download className="h-4 w-4" />
          <span>Export Wall Preview Snapshot</span>
        </button>

        <Link
          href={enquiryHref}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#DFD0C0] bg-[#FAF6F0] px-4 py-2.5 text-sm font-semibold text-[#1A1A1A] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
        >
          <span>Enquire with This Design</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}

interface StudioSavedPreviewsModalProps {
  isOpen: boolean;
  projects: ReadonlyArray<StudioSavedProject>;
  onLoadProject: (project: StudioSavedProject) => void;
  onDeleteProject: (projectId: string) => void;
  onClose: () => void;
}

export function StudioSavedPreviewsModal({
  isOpen,
  projects,
  onLoadProject,
  onDeleteProject,
  onClose,
}: StudioSavedPreviewsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="My Saved Wall Previews"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#1A1412]/60 p-3 backdrop-blur-xs sm:p-6"
    >
      <div className="flex max-h-[86dvh] w-full max-w-[820px] flex-col overflow-hidden rounded-2xl border border-[#DFD0C0] bg-[#FAF6F0] text-[#1A1A1A] shadow-[0_24px_60px_rgba(24,18,14,0.28)]">
        <div className="flex items-center justify-between gap-3 border-b border-[#E5D9CA] bg-[#FFFDF9] px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-serif text-2xl font-normal text-[#1A1A1A]">
              My Saved Previews ({projects.length})
            </h2>
            <p className="mt-0.5 text-xs text-[#5C524B]">
              Stored privately as browser studio drafts on this device. Export snapshots for permanent image files.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close saved previews"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#DFD0C0] bg-[#FAF6F0] px-3.5 py-1.5 text-xs font-semibold text-[#1A1A1A] hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-[#E5D9CA] bg-[#FFFDF9] px-6 py-12 text-center">
              <Bookmark className="mx-auto h-7 w-7 text-[#9B1C1C]" />
              <h3 className="mt-3 font-serif text-xl text-[#1A1A1A]">
                No saved wall previews yet
              </h3>
              <p className="mx-auto mt-1.5 max-w-[46ch] text-xs leading-relaxed text-[#5C524B]">
                Map an ATELIER mural onto a sample room or your uploaded room photograph, then click Save Project in the top studio bar to compare options side by side.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {projects.map((proj) => {
                const formattedDate = new Date(proj.savedAt).toLocaleString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );
                return (
                  <div
                    key={proj.id}
                    className="flex flex-col overflow-hidden rounded-xl border border-[#E5D9CA] bg-[#FFFDF9]"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EAE0D3]">
                      {proj.previewThumbnailDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={proj.previewThumbnailDataUrl}
                          alt={`${proj.designTitle} in ${proj.roomLabel}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-[#5C524B]">
                          Studio Draft Preview
                        </div>
                      )}
                      <span className="absolute top-2.5 left-2.5 rounded-full bg-[#351C1C]/90 px-2.5 py-0.5 text-[10px] font-medium text-[#FFFDF9]">
                        {proj.roomLabel}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-3.5">
                      <div>
                        <p className="text-[11px] font-medium text-[#9B1C1C]">
                          {proj.categoryLabel} •{" "}
                          {proj.applicationMode === "pattern"
                            ? "Repeating Pattern"
                            : "Full-Wall Mural"}
                        </p>
                        <h3 className="mt-0.5 font-serif text-lg font-normal text-[#1A1A1A]">
                          {proj.designTitle}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-[#5C524B]">
                          Saved {formattedDate} • Finish: {proj.surfaceFinish}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onLoadProject(proj);
                            onClose();
                          }}
                          className="flex-1 cursor-pointer rounded-xl bg-[#9B1C1C] px-3 py-2 text-xs font-semibold text-[#FFFDF9] hover:bg-[#7F1616]"
                        >
                          Load in Studio
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteProject(proj.id)}
                          aria-label={`Delete saved preview ${proj.designTitle}`}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-[#DFD0C0] bg-[#FAF6F0] text-[#5C524B] hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StudioNewSessionDialogProps {
  isOpen: boolean;
  onConfirmReset: () => void;
  onSaveAndReset: () => void;
  onCancel: () => void;
}

export function StudioNewSessionDialog({
  isOpen,
  onConfirmReset,
  onSaveAndReset,
  onCancel,
}: StudioNewSessionDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Start New Visualizer Session"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      className="fixed inset-0 z-[115] flex items-center justify-center bg-[#1A1412]/60 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-[440px] rounded-2xl border border-[#DFD0C0] bg-[#FFFDF9] p-6 text-[#1A1A1A] shadow-[0_24px_56px_rgba(24,18,14,0.28)]">
        <h2 className="font-serif text-2xl font-normal text-[#1A1A1A]">
          Start a New Studio Session?
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-[#5C524B]">
          Your current wall corner mapping, lighting, and alignment adjustments have unsaved changes. Save this draft before resetting, or start fresh immediately.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-xl border border-[#DFD0C0] bg-[#FAF6F0] px-3.5 py-2 text-xs font-semibold text-[#2A231F] hover:border-[#9B1C1C]"
          >
            Keep Editing
          </button>
          <button
            type="button"
            onClick={onSaveAndReset}
            className="cursor-pointer rounded-xl border border-[#9B1C1C] bg-[#FFFDF9] px-3.5 py-2 text-xs font-semibold text-[#9B1C1C] hover:bg-[#9B1C1C]/5"
          >
            Save & Start New
          </button>
          <button
            type="button"
            onClick={onConfirmReset}
            className="cursor-pointer rounded-xl bg-[#9B1C1C] px-4 py-2 text-xs font-semibold text-[#FFFDF9] hover:bg-[#7F1616]"
          >
            Reset Session
          </button>
        </div>
      </div>
    </div>
  );
}

export function StudioKeyboardShortcutsPopover({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: "⌘ / Ctrl + Z", desc: "Undo adjustment or corner move" },
    { keys: "⇧ + ⌘ / Ctrl + Z", desc: "Redo adjustment" },
    { keys: "Arrow Keys", desc: "Nudge selected corner handle (fine)" },
    { keys: "Shift + Arrows", desc: "Nudge selected corner handle (larger)" },
    { keys: "Delete", desc: "Remove optional foreground mask" },
    { keys: "Escape", desc: "Exit fullscreen or close open dialog" },
  ];

  return (
    <div
      role="dialog"
      aria-label="Studio keyboard shortcuts"
      className="absolute top-12 right-3 z-40 w-72 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] p-3.5 text-xs text-[#1A1A1A] shadow-[0_14px_34px_rgba(28,20,16,0.14)]"
    >
      <div className="flex items-center justify-between border-b border-[#E5D9CA] pb-2">
        <span className="flex items-center gap-1.5 font-semibold text-[#1A1A1A]">
          <Keyboard className="h-3.5 w-3.5 text-[#9B1C1C]" />
          <span>Keyboard Shortcuts</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close keyboard shortcuts"
          className="cursor-pointer text-[#5C524B] hover:text-[#1A1A1A]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <ul className="mt-2.5 space-y-2">
        {shortcuts.map((s) => (
          <li key={s.keys} className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-[#5C524B]">{s.desc}</span>
            <kbd className="shrink-0 rounded-md border border-[#DFD0C0] bg-[#FAF6F0] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#1A1A1A]">
              {s.keys}
            </kbd>
          </li>
        ))}
      </ul>
    </div>
  );
}
