import { BASE_PX_PER_MM } from './constants';
import { clamp, screenToImg } from './geometry';
import type { ImageCenterScreenFn } from './interfaces/stageCanvas.interfaces';
import { LINE_TYPE_LABEL } from './types';
import type {
  GoldenMode, Measurement, Point, RefObject, RefObjectType, ScaleDim, Tool, Unit, VanishingRay,
} from './types';

export const DEFAULT_REF_COLOR = '#808080';
function freshTypeCounters(): Record<RefObjectType, number> {
  return { h: 0, v: 0, edge: 0, custom: 0, point: 0, };
}

export const toolState = $state({
  image: null as HTMLImageElement | null,
  naturalW: 0, naturalH: 0,
  fileName: '',

  rotation: 0,
  freeAngle: 0, // continuous fine-tune tilt (degrees), independent of the 90° snaps
  flipH: false,
  flipV: false,
  oriented: null as HTMLCanvasElement | null,
  orientedW: 0, orientedH: 0,

  scaleDim: 'width' as ScaleDim,
  scaleValue: 14.5,
  unit: 'cm' as Unit,
  pxPerUnit: 1,

  zoom: 1,
  panX: 0, panY: 0,

  showGrid: true,
  showRulerTop: true,
  showRulerLeft: true,
  gridRows: 10,
  gridCols: 10,

  goldenMode: 'none' as GoldenMode,

  activeTool: null as Tool,
  pendingPoint: null as Point | null,
  hoverPoint: null as Point | null,

  measurements: [] as Measurement[],
  refObjects: [] as RefObject[],
  typeCounters: freshTypeCounters(),

  vanishingPoint: null as Point | null,
  vpRays: [] as VanishingRay[],

  calibrationFactor: 1,
  realSizeActive: false,
  savedZoom: 1, savedPanX: 0, savedPanY: 0,

  nextId: 1,
});

// ---------------------------------------------------------------
// Image loading & orientation
// ---------------------------------------------------------------
export function loadImageFile(file: File, onReady?: () => void) {
  if (!file || !/^image\/(png|jpe?g|webp)$/.test(file.type)) return;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    toolState.image = img;
    toolState.naturalW = img.naturalWidth;
    toolState.naturalH = img.naturalHeight;
    toolState.fileName = `${file.name}  ·  ${img.naturalWidth}×${img.naturalHeight} px`;
    resetForNewImage();
    rebuildOriented();
    URL.revokeObjectURL(url);
    onReady?.();
  };
  img.src = url;
}

export function loadImageFromDataUrl(dataUrl: string, label: string, onReady: () => void) {
  const img = new Image();
  img.onload = () => {
    toolState.image = img;
    toolState.naturalW = img.naturalWidth;
    toolState.naturalH = img.naturalHeight;
    toolState.fileName = label;
    onReady();
  };
  img.src = dataUrl;
}

function resetForNewImage() {
  toolState.rotation = 0; toolState.freeAngle = 0; toolState.flipH = false; toolState.flipV = false;
  toolState.measurements = []; toolState.pendingPoint = null;
  toolState.refObjects = []; toolState.vanishingPoint = null; toolState.vpRays = [];
  toolState.typeCounters = freshTypeCounters();
  toolState.realSizeActive = false;
  toolState.activeTool = null;
}

/** Rebuilds the oriented offscreen bitmap after rotation/flip/free-angle changes. */
export function rebuildOriented() {
  if (!toolState.image) return;
  const totalDeg = toolState.rotation + toolState.freeAngle;
  const rad = (totalDeg * Math.PI) / 180;
  const nw = toolState.naturalW, nh = toolState.naturalH;
  const w = Math.max(1, Math.round(Math.abs(nw * Math.cos(rad)) + Math.abs(nh * Math.sin(rad))));
  const h = Math.max(1, Math.round(Math.abs(nw * Math.sin(rad)) + Math.abs(nh * Math.cos(rad))));
  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  const octx = off.getContext('2d')!;
  octx.save();
  octx.translate(w / 2, h / 2);
  octx.rotate(rad);
  octx.scale(toolState.flipH ? -1 : 1, toolState.flipV ? -1 : 1);
  octx.drawImage(toolState.image, -nw / 2, -nh / 2);
  octx.restore();
  toolState.oriented = off;
  toolState.orientedW = w;
  toolState.orientedH = h;
  updateScale();
}

export function rotate(delta: 90 | -90) {
  if (!toolState.image) return;
  toolState.rotation = (toolState.rotation + delta + 360) % 360;
  rebuildOriented();
}
export function flipHorizontal() { if (toolState.image) { toolState.flipH = !toolState.flipH; rebuildOriented(); } }
export function flipVertical() { if (toolState.image) { toolState.flipV = !toolState.flipV; rebuildOriented(); } }
export function resetTransform() {
  if (!toolState.image) return;
  toolState.rotation = 0; toolState.freeAngle = 0; toolState.flipH = false; toolState.flipV = false;
  rebuildOriented();
}

/**
 * Sets the continuous fine-tune tilt (in degrees, applied on top of the 90° rotation).
 * The image's on-screen center is kept anchored so the bounding box growing/shrinking
 * as the angle changes doesn't shift or rescale the view underneath the user's hand.
 */
export function setFreeAngle(deg: number) {
  if (!toolState.image) return;
  const oldW = toolState.orientedW, oldH = toolState.orientedH;
  const centerScreenX = toolState.panX + (oldW / 2) * toolState.zoom;
  const centerScreenY = toolState.panY + (oldH / 2) * toolState.zoom;
  toolState.freeAngle = deg;
  rebuildOriented();
  toolState.panX = centerScreenX - (toolState.orientedW / 2) * toolState.zoom;
  toolState.panY = centerScreenY - (toolState.orientedH / 2) * toolState.zoom;
}

/** Removes the free-angle tilt only (keeps the 90° rotation and flips as they were). */
export function clearFreeAngle() {
  if (toolState.freeAngle !== 0) setFreeAngle(0);
}

// ---------------------------------------------------------------
// Scale
// ---------------------------------------------------------------
/** Real content dimensions at the current 90° rotation — deliberately ignores
 *  freeAngle, since that only pads the canvas and must never affect calibration. */
function contentDims(): { w: number; h: number } {
  const swapped90 = toolState.rotation === 90 || toolState.rotation === 270;
  return swapped90
    ? { w: toolState.naturalH, h: toolState.naturalW }
    : { w: toolState.naturalW, h: toolState.naturalH };
}

export function updateScale() {
  if (!toolState.image) return;
  const { w, h } = contentDims();
  const dimPx = toolState.scaleDim === 'width' ? w : h;
  toolState.pxPerUnit = dimPx / toolState.scaleValue;
}

export function otherDimensionLabel(): string {
  if (!toolState.image) return '—';
  const { w, h } = contentDims();
  const otherDimPx = toolState.scaleDim === 'width' ? h : w;
  const otherVal = otherDimPx / toolState.pxPerUnit;
  const label = toolState.scaleDim === 'width' ? 'Alto' : 'Ancho';
  return `${label} ≈ ${Math.round(otherVal * 100) / 100} ${toolState.unit}`;
}

export function setScaleDim(dim: ScaleDim) { toolState.scaleDim = dim; updateScale(); }
export function setScaleValue(v: number) { if (v > 0) { toolState.scaleValue = v; updateScale(); } }
export function setScaleUnit(newUnit: Unit) {
  if (newUnit === toolState.unit) return;
  if (newUnit === 'mm' && toolState.unit === 'cm') toolState.scaleValue *= 10;
  if (newUnit === 'cm' && toolState.unit === 'mm') toolState.scaleValue /= 10;
  toolState.unit = newUnit;
  updateScale();
}

// ---------------------------------------------------------------
// Zoom / pan
// ---------------------------------------------------------------
export function setZoom(newZoom: number, aboutX: number, aboutY: number) {
  newZoom = clamp(newZoom, 0.02, 40);
  const imgX = (aboutX - toolState.panX) / toolState.zoom;
  const imgY = (aboutY - toolState.panY) / toolState.zoom;
  toolState.zoom = newZoom;
  toolState.panX = aboutX - imgX * newZoom;
  toolState.panY = aboutY - imgY * newZoom;
}

export function fitToScreen(viewportW: number, viewportH: number) {
  if (!toolState.oriented) return;
  const margin = 0.92;
  const z = Math.min(viewportW / toolState.orientedW, viewportH / toolState.orientedH) * margin;
  toolState.zoom = clamp(z, 0.02, 40);
  toolState.panX = (viewportW - toolState.orientedW * toolState.zoom) / 2;
  toolState.panY = (viewportH - toolState.orientedH * toolState.zoom) / 2;
  if (toolState.realSizeActive) applyRealSizeZoom(viewportW, viewportH);
}

// ---------------------------------------------------------------
// Real size on screen + calibration
// ---------------------------------------------------------------


export function truePxPerUnit(): number {
  const basePxPerUnit = toolState.unit === 'cm' ? BASE_PX_PER_MM * 10 : BASE_PX_PER_MM;
  return basePxPerUnit * toolState.calibrationFactor;
}

export function applyRealSizeZoom(viewportW?: number, viewportH?: number) {
  if (!toolState.oriented) return;
  const targetZoom = truePxPerUnit() / toolState.pxPerUnit;
  const w = viewportW ?? 0, h = viewportH ?? 0;
  const cx = w / 2, cy = h / 2;
  const imgX = (cx - toolState.panX) / toolState.zoom, imgY = (cy - toolState.panY) / toolState.zoom;
  toolState.zoom = targetZoom;
  toolState.panX = cx - imgX * toolState.zoom;
  toolState.panY = cy - imgY * toolState.zoom;
}

export function toggleRealSize(viewportW: number, viewportH: number) {
  if (!toolState.oriented) return;
  toolState.realSizeActive = !toolState.realSizeActive;
  if (toolState.realSizeActive) {
    toolState.savedZoom = toolState.zoom; toolState.savedPanX = toolState.panX; toolState.savedPanY = toolState.panY;
    applyRealSizeZoom(viewportW, viewportH);
  } else {
    toolState.zoom = toolState.savedZoom; toolState.panX = toolState.savedPanX; toolState.panY = toolState.savedPanY;
  }
}

export function calibrate(measuredMm: number) {
  if (measuredMm <= 0) return;
  toolState.calibrationFactor = 100 / measuredMm;
}

// ---------------------------------------------------------------
// Tools & click handling
// ---------------------------------------------------------------
export function setTool(tool: Tool) {
  toolState.activeTool = toolState.activeTool === tool ? null : tool;
  toolState.pendingPoint = null;
}

function nextName(type: RefObjectType): string {
  toolState.typeCounters[type] = (toolState.typeCounters[type] || 0) + 1;
  return `${LINE_TYPE_LABEL[type]} ${toolState.typeCounters[type]}`;
}

export function handleToolClick(mx: number, my: number) {
  const p = screenToImg(mx, my, toolState.zoom, toolState.panX, toolState.panY);
  const tool = toolState.activeTool;

  if (tool === 'measure' || tool === 'line-edge' || tool === 'line-custom') {
    if (!toolState.pendingPoint) {
      toolState.pendingPoint = p;
    } else {
      if (tool === 'measure') {
        toolState.measurements.push({ id: toolState.nextId++, ax: toolState.pendingPoint.x, ay: toolState.pendingPoint.y, bx: p.x, by: p.y });
      } else {
        const type: RefObjectType = tool === 'line-edge' ? 'edge' : 'custom';
        toolState.refObjects.push({
          id: toolState.nextId++, type, name: nextName(type),
          ax: toolState.pendingPoint.x, ay: toolState.pendingPoint.y, bx: p.x, by: p.y, locked: false,
          color: DEFAULT_REF_COLOR,
        });
      }
      toolState.pendingPoint = null;
    }
  } else if (tool === 'line-h') {
    toolState.refObjects.push({ id: toolState.nextId++, type: 'h', name: nextName('h'), ax: 0, ay: p.y, bx: 0, by: p.y, locked: false, color: DEFAULT_REF_COLOR, });
  } else if (tool === 'line-v') {
    toolState.refObjects.push({ id: toolState.nextId++, type: 'v', name: nextName('v'), ax: p.x, ay: 0, bx: p.x, by: 0, locked: false, color: DEFAULT_REF_COLOR, });
  } else if (tool === 'point') {
    toolState.refObjects.push({ id: toolState.nextId++, type: 'point', name: nextName('point'), ax: p.x, ay: p.y, bx: p.x, by: p.y, locked: false, color: DEFAULT_REF_COLOR, });
  } else if (tool === 'vp-place') {
    toolState.vanishingPoint = { x: p.x, y: p.y };
  } else if (tool === 'vp-ray') {
    if (toolState.vanishingPoint) toolState.vpRays.push({ id: toolState.nextId++, x: p.x, y: p.y });
  }
}

export function deleteMeasurement(id: number) {
  toolState.measurements = toolState.measurements.filter((m) => m.id !== id);
}
export function deleteRefObject(id: number) {
  toolState.refObjects = toolState.refObjects.filter((o) => o.id !== id);
}
export function renameRefObject(id: number, name: string) {
  const o = toolState.refObjects.find((o) => o.id === id);
  if (o && name.trim()) o.name = name.trim();
}
export function setRefObjectColor(id: number, color: string) {
  const o = toolState.refObjects.find((o) => o.id === id);

  if (o) {
    o.color = color;
  }
}
export function deleteVanishingRay(id: number) {
  toolState.vpRays = toolState.vpRays.filter((r) => r.id !== id);
}
export function deleteVanishingPoint() {
  toolState.vanishingPoint = null;
  toolState.vpRays = [];
  if (toolState.activeTool === 'vp-ray') setTool(null);
}

// ---------------------------------------------------------------
// Dragging existing objects on the canvas
// ---------------------------------------------------------------
export function findNearPointObject(
  mx: number,
  my: number,
): RefObject | null {
  for (let i = toolState.refObjects.length - 1; i >= 0; i--) {
    const o = toolState.refObjects[i];

    if (o.locked) continue;
    if (o.type !== 'point') continue;

    const sx = o.ax * toolState.zoom + toolState.panX;
    const sy = o.ay * toolState.zoom + toolState.panY;

    if (Math.hypot(sx - mx, sy - my) < 10) {
      return o;
    }
  }

  return null;
}

export function nearVanishingPoint(mx: number, my: number): boolean {
  if (!toolState.vanishingPoint) return false;
  const sx = toolState.vanishingPoint.x * toolState.zoom + toolState.panX;
  const sy = toolState.vanishingPoint.y * toolState.zoom + toolState.panY;
  return Math.hypot(sx - mx, sy - my) < 10;
}

export function dragRefObjectTo(o: RefObject, mx: number, my: number) {
  const p = screenToImg(mx, my, toolState.zoom, toolState.panX, toolState.panY);
  o.ax = p.x; o.ay = p.y; o.bx = p.x; o.by = p.y;
}

export function dragVanishingPointTo(mx: number, my: number) {
  toolState.vanishingPoint = screenToImg(mx, my, toolState.zoom, toolState.panX, toolState.panY);
}
export const imageCenterScreen: ImageCenterScreenFn = () => {
  return {
    x: toolState.panX + (toolState.orientedW / 2) * toolState.zoom,
    y: toolState.panY + (toolState.orientedH / 2) * toolState.zoom,
  };
};
export function toggleRefObjectLock(id: number) {
  const o = toolState.refObjects.find((o) => o.id === id);
  if (!o) return;

  o.locked = !o.locked;
}

export function findNearRefEndpoint(
  mx: number,
  my: number,
): { object: RefObject; endpoint: 'a' | 'b' } | null {
  for (let i = toolState.refObjects.length - 1; i >= 0; i--) {
    const o = toolState.refObjects[i];

    if (o.locked) continue;

    // Horizontal y vertical tienen un único punto de anclaje.
    if (o.type === 'h' || o.type === 'v') {
      const ax = o.ax * toolState.zoom + toolState.panX;
      const ay = o.ay * toolState.zoom + toolState.panY;

      if (Math.hypot(ax - mx, ay - my) < 10) {
        return {
          object: o,
          endpoint: 'a',
        };
      }

      continue;
    }

    // Custom y edge tienen dos puntos de control.
    if (o.type !== 'custom' && o.type !== 'edge') continue;

    const ax = o.ax * toolState.zoom + toolState.panX;
    const ay = o.ay * toolState.zoom + toolState.panY;

    if (Math.hypot(ax - mx, ay - my) < 10) {
      return {
        object: o,
        endpoint: 'a',
      };
    }

    const bx = o.bx * toolState.zoom + toolState.panX;
    const by = o.by * toolState.zoom + toolState.panY;

    if (Math.hypot(bx - mx, by - my) < 10) {
      return {
        object: o,
        endpoint: 'b',
      };
    }
  }

  return null;
}

export function dragRefEndpointTo(
  o: RefObject,
  endpoint: 'a' | 'b',
  mx: number,
  my: number,
) {
  const p = screenToImg(
    mx,
    my,
    toolState.zoom,
    toolState.panX,
    toolState.panY,
  );

  // Las líneas horizontales tienen un solo dato relevante:
  // su posición Y. El punto de anclaje se mueve solamente en vertical.
  if (o.type === 'h') {
    o.ay = p.y;
    o.by = p.y;
    return;
  }

  // Las líneas verticales tienen un solo dato relevante:
  // su posición X. El punto de anclaje se mueve solamente en horizontal.
  if (o.type === 'v') {
    o.ax = p.x;
    o.bx = p.x;
    return;
  }

  // Custom y edge conservan sus dos extremos independientes.
  if (endpoint === 'a') {
    o.ax = p.x;
    o.ay = p.y;
  } else {
    o.bx = p.x;
    o.by = p.y;
  }
}

export function dragRefObjectAsWhole(
  o: RefObject,
  startA: Point,
  startB: Point,
  dxScreen: number,
  dyScreen: number,
) {
  const dx = dxScreen / toolState.zoom;
  const dy = dyScreen / toolState.zoom;

  o.ax = startA.x + dx;
  o.ay = startA.y + dy;

  o.bx = startB.x + dx;
  o.by = startB.y + dy;
}
