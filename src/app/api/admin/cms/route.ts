import { NextResponse } from "next/server";
import {
  readAdminSessionFromRequest,
  requireAdminRequest,
} from "@/lib/admin-auth";
import {
  deleteStoredBlog,
  deleteStoredDesign,
  deleteStoredProject,
  getStoredSiteSettings,
  listStoredBlogs,
  listStoredCategories,
  listStoredDesigns,
  listStoredPageContents,
  listStoredProjects,
  saveStoredSiteSettings,
  upsertStoredBlog,
  upsertStoredCategory,
  upsertStoredDesign,
  upsertStoredPageContent,
  upsertStoredProject,
} from "@/lib/cms-store";
import { listStoredEnquiries } from "@/lib/enquiries-store";
import { computeReadingTimeMinutes } from "@/lib/blogs-catalogue";
import { CatalogueDesignItem } from "@/lib/designs-catalogue";
import { PortfolioProjectRecord, ProjectSpaceCategory } from "@/lib/projects-catalogue";
import { getEnvironmentReadiness } from "@/lib/env";

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: Request) {
  const session = readAdminSessionFromRequest(request);
  const readiness = getEnvironmentReadiness();
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection") || "overview";

  if (collection === "overview") {
    const [categories, designs, projects, blogs, enquiries, settings] =
      await Promise.all([
        listStoredCategories(),
        listStoredDesigns(),
        listStoredProjects(),
        listStoredBlogs(),
        listStoredEnquiries(),
        getStoredSiteSettings(),
      ]);

    return NextResponse.json({
      ok: true,
      authenticated: Boolean(session),
      session,
      readiness,
      counts: {
        designsTotal: designs.length,
        designsPublished: designs.filter((d) => d.published).length,
        categoriesTotal: categories.length,
        categoriesActive: categories.filter((c) => c.isActive).length,
        projectsTotal: projects.length,
        projectsPublished: projects.filter((p) => p.published).length,
        blogsTotal: blogs.length,
        blogsPublished: blogs.filter((b) => b.published).length,
        enquiriesTotal: enquiries.length,
        enquiriesOpen: enquiries.filter((e) => e.status !== "Closed").length,
      },
      recentEnquiries: enquiries.slice(0, 5),
      brandName: settings.brandName,
    });
  }

  if (collection === "categories") {
    const categories = await listStoredCategories();
    return NextResponse.json({ ok: true, authenticated: Boolean(session), categories });
  }

  if (collection === "designs") {
    const [designs, categories] = await Promise.all([
      listStoredDesigns(),
      listStoredCategories(),
    ]);
    return NextResponse.json({
      ok: true,
      authenticated: Boolean(session),
      designs,
      categories,
    });
  }

  if (collection === "projects") {
    const projects = await listStoredProjects();
    return NextResponse.json({ ok: true, authenticated: Boolean(session), projects });
  }

  if (collection === "blogs") {
    const blogs = await listStoredBlogs();
    return NextResponse.json({ ok: true, authenticated: Boolean(session), blogs });
  }

  if (collection === "content") {
    const pages = await listStoredPageContents();
    return NextResponse.json({ ok: true, authenticated: Boolean(session), pages });
  }

  if (collection === "settings") {
    const settings = await getStoredSiteSettings();
    return NextResponse.json({ ok: true, authenticated: Boolean(session), settings });
  }

  return NextResponse.json(
    { ok: false, error: `Unknown CMS collection: ${collection}` },
    { status: 400 }
  );
}

export async function POST(request: Request) {
  const auth = requireAdminRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const collection = String(body?.collection || "");

    if (collection === "designs") {
      const categories = await listStoredCategories();
      const existing = await listStoredDesigns();
      const title = String(body.title || "").trim();
      if (!title) {
        return NextResponse.json(
          { ok: false, error: "Design title is required." },
          { status: 400 }
        );
      }

      const categorySlotNumber = Number(body.categorySlotNumber) || 1;
      const cat =
        categories.find((c) => c.slotNumber === categorySlotNumber) ||
        categories[0];

      const imageUrl =
        String(body.imageUrl || "").trim() ||
        "/images/atelier/artwork-botanical-canopy.jpg";
      const slug = toSlug(body.slug || title) || `design-${Date.now()}`;
      const id = String(body.id || "").trim() || `design-${Date.now()}`;

      const item: CatalogueDesignItem = {
        id,
        title,
        slug,
        categoryId: cat.id,
        categorySlug: cat.slug,
        categorySlotNumber: cat.slotNumber,
        categoryCode: cat.slotCode,
        categoryLabel: cat.name,
        summary:
          String(body.summary || "").trim() ||
          `${title} — bespoke architectural surface artwork by ATELIER — WALL STORY.`,
        description:
          String(body.description || "").trim() ||
          String(body.summary || "").trim() ||
          `${title} proportioned and printed directly onto your architectural surface.`,
        tags: Array.isArray(body.tags)
          ? body.tags.map(String)
          : String(body.tags || cat.name)
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
        compatibleSurfaces:
          Array.isArray(body.compatibleSurfaces) &&
          body.compatibleSurfaces.length > 0
            ? body.compatibleSurfaces.map(String)
            : ["Walls"],
        dimensionsNote:
          String(body.dimensionsNote || "").trim() ||
          "Custom-proportioned to your architectural wall dimensions",
        coverImage: {
          publicId: `designs/${slug}`,
          secureUrl: imageUrl,
          resourceType: "image",
          width: 1600,
          height: 1000,
          format: "webp",
          altText: `${title} wall artwork`,
        },
        galleryMedia: [
          {
            publicId: `designs/${slug}-01`,
            secureUrl: imageUrl,
            resourceType: "image",
            width: 1600,
            height: 1000,
            format: "webp",
            altText: `${title} elevation`,
          },
        ],
        videoAsset: null,
        aspectRatio:
          body.aspectRatio === "portrait" || body.aspectRatio === "square"
            ? body.aspectRatio
            : "landscape",
        featured: Boolean(body.featured),
        published: body.published !== undefined ? Boolean(body.published) : true,
        sortOrder:
          typeof body.sortOrder === "number"
            ? body.sortOrder
            : existing.length + 1,
        isDevelopmentFixture: false,
        visualizerConfig: {
          defaultMode: body.defaultMode === "pattern" ? "pattern" : "mural",
          textureUrl: imageUrl,
          width: 1600,
          height: 1000,
          mimeType: "image/webp",
        },
      };

      const saved = await upsertStoredDesign(item);
      return NextResponse.json({ ok: true, design: saved });
    }

    if (collection === "categories") {
      const id = String(body.id || "").trim();
      if (!id) {
        return NextResponse.json(
          { ok: false, error: "Category id is required." },
          { status: 400 }
        );
      }
      const coverUrl = String(body.coverImageUrl || "").trim();
      const updated = await upsertStoredCategory({
        id,
        name: body.name,
        slug: body.slug ? toSlug(body.slug) : undefined,
        description: body.description,
        displayOrder:
          body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
        isActive: body.isActive,
        coverImage: coverUrl
          ? {
              publicId: `categories/${id}`,
              secureUrl: coverUrl,
              resourceType: "image",
              altText: `${body.name || "Category"} cover`,
            }
          : undefined,
      });
      if (!updated) {
        return NextResponse.json(
          { ok: false, error: "Category slot not found." },
          { status: 404 }
        );
      }
      return NextResponse.json({ ok: true, category: updated });
    }

    if (collection === "projects") {
      const existing = await listStoredProjects();
      const title = String(body.title || "").trim();
      if (!title) {
        return NextResponse.json(
          { ok: false, error: "Project title is required." },
          { status: 400 }
        );
      }
      const slug = toSlug(body.slug || title) || `project-${Date.now()}`;
      const id = String(body.id || "").trim() || `proj-${Date.now()}`;
      const imageUrl =
        String(body.imageUrl || "").trim() ||
        "/images/atelier/project-hero-crane-living.jpg";
      const surfaceName = String(body.surfaceName || "Walls").trim();
      const nowIso = new Date().toISOString();

      const prev = existing.find((p) => p.id === id);
      const item: PortfolioProjectRecord = {
        id,
        title,
        shortTitle: title,
        slug,
        projectType: `${surfaceName} Installation`,
        spaceCategory: (body.spaceCategory as ProjectSpaceCategory) || "Residential",
        recordClassification: "Verified Completed Installation",
        artisticDirection: String(body.artisticDirection || "Bespoke Surface Print"),
        surfaceId: toSlug(surfaceName) || "walls",
        surfaceName,
        locationNote: String(body.locationNote || "Mumbai").trim(),
        summary:
          String(body.summary || "").trim() ||
          `${title} — direct 3D surface printing on ${surfaceName}.`,
        description:
          String(body.description || "").trim() ||
          String(body.summary || "").trim() ||
          `${title} executed by ATELIER — WALL STORY.`,
        architecturalNotes: prev?.architecturalNotes || [
          `Direct 3D surface print calibrated for ${surfaceName}.`,
          "Proportioned to architectural sightlines and ambient lighting.",
        ],
        coverImage: {
          publicId: `projects/${slug}`,
          secureUrl: imageUrl,
          resourceType: "image",
          width: 1600,
          height: 1000,
          format: "webp",
          altText: `${title} installation`,
        },
        exhibitionImage: imageUrl,
        galleryMedia: prev?.galleryMedia || [
          {
            publicId: `projects/${slug}-01`,
            secureUrl: imageUrl,
            resourceType: "image",
            width: 1600,
            height: 1000,
            format: "webp",
            altText: `${title} gallery view`,
          },
        ],
        beforeAfterMedia: prev?.beforeAfterMedia || {
          beforeLabel: "Prepared Surface",
          afterLabel: "Printed Elevation",
          beforeImageUrl: imageUrl,
          afterImageUrl: imageUrl,
        },
        videoAsset: null,
        featured: Boolean(body.featured),
        published: body.published !== undefined ? Boolean(body.published) : true,
        displayOrder:
          typeof body.displayOrder === "number"
            ? body.displayOrder
            : prev?.displayOrder ?? existing.length + 1,
        isDevelopmentFixture: false,
        seoTitle: `${title} | ATELIER — WALL STORY`,
        seoDescription: String(body.summary || title).trim(),
        createdAt: prev?.createdAt || nowIso,
        updatedAt: nowIso,
      };

      const saved = await upsertStoredProject(item);
      return NextResponse.json({ ok: true, project: saved });
    }

    if (collection === "blogs") {
      const existing = await listStoredBlogs();
      const title = String(body.title || "").trim();
      if (!title) {
        return NextResponse.json(
          { ok: false, error: "Article title is required." },
          { status: 400 }
        );
      }
      const id = String(body.id || "").trim() || `blog-${Date.now()}`;
      const prev = existing.find((b) => b.id === id);
      const slug = toSlug(body.slug || title) || `article-${Date.now()}`;
      const imageUrl =
        String(body.imageUrl || "").trim() ||
        prev?.coverImage.secureUrl ||
        "/images/atelier/artwork-lotus-atelier.jpg";
      const excerpt =
        String(body.excerpt || "").trim() ||
        prev?.excerpt ||
        "Studio insights on architectural wall art and multi-surface 3D printing.";
      const rawBody = String(body.content || "").trim();
      const paragraphs = rawBody
        ? rawBody
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean)
        : prev?.sections?.[0]?.paragraphs || [excerpt];

      const sections = [
        {
          heading: String(body.sectionHeading || "Studio Perspective").trim(),
          paragraphs,
        },
      ];
      const published =
        body.published !== undefined ? Boolean(body.published) : true;
      const nowIso = new Date().toISOString();

      const saved = await upsertStoredBlog({
        id,
        title,
        slug,
        categorySlug: String(body.categorySlug || "wall-art"),
        categoryName: String(body.categoryName || "Wall Art"),
        excerpt,
        coverImage: {
          publicId: `blogs/${slug}`,
          secureUrl: imageUrl,
          resourceType: "image",
          width: 1600,
          height: 1000,
          format: "webp",
          altText: title,
        },
        sections,
        tags: String(body.tags || "wall art, 3d printing, mumbai")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        authorLabel: "ATELIER — WALL STORY Editorial Desk",
        publishedAtLabel: published
          ? new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Draft",
        publishedIso: published ? nowIso : null,
        readingTimeMinutes: computeReadingTimeMinutes(sections, excerpt),
        featured: Boolean(body.featured),
        published,
        isEditorialFixture: false,
        seo: {
          metaTitle: `${title} | ATELIER — WALL STORY Journal`,
          metaDescription: excerpt,
          ogImageUrl: imageUrl,
        },
      });

      return NextResponse.json({ ok: true, blog: saved });
    }

    if (collection === "content") {
      if (!body.page || !body.page.pageKey) {
        return NextResponse.json(
          { ok: false, error: "Page content payload is required." },
          { status: 400 }
        );
      }
      const saved = await upsertStoredPageContent(body.page);
      return NextResponse.json({ ok: true, page: saved });
    }

    if (collection === "settings") {
      const saved = await saveStoredSiteSettings(body.settings || {});
      return NextResponse.json({ ok: true, settings: saved });
    }

    return NextResponse.json(
      { ok: false, error: `Unsupported collection: ${collection}` },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid CMS payload." },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  const auth = requireAdminRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const collection = String(body?.collection || "");
    const id = String(body?.id || "");

    if (collection === "designs") {
      const designs = await listStoredDesigns();
      const target = designs.find((d) => d.id === id);
      if (!target) {
        return NextResponse.json(
          { ok: false, error: "Design not found." },
          { status: 404 }
        );
      }
      const saved = await upsertStoredDesign({
        ...target,
        featured:
          typeof body.featured === "boolean" ? body.featured : target.featured,
        published:
          typeof body.published === "boolean"
            ? body.published
            : target.published,
        sortOrder:
          typeof body.sortOrder === "number"
            ? body.sortOrder
            : target.sortOrder,
      });
      return NextResponse.json({ ok: true, design: saved });
    }

    if (collection === "projects") {
      const projects = await listStoredProjects();
      const target = projects.find((p) => p.id === id);
      if (!target) {
        return NextResponse.json(
          { ok: false, error: "Project not found." },
          { status: 404 }
        );
      }
      const saved = await upsertStoredProject({
        ...target,
        featured:
          typeof body.featured === "boolean" ? body.featured : target.featured,
        published:
          typeof body.published === "boolean"
            ? body.published
            : target.published,
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.json({ ok: true, project: saved });
    }

    if (collection === "blogs") {
      const blogs = await listStoredBlogs();
      const target = blogs.find((b) => b.id === id);
      if (!target) {
        return NextResponse.json(
          { ok: false, error: "Article not found." },
          { status: 404 }
        );
      }
      const nextPublished =
        typeof body.published === "boolean" ? body.published : target.published;
      const saved = await upsertStoredBlog({
        ...target,
        featured:
          typeof body.featured === "boolean" ? body.featured : target.featured,
        published: nextPublished,
        publishedAtLabel: nextPublished
          ? target.publishedAtLabel === "Draft"
            ? new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : target.publishedAtLabel
          : "Draft",
      });
      return NextResponse.json({ ok: true, blog: saved });
    }

    return NextResponse.json(
      { ok: false, error: `Unsupported PATCH collection: ${collection}` },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to update record." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = requireAdminRequest(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection") || "";
  const id = searchParams.get("id") || "";

  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Record id is required." },
      { status: 400 }
    );
  }

  if (collection === "designs") {
    const deleted = await deleteStoredDesign(id);
    return NextResponse.json({ ok: deleted });
  }
  if (collection === "projects") {
    const deleted = await deleteStoredProject(id);
    return NextResponse.json({ ok: deleted });
  }
  if (collection === "blogs") {
    const deleted = await deleteStoredBlog(id);
    return NextResponse.json({ ok: deleted });
  }

  return NextResponse.json(
    { ok: false, error: `Unsupported DELETE collection: ${collection}` },
    { status: 400 }
  );
}

