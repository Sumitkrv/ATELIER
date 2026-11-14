# ATELIER — WALL STORY · Website-Wide Image Audit & Overhaul

## 1. Executive Summary (Before vs. After)

Verified via [`scripts/audit-image-uniqueness.mjs`](../scripts/audit-image-uniqueness.mjs) (static MD5 + 64-bit `dHash` via macOS `sips` + runtime Playwright crawl across all public routes):

| Metric | Before Overhaul | After Overhaul |
| --- | ---: | ---: |
| Public routes crawled | 19 | **20** (9 pages + 6 `/projects/[slug]` + 5 `/blogs/[slug]`) |
| Total rendered image references | 240 | **209** |
| Unique rendered image sources (default load) | 53 | **109** (+30+ additional tab/modal/visualizer states) |
| Asset files on disk (`public/images` + `public/samples`) | 97 | **185** (no legacy files deleted) |
| Newly generated & WebP-optimized assets | 0 | **88** (`8.13 MB` total, ~`94.6 KB` avg, ~`87.5%` byte reduction) |
| Exact duplicate file groups (MD5) | 1 | **0** |
| Accidental visual near-duplicates rendered (`dHash ≤ 6`) | 3 | **0** (`6` documented pixel-locked Before/After pairs) |
| Unresolved cross-section image reuse | 20 | **0** |
| Missing or broken assets (`404` / `naturalWidth === 0`) | 0 | **0** |

## 2. Re-Running the Audit

With the Next.js server running (`npm run dev`):

```bash
node scripts/audit-image-uniqueness.mjs
```

Exit code `0` confirms zero unresolved cross-section reuse, zero broken assets, and zero accidental exact/near duplicates.

## 3. Documented Intentional Relationships

Configured in [`scripts/image-intentional-relationships.json`](../scripts/image-intentional-relationships.json):

1. **Catalogue Category & Visualizer Handoff (`design-catalogue-and-visualizer-handoff`)** — The 13 category covers in `DESIGN_CATEGORIES` represent the same curated collection in the Home `"Atelier 3D Wall Art Collection"` deck (`/`) and on `/explore-designs`, and selecting any design passes its exact `textureUrl` into `/visualizer`.
2. **Portfolio Study Identity (`portfolio-project-entity-identity`)** — Each of the 6 Studio Surface Studies (`walls`, `tiles`, `plywood`, `office-blinds`, `metals`, `glass`) uses its own canonical `-cover.webp` and `-detail.webp` across `/projects` and `/projects/[slug]` (including sibling related-study cards).
3. **Journal Essay Identity (`journal-article-entity-identity`)** — Each of the 5 Journal essays uses its own canonical cover across `/blogs` and `/blogs/[slug]` (including sibling related-essay cards).
4. **Pixel-Locked Before/After Room Pairs (`beforeAfterPairs`)** — 10 matched room pairs across `/about` (`Spatial Harmony`), `/explore-designs` & `/services` (`See It Before We Print It` bedroom quartet), and the 6 `/projects/[slug]` `Substrate Transformation Preview` sliders share identical room architecture and lighting while adding/removing the printed mural.

## 4. Newly Generated WebP Inventory (`88` Assets · `8.13 MB` Total)

All newly generated assets are stored under `public/images/atelier/{home,explore-designs,projects,services,process,journal,visualizer}/` and registered in [`src/lib/asset-registry.ts`](../src/lib/asset-registry.ts) (`ATELIER_ASSET_REGISTRY` and `atelierImages`):

- **`home/` (23 WebPs)**: `home-studio-philosophy.webp` (people-free architectural worktable), 6 `home-philosophy-*.webp` surface previews, 6 `home-scroll-*.webp` 3D scroll showcase slides, 6 `home-substrate-*.webp` substrate cards, `home-printing-technology-closeup.webp`, `home-executed-residential-mural.webp`, `home-executed-glass-partition.webp`, `home-why-atelier-completed-wall.webp`.
- **`explore-designs/` (24 WebPs)**: `explore-hero-curated-gallery.webp`, pixel-locked bedroom quartet (`explore-see-it-before.webp` + `explore-see-it-after-{lotus,botanical,terracotta}.webp`), and 19 bespoke design artworks giving all **39** designs across **13** categories 39 distinct covers and matching `textureUrl`s.
- **`projects/` (19 WebPs)**: `hero-mediterranean-tile-hospitality.webp` + 6 complete Studio Surface Study trios (`*-cover.webp`, `*-detail.webp`, and pixel-matched `*-before.webp`).
- **`services/` (9 WebPs)**: 4 macro material closeups (`services-material-{tiles,blinds,metals,glass}-closeup.webp`) + 5 real-space installations (`services-real-{lotus-residence,creative-office,cafe-terra,terracotta-boutique,executive-boardroom}.webp`).
- **`process/` (3 WebPs)**: `process-stage-02-design-exploration.webp`, `process-stage-03-customization.webp`, `process-brief-checklist.webp`.
- **`journal/` (7 WebPs)**: 5 unique article covers + 2 unique inline editorial figures (`journal-seamless-wall-detail.webp`, `journal-surface-continuity.webp`).
- **`visualizer/` (3 WebPs)**: 3 clean empty-wall architectural sample rooms (`visualizer-room-{neutral-living,angled-gallery,cream-bedroom}.webp`).

