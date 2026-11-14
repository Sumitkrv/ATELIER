"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicShell } from "@/components/layout/PublicShell";
import {
  InteractiveWallVisualizerModal,
  SAMPLE_ROOM_ELEVATIONS,
  SampleRoomElevation,
} from "@/components/visualizer/InteractiveWallVisualizerModal";
import { HeroPreviewMode } from "@/components/visualizer/LaptopWallPreview";
import {
  HorizontalSelectedArtworkBar,
  SelectedArtworkSelectorModal,
} from "@/components/visualizer/SelectedArtworkSelector";
import { VisualizerHero } from "@/components/visualizer/VisualizerHero";
import { VisualizerHowItWorks } from "@/components/visualizer/VisualizerHowItWorks";
import {
  CatalogueCategoryRecord,
  CatalogueDesignItem,
  findDesignBySlugOrId,
} from "@/lib/designs-catalogue";
import {
  readStagedDesignFromSession,
  stageDesignForWallVisualizer,
  WallVisionAssetPayload,
} from "@/lib/visualizer-bridge";
import { PageContentDocument } from "@/types/models";

function formatVisualizerDisplayTitle(design: CatalogueDesignItem): string {
  if (
    design.id === "design-slot-1" &&
    design.title.toLowerCase() === "botanical canopy"
  ) {
    return "Botanical Canopy Wall Mural";
  }
  return design.title;
}

function formatCollectionSlotLabel(slotNumber: number): string {
  const padded = String(slotNumber).padStart(2, "0");
  return `Category ${padded}`;
}

function VisualizerExperienceWorkspace() {
  // Synchronize published designs, 13 categories & optional CMS hero/process copy
  const [catalogueCategories, setCatalogueCategories] = useState<
    ReadonlyArray<CatalogueCategoryRecord>
  >([]);
  const [catalogueDesigns, setCatalogueDesigns] = useState<
    ReadonlyArray<CatalogueDesignItem>
  >([]);
  const [visualizerPageContent, setVisualizerPageContent] =
    useState<PageContentDocument | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/designs", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data?.categories)) {
          setCatalogueCategories(data.categories);
        }
        const combinedDesigns: CatalogueDesignItem[] = [
          ...(Array.isArray(data?.approvedClientDesigns)
            ? data.approvedClientDesigns
            : []),
          ...(Array.isArray(data?.developmentFixtures)
            ? data.developmentFixtures
            : []),
        ];
        if (Array.isArray(data?.approvedClientDesigns)) {
          setCatalogueDesigns(combinedDesigns);
        }
        if (data?.visualizerPageContent) {
          setVisualizerPageContent(data.visualizerPageContent);
        }
      } catch {
        // Retain verified canonical catalogue when offline
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!catalogueDesigns.length) return <div className="mx-auto max-w-2xl px-5 py-24 text-center"><h1 className="font-serif text-3xl">Choose your wall art</h1><p className="mt-4">The artwork catalogue is loading or has no published designs yet.</p><Link className="mt-5 inline-block underline" href="/explore-designs">Explore designs</Link></div>;
  return <VisualizerWithCatalogue catalogueCategories={catalogueCategories} catalogueDesigns={catalogueDesigns} visualizerPageContent={visualizerPageContent} />;
}
function VisualizerWithCatalogue({ catalogueCategories, catalogueDesigns, visualizerPageContent }: { catalogueCategories: ReadonlyArray<CatalogueCategoryRecord>; catalogueDesigns: ReadonlyArray<CatalogueDesignItem>; visualizerPageContent: PageContentDocument | null }) {
  const searchParams = useSearchParams();

  const rawDesignParam =
    searchParams.get("design") || searchParams.get("id") || "";
  const rawTitleParam = searchParams.get("title") || "";
  const rawSlotParam = searchParams.get("slot") || "";
  const rawCategoryParam = searchParams.get("category") || "";
  const rawModeParam = searchParams.get("mode");
  const rawStudioParam = searchParams.get("studio");
  const rawRoomParam = searchParams.get("room") || "";

  const externalVisualizerBase =
    process.env.NEXT_PUBLIC_WALL_VISUALIZER_URL ||
    "http://localhost:3001/visualizer";

  // Resolve initial design from URL params -> sessionStorage -> default Botanical Canopy Wall Mural
  const resolution = useMemo<{
    design: CatalogueDesignItem;
    wasInvalidQuery: boolean;
    customTitleOverride: string | null;
  }>(() => {
    if (rawDesignParam.trim().length > 0) {
      const matched = findDesignBySlugOrId(rawDesignParam, catalogueDesigns);
      if (matched) {
        return {
          design: matched,
          wasInvalidQuery: false,
          customTitleOverride: rawTitleParam.trim() || null,
        };
      }

      const sessionAsset = readStagedDesignFromSession();
      if (sessionAsset && sessionAsset.id === rawDesignParam) {
        const fromSessionCatalogue = findDesignBySlugOrId(
          sessionAsset.id,
          catalogueDesigns
        );
        if (fromSessionCatalogue) {
          return {
            design: fromSessionCatalogue,
            wasInvalidQuery: false,
            customTitleOverride: sessionAsset.name,
          };
        }
      }

      if (!rawTitleParam.trim()) {
        return {
          design: catalogueDesigns[0],
          wasInvalidQuery: true,
          customTitleOverride: null,
        };
      }
    }

    const sessionStaged = readStagedDesignFromSession();
    if (sessionStaged) {
      const matchedFromSession =
        findDesignBySlugOrId(sessionStaged.id, catalogueDesigns) ||
        findDesignBySlugOrId(sessionStaged.name, catalogueDesigns);
      if (matchedFromSession) {
        return {
          design: matchedFromSession,
          wasInvalidQuery: false,
          customTitleOverride: null,
        };
      }
    }

    return {
      design: catalogueDesigns[0],
      wasInvalidQuery: false,
      customTitleOverride: rawTitleParam.trim() || null,
    };
  }, [catalogueDesigns, rawDesignParam, rawTitleParam]);

  const [selectedDesign, setSelectedDesign] = useState<CatalogueDesignItem>(
    resolution.design
  );
  const [prevRawDesignParam, setPrevRawDesignParam] =
    useState<string>(rawDesignParam);
  if (rawDesignParam !== prevRawDesignParam) {
    setPrevRawDesignParam(rawDesignParam);
    setSelectedDesign(resolution.design);
  }

  const [dismissedInvalidNotice, setDismissedInvalidNotice] =
    useState<boolean>(false);

  // Hero mode & sample room state
  const urlMode: HeroPreviewMode =
    rawModeParam === "photo"
      ? "photo"
      : rawModeParam === "room"
        ? "room"
        : "camera";
  const [heroMode, setHeroMode] = useState<HeroPreviewMode>(urlMode);
  const [prevUrlMode, setPrevUrlMode] = useState<HeroPreviewMode>(urlMode);
  if (urlMode !== prevUrlMode) {
    setPrevUrlMode(urlMode);
    setHeroMode(urlMode);
  }

  const [activeSampleRoom, setActiveSampleRoom] = useState<SampleRoomElevation>(
    SAMPLE_ROOM_ELEVATIONS[0]
  );
  const [comparisonMode, setComparisonMode] = useState<"before" | "after">(
    "after"
  );
  const [roomPickerOpen, setRoomPickerOpen] = useState<boolean>(false);
  const [artworkSelectorOpen, setArtworkSelectorOpen] =
    useState<boolean>(false);

  // Interactive 4-Corner Wall Visualizer Studio Workstation state
  const [studioModalOpen, setStudioModalOpen] = useState<boolean>(
    rawStudioParam === "1" || rawStudioParam === "true"
  );
  const [userChoseHeroRoom, setUserChoseHeroRoom] = useState<boolean>(false);
  const [studioLaunchMode, setStudioLaunchMode] = useState<"camera" | "photo">(
    rawModeParam === "camera" ? "camera" : rawStudioParam ? "photo" : "camera"
  );
  const [studioSampleRoomId, setStudioSampleRoomId] = useState<string>(
    rawRoomParam || "room-living-sunlit"
  );

  const displayTitle = useMemo(() => {
    if (
      resolution.customTitleOverride &&
      selectedDesign.id === resolution.design.id
    ) {
      return resolution.customTitleOverride;
    }
    return formatVisualizerDisplayTitle(selectedDesign);
  }, [
    resolution.customTitleOverride,
    resolution.design.id,
    selectedDesign,
  ]);

  const collectionDisplay = useMemo(() => {
    if (rawCategoryParam.trim()) {
      const matchingCat = catalogueCategories.find(
        (c) =>
          c.slug.toLowerCase() === rawCategoryParam.trim().toLowerCase() ||
          c.name.toLowerCase() === rawCategoryParam.trim().toLowerCase()
      );
      if (matchingCat) {
        return formatCollectionSlotLabel(matchingCat.slotNumber);
      }
    }
    if (rawSlotParam.trim() && Number.isInteger(Number(rawSlotParam))) {
      return formatCollectionSlotLabel(Number(rawSlotParam));
    }
    return formatCollectionSlotLabel(selectedDesign.categorySlotNumber);
  }, [
    catalogueCategories,
    rawCategoryParam,
    rawSlotParam,
    selectedDesign.categorySlotNumber,
  ]);

  // Persist active artwork into sessionStorage & IndexedDB bridge
  const stagedPayload = useMemo<WallVisionAssetPayload>(
    () => ({
      id: selectedDesign.slug,
      name: displayTitle,
      category: collectionDisplay,
      dataUrl:
        selectedDesign.visualizerConfig.textureUrl ||
        selectedDesign.coverImage.secureUrl,
      width: selectedDesign.visualizerConfig.width || 1600,
      height: selectedDesign.visualizerConfig.height || 1000,
      mimeType: selectedDesign.visualizerConfig.mimeType || "image/jpeg",
      defaultMode: selectedDesign.visualizerConfig.defaultMode,
      description: selectedDesign.summary,
    }),
    [selectedDesign, displayTitle, collectionDisplay]
  );

  useEffect(() => {
    stageDesignForWallVisualizer(stagedPayload).catch(() => {});
  }, [stagedPayload]);

  const syncStudioUrlFlag = useCallback((open: boolean) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (open) {
      params.set("studio", "1");
    } else {
      params.delete("studio");
    }
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      qs ? `/visualizer?${qs}` : "/visualizer"
    );
    if (open) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const handleLaunchLiveCamera = useCallback(() => {
    setHeroMode("camera");
    setRoomPickerOpen(false);
    setStudioLaunchMode("camera");
    stageDesignForWallVisualizer(stagedPayload).catch(() => {});
    setStudioModalOpen(true);
    syncStudioUrlFlag(true);
  }, [stagedPayload, syncStudioUrlFlag]);

  const handleLaunchUploadPhoto = useCallback(() => {
    setHeroMode("photo");
    setRoomPickerOpen(false);
    setStudioLaunchMode("photo");
    setStudioSampleRoomId(
      userChoseHeroRoom ? activeSampleRoom.id : "room-living-sunlit"
    );
    stageDesignForWallVisualizer(stagedPayload).catch(() => {});
    setStudioModalOpen(true);
    syncStudioUrlFlag(true);
  }, [activeSampleRoom.id, stagedPayload, syncStudioUrlFlag, userChoseHeroRoom]);

  const handleToggleRoomPicker = useCallback(() => {
    setHeroMode("room");
    setRoomPickerOpen((prev) => !prev);
  }, []);

  const handleChooseSampleRoom = useCallback((room: SampleRoomElevation) => {
    setActiveSampleRoom(room);
    setUserChoseHeroRoom(true);
    setStudioSampleRoomId(room.id);
    setComparisonMode("after");
    setHeroMode("room");
  }, []);

  const handleOpenRoomInStudio = useCallback(
    (roomId: string) => {
      setRoomPickerOpen(false);
      setStudioLaunchMode("photo");
      setStudioSampleRoomId(roomId);
      stageDesignForWallVisualizer(stagedPayload).catch(() => {});
      setStudioModalOpen(true);
      syncStudioUrlFlag(true);
    },
    [stagedPayload, syncStudioUrlFlag]
  );

  const handleCloseStudio = useCallback(() => {
    setStudioModalOpen(false);
    syncStudioUrlFlag(false);
  }, [syncStudioUrlFlag]);

  const handleSelectDesign = useCallback(
    (design: CatalogueDesignItem) => {
      setSelectedDesign(design);
      setComparisonMode("after");
      setDismissedInvalidNotice(true);
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        params.set("design", design.slug);
        params.set("title", formatVisualizerDisplayTitle(design));
        params.set("slot", String(design.categorySlotNumber));
        params.set("category", design.categoryLabel);
        window.history.replaceState(
          null,
          "",
          `/visualizer?${params.toString()}`
        );
      }
    },
    []
  );

  const showInvalidQueryBanner =
    resolution.wasInvalidQuery && !dismissedInvalidNotice;

  return (
    <>
      {studioModalOpen ? (
        <InteractiveWallVisualizerModal
          isOpen={studioModalOpen}
          presentation="workstation"
          initialMode={studioLaunchMode}
          initialSampleRoomId={studioSampleRoomId}
          selectedDesign={selectedDesign}
          externalVisualizerUrl={externalVisualizerBase}
          catalogueDesigns={catalogueDesigns}
          catalogueCategories={catalogueCategories}
          onSelectDesign={handleSelectDesign}
          onClose={handleCloseStudio}
        />
      ) : (
        <>
          <VisualizerHero
            selectedDesign={selectedDesign}
            displayTitle={displayTitle}
            heroContent={visualizerPageContent?.hero}
            activeMode={heroMode}
            activeRoom={activeSampleRoom}
            comparisonMode={comparisonMode}
            roomPickerOpen={roomPickerOpen}
            showInvalidQueryBanner={showInvalidQueryBanner}
            onDismissInvalidNotice={() => setDismissedInvalidNotice(true)}
            onComparisonChange={setComparisonMode}
            onLaunchLiveCamera={handleLaunchLiveCamera}
            onLaunchUploadPhoto={handleLaunchUploadPhoto}
            onToggleRoomPicker={handleToggleRoomPicker}
            onChooseSampleRoom={handleChooseSampleRoom}
            onOpenRoomInStudio={handleOpenRoomInStudio}
            onOpenArtworkSelector={() => setArtworkSelectorOpen(true)}
          />

          <VisualizerHowItWorks
            cmsStages={visualizerPageContent?.processStages}
          />

          <HorizontalSelectedArtworkBar
            selectedDesign={selectedDesign}
            designs={catalogueDesigns}
            onSelectDesign={handleSelectDesign}
          />
        </>
      )}

      <SelectedArtworkSelectorModal
        isOpen={artworkSelectorOpen}
        selectedDesign={selectedDesign}
        categories={catalogueCategories}
        designs={catalogueDesigns}
        onSelectDesign={handleSelectDesign}
        onClose={() => setArtworkSelectorOpen(false)}
      />
    </>
  );
}

export default function VisualizerBridgePage() {
  return (
    <PublicShell>
      <Suspense
        fallback={
          <div className="bg-[#FAF6F0] py-32 text-center font-serif text-2xl text-[#1A1A1A]">
            Preparing ATELIER — WALL STORY Wall Preview…
          </div>
        }
      >
        <VisualizerExperienceWorkspace />
      </Suspense>
    </PublicShell>
  );
}
