export interface WallPoint {
  x: number;
  y: number;
}

export type WallQuad = [WallPoint, WallPoint, WallPoint, WallPoint];

export interface WallCandidate {
  corners: WallQuad;
  confidence: number;
  area: number;
}

export interface WallDetectionResult {
  candidates: WallCandidate[];
  confident: boolean;
  confidence: number;
  analysisSize: { width: number; height: number };
}

interface HoughLine {
  theta: number;
  rho: number;
  votes: number;
  minT: number;
  maxT: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function lineAngleDistance(a: number, b: number) {
  let delta = Math.abs(a - b) % Math.PI;
  if (delta > Math.PI / 2) delta = Math.PI - delta;
  return delta;
}

function lineIntersection(a: HoughLine, b: HoughLine): WallPoint | null {
  const ax = Math.cos(a.theta);
  const ay = Math.sin(a.theta);
  const bx = Math.cos(b.theta);
  const by = Math.sin(b.theta);
  const det = ax * by - bx * ay;
  if (Math.abs(det) < 0.12) return null;
  return {
    x: (a.rho * by - b.rho * ay) / det,
    y: (ax * b.rho - bx * a.rho) / det,
  };
}

function lineSupportsPoint(line: HoughLine, point: WallPoint, margin: number) {
  const tangent = -Math.sin(line.theta) * point.x + Math.cos(line.theta) * point.y;
  return tangent >= line.minT - margin && tangent <= line.maxT + margin;
}

function polygonArea(points: WallPoint[]) {
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const next = points[(i + 1) % points.length];
    area += points[i].x * next.y - next.x * points[i].y;
  }
  return Math.abs(area) / 2;
}

function orderCorners(points: WallPoint[]): WallQuad | null {
  if (points.length !== 4) return null;
  const center = points.reduce(
    (sum, point) => ({ x: sum.x + point.x / 4, y: sum.y + point.y / 4 }),
    { x: 0, y: 0 }
  );
  const ordered = [...points].sort(
    (a, b) =>
      Math.atan2(a.y - center.y, a.x - center.x) -
      Math.atan2(b.y - center.y, b.x - center.x)
  );
  const topLeftIndex = ordered.reduce(
    (best, point, index) =>
      point.x + point.y < ordered[best].x + ordered[best].y ? index : best,
    0
  );
  const rotated = [
    ...ordered.slice(topLeftIndex),
    ...ordered.slice(0, topLeftIndex),
  ];
  const quad = rotated as WallQuad;
  const cross =
    (quad[1].x - quad[0].x) * (quad[2].y - quad[1].y) -
    (quad[1].y - quad[0].y) * (quad[2].x - quad[1].x);
  if (cross < 0) return [quad[0], quad[3], quad[2], quad[1]];
  return quad;
}

function isInside(point: WallPoint, polygon: WallQuad) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    const crosses =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y || 1e-9) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function extractLines(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): { lines: HoughLine[]; edgeMap: Uint8Array } {
  const diagonal = Math.ceil(Math.hypot(width, height));
  const rhoCount = diagonal * 2 + 1;
  const thetaCount = 90;
  const accumulator = new Uint16Array(thetaCount * rhoCount);
  const edgeMap = new Uint8Array(width * height);
  const magnitudes = new Uint8Array(width * height);
  const gxValues = new Int16Array(width * height);
  const gyValues = new Int16Array(width * height);

  const grayAt = (x: number, y: number) => {
    const index = (y * width + x) * 4;
    return Math.round(
      0.299 * pixels[index] + 0.587 * pixels[index + 1] + 0.114 * pixels[index + 2]
    );
  };

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const tl = grayAt(x - 1, y - 1);
      const tc = grayAt(x, y - 1);
      const tr = grayAt(x + 1, y - 1);
      const ml = grayAt(x - 1, y);
      const mr = grayAt(x + 1, y);
      const bl = grayAt(x - 1, y + 1);
      const bc = grayAt(x, y + 1);
      const br = grayAt(x + 1, y + 1);
      const gx = -tl + tr - 2 * ml + 2 * mr - bl + br;
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
      const index = y * width + x;
      gxValues[index] = gx;
      gyValues[index] = gy;
      magnitudes[index] = Math.min(255, Math.round(Math.hypot(gx, gy) / 4));
    }
  }

  const cosTable = Array.from({ length: thetaCount }, (_, index) =>
    Math.cos((index * Math.PI) / thetaCount)
  );
  const sinTable = Array.from({ length: thetaCount }, (_, index) =>
    Math.sin((index * Math.PI) / thetaCount)
  );

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const magnitude = magnitudes[index];
      if (magnitude < 24) continue;
      edgeMap[index] = 1;
      const gradientAngle =
        (Math.atan2(gyValues[index], gxValues[index]) + Math.PI) % Math.PI;
      const centerTheta = Math.round((gradientAngle * thetaCount) / Math.PI);
      for (let offset = -2; offset <= 2; offset += 1) {
        const theta = (centerTheta + offset + thetaCount) % thetaCount;
        const rho = Math.round(x * cosTable[theta] + y * sinTable[theta]);
        const rhoIndex = rho + diagonal;
        if (rhoIndex >= 0 && rhoIndex < rhoCount) {
          const accIndex = theta * rhoCount + rhoIndex;
          accumulator[accIndex] = Math.min(65535, accumulator[accIndex] + 1);
        }
      }
    }
  }

  const peaks: Array<{ theta: number; rho: number; votes: number }> = [];
  const minimumVotes = Math.max(22, Math.round(Math.min(width, height) * 0.14));
  for (let theta = 0; theta < thetaCount; theta += 1) {
    for (let rhoIndex = 1; rhoIndex < rhoCount - 1; rhoIndex += 1) {
      const votes = accumulator[theta * rhoCount + rhoIndex];
      if (votes < minimumVotes) continue;
      let localMaximum = true;
      for (let dt = -3; dt <= 3 && localMaximum; dt += 1) {
        for (let dr = -8; dr <= 8; dr += 1) {
          if (dt === 0 && dr === 0) continue;
          const neighborTheta = (theta + dt + thetaCount) % thetaCount;
          if (
            accumulator[neighborTheta * rhoCount + rhoIndex + dr] > votes
          ) {
            localMaximum = false;
            break;
          }
        }
      }
      if (localMaximum) {
        peaks.push({ theta, rho: rhoIndex - diagonal, votes });
      }
    }
  }
  peaks.sort((a, b) => b.votes - a.votes);

  const lines: HoughLine[] = [];
  for (const peak of peaks.slice(0, 80)) {
    const theta = (peak.theta * Math.PI) / thetaCount;
    const cosine = Math.cos(theta);
    const sine = Math.sin(theta);
    const tangentX = -sine;
    const tangentY = cosine;
    const projections: number[] = [];
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = y * width + x;
        if (!edgeMap[index]) continue;
        const dot = x * cosine + y * sine;
        if (Math.abs(dot - peak.rho) > 2.4) continue;
        const gradientAngle =
          (Math.atan2(gyValues[index], gxValues[index]) + Math.PI) % Math.PI;
        if (lineAngleDistance(gradientAngle, theta) > 0.22) continue;
        projections.push(x * tangentX + y * tangentY);
      }
    }
    if (projections.length < minimumVotes) continue;
    projections.sort((a, b) => a - b);
    let start = projections[0];
    let end = start;
    let bestSegment: [number, number] = [start, start];
    for (let i = 1; i < projections.length; i += 1) {
      if (projections[i] - end > Math.max(10, Math.min(width, height) * 0.055)) {
        if (end - start > bestSegment[1] - bestSegment[0]) {
          bestSegment = [start, end];
        }
        start = projections[i];
      }
      end = projections[i];
    }
    if (end - start > bestSegment[1] - bestSegment[0]) bestSegment = [start, end];
    if (bestSegment[1] - bestSegment[0] < Math.min(width, height) * 0.18) continue;
    const line = { ...peak, theta, minT: bestSegment[0], maxT: bestSegment[1] };
    if (
      lines.some(
        (existing) =>
          lineAngleDistance(existing.theta, line.theta) < 0.07 &&
          Math.abs(existing.rho - line.rho) < 7
      )
    ) {
      continue;
    }
    lines.push(line);
    if (lines.length >= 14) break;
  }
  return { lines, edgeMap };
}

/**
 * Finds wall-like planar regions from image edges and line intersections. It is
 * intentionally conservative: only strong, supported quadrilaterals are marked
 * as automatic; weaker candidates are offered for user selection or manual work.
 */
export async function analyzeWallPhoto(
  image: CanvasImageSource,
  naturalWidth: number,
  naturalHeight: number
): Promise<WallDetectionResult> {
  const maxDimension = 384;
  const ratio = Math.min(1, maxDimension / Math.max(naturalWidth, naturalHeight));
  const width = Math.max(1, Math.round(naturalWidth * ratio));
  const height = Math.max(1, Math.round(naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("This browser could not prepare the photo for analysis.");
  ctx.drawImage(image, 0, 0, width, height);
  const pixelData = ctx.getImageData(0, 0, width, height);
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  const { lines, edgeMap } = extractLines(pixelData.data, width, height);
  const diagonal = Math.hypot(width, height);
  const candidates: WallCandidate[] = [];

  const parallelPairs: Array<[HoughLine, HoughLine]> = [];
  for (let i = 0; i < lines.length; i += 1) {
    for (let j = i + 1; j < lines.length; j += 1) {
      const a = lines[i];
      const b = lines[j];
      if (lineAngleDistance(a.theta, b.theta) > 0.34) continue;
      if (Math.abs(a.rho - b.rho) < Math.min(width, height) * 0.14) continue;
      parallelPairs.push([a, b]);
    }
  }

  for (let i = 0; i < parallelPairs.length; i += 1) {
    for (let j = i + 1; j < parallelPairs.length; j += 1) {
      const [a0, a1] = parallelPairs[i];
      const [b0, b1] = parallelPairs[j];
      if (lineAngleDistance(a0.theta, b0.theta) < 0.62) continue;
      const intersections = [
        lineIntersection(a0, b0),
        lineIntersection(a0, b1),
        lineIntersection(a1, b0),
        lineIntersection(a1, b1),
      ];
      if (intersections.some((point) => !point)) continue;
      const points = intersections as WallPoint[];
      const segmentMargin = diagonal * 0.08;
      if (
        !lineSupportsPoint(a0, points[0], segmentMargin) ||
        !lineSupportsPoint(a0, points[1], segmentMargin) ||
        !lineSupportsPoint(a1, points[2], segmentMargin) ||
        !lineSupportsPoint(a1, points[3], segmentMargin) ||
        !lineSupportsPoint(b0, points[0], segmentMargin) ||
        !lineSupportsPoint(b0, points[2], segmentMargin) ||
        !lineSupportsPoint(b1, points[1], segmentMargin) ||
        !lineSupportsPoint(b1, points[3], segmentMargin)
      ) {
        continue;
      }
      if (
        points.some(
          (point) =>
            point.x < -width * 0.04 ||
            point.x > width * 1.04 ||
            point.y < -height * 0.04 ||
            point.y > height * 1.04
        )
      ) {
        continue;
      }
      const ordered = orderCorners(points);
      if (!ordered) continue;
      const areaPixels = polygonArea(ordered);
      const area = areaPixels / (width * height);
      if (area < 0.11 || area > 0.94) continue;
      const topY = (ordered[0].y + ordered[1].y) / 2 / height;
      const bottomY = (ordered[2].y + ordered[3].y) / 2 / height;
      const leftLength = Math.hypot(
        ordered[3].x - ordered[0].x,
        ordered[3].y - ordered[0].y
      );
      const rightLength = Math.hypot(
        ordered[2].x - ordered[1].x,
        ordered[2].y - ordered[1].y
      );
      const topLength = Math.hypot(
        ordered[1].x - ordered[0].x,
        ordered[1].y - ordered[0].y
      );
      const bottomLength = Math.hypot(
        ordered[2].x - ordered[3].x,
        ordered[2].y - ordered[3].y
      );
      const aspect = (topLength + bottomLength) / Math.max(1, leftLength + rightLength);
      if (aspect < 0.45 || aspect > 3.8 || bottomY - topY < 0.13) continue;

      let insideCount = 0;
      let edgeCount = 0;
      const sampleStride = Math.max(2, Math.floor(Math.min(width, height) / 48));
      for (let y = 2; y < height - 2; y += sampleStride) {
        for (let x = 2; x < width - 2; x += sampleStride) {
          if (!isInside({ x, y }, ordered)) continue;
          insideCount += 1;
          if (edgeMap[y * width + x]) edgeCount += 1;
        }
      }
      const interiorEdgeRatio = edgeCount / Math.max(1, insideCount);
      const edgeCleanliness = clamp01(1 - interiorEdgeRatio / 0.34);
      const lineSupport = clamp01(
        (a0.votes + a1.votes + b0.votes + b1.votes) / (diagonal * 1.18)
      );
      const sizeScore = clamp01(area / 0.58);
      const wallPosition = clamp01((bottomY - 0.18) / 0.7);
      const confidence = clamp01(
        0.39 * sizeScore +
          0.29 * lineSupport +
          0.23 * edgeCleanliness +
          0.09 * wallPosition
      );
      if (confidence < 0.32) continue;
      const candidate: WallCandidate = {
        corners: ordered.map((point) => ({
          x: clamp01(point.x / width),
          y: clamp01(point.y / height),
        })) as WallQuad,
        confidence,
        area,
      };
      if (
        !candidates.some(
          (existing) =>
            Math.abs(existing.area - area) < 0.035 &&
            existing.corners.every((point, index) => {
              const other = candidate.corners[index];
              return Math.hypot(point.x - other.x, point.y - other.y) < 0.055;
            })
        )
      ) {
        candidates.push(candidate);
      }
    }
  }

  candidates.sort((a, b) => b.confidence - a.confidence);
  const best = candidates[0];
  return {
    candidates: candidates.slice(0, 4),
    confident: Boolean(best && best.confidence >= 0.74),
    confidence: best?.confidence ?? 0,
    analysisSize: { width, height },
  };
}

function solveHomography(corners: WallQuad) {
  const [p0, p1, p2, p3] = corners;
  const dx1 = p1.x - p2.x;
  const dx2 = p3.x - p2.x;
  const sx = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y;
  const dy2 = p3.y - p2.y;
  const sy = p0.y - p1.y + p2.y - p3.y;
  const denominator = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(denominator) < 1e-7) return null;
  const g = (sx * dy2 - sy * dx2) / denominator;
  const h = (dx1 * sy - dy1 * sx) / denominator;
  return [
    p1.x - p0.x + g * p1.x,
    p3.x - p0.x + h * p3.x,
    p0.x,
    p1.y - p0.y + g * p1.y,
    p3.y - p0.y + h * p3.y,
    p0.y,
    g,
    h,
    1,
  ];
}

function project(homography: number[], u: number, v: number) {
  const denominator = homography[6] * u + homography[7] * v + homography[8];
  const inverse = 1 / (Math.abs(denominator) > 1e-7 ? denominator : 1);
  return {
    x: (homography[0] * u + homography[1] * v + homography[2]) * inverse,
    y: (homography[3] * u + homography[4] * v + homography[5]) * inverse,
  };
}

function mapTriangle(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  imageWidth: number,
  imageHeight: number,
  source: [WallPoint, WallPoint, WallPoint],
  destination: [WallPoint, WallPoint, WallPoint],
  scaleX: number,
  scaleY: number
) {
  const [s0, s1, s2] = source;
  const [d0, d1, d2] = destination;
  const sx0 = s0.x * imageWidth;
  const sy0 = s0.y * imageHeight;
  const sx1 = s1.x * imageWidth;
  const sy1 = s1.y * imageHeight;
  const sx2 = s2.x * imageWidth;
  const sy2 = s2.y * imageHeight;
  const dx0 = d0.x * scaleX;
  const dy0 = d0.y * scaleY;
  const dx1 = d1.x * scaleX;
  const dy1 = d1.y * scaleY;
  const dx2 = d2.x * scaleX;
  const dy2 = d2.y * scaleY;
  const sourceDet = sx0 * (sy1 - sy2) + sx1 * (sy2 - sy0) + sx2 * (sy0 - sy1);
  if (Math.abs(sourceDet) < 1e-7) return;
  const a =
    (dx0 * (sy1 - sy2) + dx1 * (sy2 - sy0) + dx2 * (sy0 - sy1)) / sourceDet;
  const c =
    (dx0 * (sx2 - sx1) + dx1 * (sx0 - sx2) + dx2 * (sx1 - sx0)) / sourceDet;
  const e =
    (dx0 * (sx1 * sy2 - sx2 * sy1) +
      dx1 * (sx2 * sy0 - sx0 * sy2) +
      dx2 * (sx0 * sy1 - sx1 * sy0)) /
    sourceDet;
  const b =
    (dy0 * (sy1 - sy2) + dy1 * (sy2 - sy0) + dy2 * (sy0 - sy1)) / sourceDet;
  const d =
    (dy0 * (sx2 - sx1) + dy1 * (sx0 - sx2) + dy2 * (sx1 - sx0)) / sourceDet;
  const f =
    (dy0 * (sx1 * sy2 - sx2 * sy1) +
      dy1 * (sx2 * sy0 - sx0 * sy2) +
      dy2 * (sx0 * sy1 - sx1 * sy0)) /
    sourceDet;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(dx0, dy0);
  ctx.lineTo(dx1, dy1);
  ctx.lineTo(dx2, dy2);
  ctx.closePath();
  ctx.clip();
  ctx.setTransform(a, b, c, d, e, f);
  const sourceLeft = Math.min(sx0, sx1, sx2);
  const sourceTop = Math.min(sy0, sy1, sy2);
  const sourceRight = Math.max(sx0, sx1, sx2);
  const sourceBottom = Math.max(sy0, sy1, sy2);
  const sourceWidth = Math.max(1, sourceRight - sourceLeft);
  const sourceHeight = Math.max(1, sourceBottom - sourceTop);
  ctx.drawImage(
    image,
    sourceLeft,
    sourceTop,
    sourceWidth,
    sourceHeight,
    sourceLeft,
    sourceTop,
    sourceWidth,
    sourceHeight
  );
  ctx.restore();
}

function makeArtworkPlane(
  artwork: HTMLImageElement,
  width: number,
  height: number,
  options: {
    mode: "cover" | "contain" | "repeat";
    scale: number;
    offsetX: number;
    offsetY: number;
    brightness: number;
  }
) {
  const plane = document.createElement("canvas");
  plane.width = width;
  plane.height = height;
  const ctx = plane.getContext("2d");
  if (!ctx) throw new Error("Could not create the artwork preview surface.");
  ctx.filter = `brightness(${options.brightness}%)`;

  if (options.mode === "repeat") {
    const tileScale =
      Math.max(width / artwork.naturalWidth, height / artwork.naturalHeight) *
      0.34 *
      options.scale;
    const tileWidth = Math.max(1, artwork.naturalWidth * tileScale);
    const tileHeight = Math.max(1, artwork.naturalHeight * tileScale);
    for (
      let y = -tileHeight + options.offsetY * height;
      y < height + tileHeight;
      y += tileHeight
    ) {
      for (
        let x = -tileWidth + options.offsetX * width;
        x < width + tileWidth;
        x += tileWidth
      ) {
        ctx.drawImage(artwork, x, y, tileWidth, tileHeight);
      }
    }
    ctx.filter = "none";
    return plane;
  }

  const fit =
    options.mode === "cover"
      ? Math.max(width / artwork.naturalWidth, height / artwork.naturalHeight)
      : Math.min(width / artwork.naturalWidth, height / artwork.naturalHeight);
  const drawWidth = artwork.naturalWidth * fit * options.scale;
  const drawHeight = artwork.naturalHeight * fit * options.scale;
  ctx.drawImage(
    artwork,
    (width - drawWidth) / 2 + options.offsetX * width,
    (height - drawHeight) / 2 + options.offsetY * height,
    drawWidth,
    drawHeight
  );
  ctx.filter = "none";
  return plane;
}

/** Composite the original photo and an artwork plane through a projective quad. */
export function renderAutoFitComposite(options: {
  room: HTMLImageElement;
  artwork: HTMLImageElement;
  corners: WallQuad;
  mode: "cover" | "contain" | "repeat";
  scale: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
  lighting: number;
  brightness: number;
  protectionStrokes?: Array<{ points: WallPoint[]; width: number }>;
  maxPixels?: number;
}) {
  const { room, artwork, corners } = options;
  const naturalPixels = room.naturalWidth * room.naturalHeight;
  const maxPixels = options.maxPixels ?? 16_000_000;
  const renderScale = Math.min(1, Math.sqrt(maxPixels / Math.max(1, naturalPixels)));
  const width = Math.max(1, Math.round(room.naturalWidth * renderScale));
  const height = Math.max(1, Math.round(room.naturalHeight * renderScale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create a preview canvas in this browser.");
  ctx.drawImage(room, 0, 0, width, height);

  const leftHeight = Math.hypot(
    (corners[3].x - corners[0].x) * width,
    (corners[3].y - corners[0].y) * height
  );
  const rightHeight = Math.hypot(
    (corners[2].x - corners[1].x) * width,
    (corners[2].y - corners[1].y) * height
  );
  const topWidth = Math.hypot(
    (corners[1].x - corners[0].x) * width,
    (corners[1].y - corners[0].y) * height
  );
  const bottomWidth = Math.hypot(
    (corners[2].x - corners[3].x) * width,
    (corners[2].y - corners[3].y) * height
  );
  const planeWidth = Math.max(256, Math.min(3200, Math.round((topWidth + bottomWidth) / 2)));
  const planeHeight = Math.max(256, Math.min(3200, Math.round((leftHeight + rightHeight) / 2)));
  const artworkPlane = makeArtworkPlane(artwork, planeWidth, planeHeight, options);

  const homography = solveHomography(corners);
  if (!homography) throw new Error("The wall corners do not form a valid perspective surface.");
  const subdivisions = width > 1800 ? 24 : 16;
  const overlay = document.createElement("canvas");
  overlay.width = width;
  overlay.height = height;
  const overlayCtx = overlay.getContext("2d");
  if (!overlayCtx) throw new Error("Could not create the perspective preview.");
  for (let row = 0; row < subdivisions; row += 1) {
    for (let column = 0; column < subdivisions; column += 1) {
      const u0 = column / subdivisions;
      const u1 = (column + 1) / subdivisions;
      const v0 = row / subdivisions;
      const v1 = (row + 1) / subdivisions;
      const p00 = project(homography, u0, v0);
      const p10 = project(homography, u1, v0);
      const p11 = project(homography, u1, v1);
      const p01 = project(homography, u0, v1);
      const s00 = { x: u0, y: v0 };
      const s10 = { x: u1, y: v0 };
      const s11 = { x: u1, y: v1 };
      const s01 = { x: u0, y: v1 };
      mapTriangle(overlayCtx, artworkPlane, planeWidth, planeHeight, [s00, s10, s11], [p00, p10, p11], width, height);
      mapTriangle(overlayCtx, artworkPlane, planeWidth, planeHeight, [s00, s11, s01], [p00, p11, p01], width, height);
    }
  }
  if (options.protectionStrokes?.length) {
    overlayCtx.globalCompositeOperation = "destination-out";
    overlayCtx.lineCap = "round";
    overlayCtx.lineJoin = "round";
    for (const stroke of options.protectionStrokes) {
      if (stroke.points.length < 1) continue;
      overlayCtx.lineWidth = Math.max(2, stroke.width * width);
      overlayCtx.beginPath();
      overlayCtx.moveTo(stroke.points[0].x * width, stroke.points[0].y * height);
      for (let index = 1; index < stroke.points.length; index += 1) {
        overlayCtx.lineTo(stroke.points[index].x * width, stroke.points[index].y * height);
      }
      if (stroke.points.length === 1) {
        overlayCtx.lineTo(stroke.points[0].x * width + 0.01, stroke.points[0].y * height + 0.01);
      }
      overlayCtx.stroke();
    }
    overlayCtx.globalCompositeOperation = "source-over";
  }

  const result = document.createElement("canvas");
  result.width = width;
  result.height = height;
  const resultCtx = result.getContext("2d");
  if (!resultCtx) throw new Error("Could not create the final composition.");
  resultCtx.drawImage(room, 0, 0, width, height);
  const lightingStrength = clamp01(options.lighting);
  const printStrength = clamp01(options.opacity) * (1 - lightingStrength);
  if (printStrength > 0) {
    resultCtx.globalAlpha = printStrength;
    resultCtx.globalCompositeOperation = "source-over";
    resultCtx.drawImage(overlay, 0, 0);
  }
  const textureStrength = clamp01(options.opacity) * lightingStrength;
  if (textureStrength > 0) {
    resultCtx.globalAlpha = textureStrength;
    resultCtx.globalCompositeOperation = "multiply";
    resultCtx.drawImage(overlay, 0, 0);
  }
  resultCtx.globalAlpha = 1;
  resultCtx.globalCompositeOperation = "source-over";
  return result;
}
