
// ---------------------------------------------------------------
// Image loading & orientation
// state/image.svelte.ts
// ---------------------------------------------------------------
import { updateScale } from "./scale.svelte";
import { freshTypeCounters, toolState } from "./state.svelte";
import { cleanTransform, transformState } from "./transform.svelte";

// ---------------------------------------------------------------

export function loadImageFile(file: File, onReady?: () => void) {
  if (!file || !/^image\/(png|jpe?g|webp)$/.test(file.type)) return;

  const url = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    toolState.file.image = img;
    toolState.file.originalFileName = file.name;
    toolState.file.naturalW = img.naturalWidth;
    toolState.file.naturalH = img.naturalHeight;

    toolState.file.fileName =
      `${file.name}  ·  ${img.naturalWidth}×${img.naturalHeight} px`;

    resetForNewImage();
    rebuildOriented();

    URL.revokeObjectURL(url);
    onReady?.();
  };

  img.src = url;
}


export function loadImageFromDataUrl(
  dataUrl: string,
  fileName: string,
  onReady: () => void
) {
  const img = new Image();

  img.onload = () => {
    toolState.file.image = img;
    toolState.file.naturalW = img.naturalWidth;
    toolState.file.naturalH = img.naturalHeight;

    toolState.file.originalFileName = fileName;
    toolState.file.fileName =
      `${fileName}  ·  ${img.naturalWidth}×${img.naturalHeight} px`;

    cleanTransform();

    onReady();
  };

  img.src = dataUrl;
}


function resetForNewImage() {
  cleanTransform();

  toolState.tools.measurements = [];
  toolState.tools.pendingPoint = null;
  toolState.tools.refObjects = [];
  toolState.tools.vanishingPoint = null;
  toolState.tools.vpRays = [];
  toolState.tools.typeCounters = freshTypeCounters();

  toolState.view.realSizeActive = false;
  toolState.tools.activeTool = null;
}

/**
 * Rebuilds the oriented offscreen bitmap after transform changes.
 */
export function rebuildOriented() {
  if (!toolState.file.image) return;

  const rad =
    (transformState.rotation * Math.PI) / 180;

  const nw = toolState.file.naturalW;
  const nh = toolState.file.naturalH;

  // El tamaño de la imagen después de aplicar escala y rotación.
  const scaledW =
    nw * Math.abs(transformState.scaleX);

  const scaledH =
    nh * Math.abs(transformState.scaleY);

  const w = Math.max(
    1,
    Math.round(
      Math.abs(scaledW * Math.cos(rad)) +
      Math.abs(scaledH * Math.sin(rad))
    )
  );

  const h = Math.max(
    1,
    Math.round(
      Math.abs(scaledW * Math.sin(rad)) +
      Math.abs(scaledH * Math.cos(rad))
    )
  );

  const off = document.createElement("canvas");

  off.width = w;
  off.height = h;

  const octx = off.getContext("2d")!;

  octx.save();

  // Centro del canvas resultante.
  octx.translate(w / 2, h / 2);

  // Rotación.
  octx.rotate(rad);

  // Escala / flip.
  octx.scale(
    transformState.scaleX,
    transformState.scaleY,
  );

  // Imagen centrada.
  octx.drawImage(
    toolState.file.image,
    -nw / 2,
    -nh / 2,
  );

  octx.restore();

  transformState.oriented = off;
  transformState.orientedW = w;
  transformState.orientedH = h;

  updateScale();
}


export function rotate(delta: 90 | -90) {
  if (!toolState.file.image) return;

  transformState.rotation =
    (transformState.rotation + delta + 360) % 360;

  rebuildOriented();
}

export function flipHorizontal() {
  if (!toolState.file.image) return;

  transformState.scaleX *= -1;

  rebuildOriented();
}

export function flipVertical() {
  if (!toolState.file.image) return;

  transformState.scaleY *= -1;

  rebuildOriented();
}

export function resetTransform() {
  if (!toolState.file.image) return;

  cleanTransform();

  rebuildOriented();
}

export function setRotation(deg: number) {
  if (!toolState.file.image) return;

  const oldW = transformState.orientedW;
  const oldH = transformState.orientedH;

  const centerScreenX =
    toolState.view.panX +
    (oldW / 2) * toolState.view.zoom;

  const centerScreenY =
    toolState.view.panY +
    (oldH / 2) * toolState.view.zoom;

  transformState.rotation = deg;

  rebuildOriented();

  toolState.view.panX =
    centerScreenX -
    (transformState.orientedW / 2) * toolState.view.zoom;

  toolState.view.panY =
    centerScreenY -
    (transformState.orientedH / 2) * toolState.view.zoom;
}