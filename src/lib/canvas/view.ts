// canvas/view.ts
// ---------------------------------------------------------------
// Zoom / pan
// ---------------------------------------------------------------

import { clamp } from "../geometry";
import { applyRealSizeZoom } from "../state/realSize.svelte";
import { toolState } from "../state/state.svelte";
import { transformState } from "../state/transform.svelte";


export function setZoom(
  newZoom: number,
  aboutX: number,
  aboutY: number
) {
  if (toolState.view.realSizeActive) return;

  newZoom = clamp(newZoom, 0.02, 40);

  const imgX =
    (aboutX - toolState.view.panX) /
    toolState.view.zoom;

  const imgY =
    (aboutY - toolState.view.panY) /
    toolState.view.zoom;

  toolState.view.zoom = newZoom;

  toolState.view.panX =
    aboutX - imgX * newZoom;

  toolState.view.panY =
    aboutY - imgY * newZoom;
}

export function fitToScreen(
  viewportW: number,
  viewportH: number
) {
  if (!transformState.oriented) return;

  const margin = 0.92;

  const z =
    Math.min(
      viewportW / transformState.orientedW,
      viewportH / transformState.orientedH
    ) * margin;

  toolState.view.zoom = clamp(z, 0.02, 40);

  toolState.view.panX =
    (viewportW -
      transformState.orientedW * toolState.view.zoom) / 2;

  toolState.view.panY =
    (viewportH -
      transformState.orientedH * toolState.view.zoom) / 2;

  if (toolState.view.realSizeActive) {
    applyRealSizeZoom(viewportW, viewportH);
  }
}