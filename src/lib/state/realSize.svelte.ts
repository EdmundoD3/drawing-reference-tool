// state/realSize.svelte.ts

import { BASE_PX_PER_MM, calibrationState } from "./calibration.svelte";
import { toolState } from "./state.svelte";
import { transformState } from "./transform.svelte";

export function truePxPerUnit(): number {
  const basePxPerUnit =
    toolState.scale.unit === "cm"
      ? BASE_PX_PER_MM * 10
      : BASE_PX_PER_MM;

  return (
    basePxPerUnit *
    calibrationState.calibrationFactor
  );
}

export function applyRealSizeZoom(
  viewportW?: number,
  viewportH?: number
) {
  if (!transformState.oriented) return;

  const targetZoom =
    truePxPerUnit() /
    toolState.scale.pxPerUnit;

  const w = viewportW ?? 0;
  const h = viewportH ?? 0;

  const cx = w / 2;
  const cy = h / 2;

  const imgX =
    (cx - toolState.view.panX) /
    toolState.view.zoom;

  const imgY =
    (cy - toolState.view.panY) /
    toolState.view.zoom;

  toolState.view.zoom = targetZoom;

  toolState.view.panX =
    cx - imgX * toolState.view.zoom;

  toolState.view.panY =
    cy - imgY * toolState.view.zoom;
}

export function toggleRealSize(
  viewportW: number,
  viewportH: number
) {
  if (!transformState.oriented) return;

  toolState.view.realSizeActive =
    !toolState.view.realSizeActive;

  if (toolState.view.realSizeActive) {
    toolState.view.savedZoom =
      toolState.view.zoom;

    toolState.view.savedPanX =
      toolState.view.panX;

    toolState.view.savedPanY =
      toolState.view.panY;

    applyRealSizeZoom(viewportW, viewportH);
  } else {
    toolState.view.zoom =
      toolState.view.savedZoom;

    toolState.view.panX =
      toolState.view.savedPanX;

    toolState.view.panY =
      toolState.view.savedPanY;
  }
}