// scale.svelte.ts
import type { ScaleDim, Unit } from "../types";
import { toolState } from "./state.svelte";
import { transformState } from "./transform.svelte";

// ---------------------------------------------------------------
// Scale
// ---------------------------------------------------------------

function contentDims(): { w: number; h: number } {
  return {
    w: toolState.file.naturalW,
    h: toolState.file.naturalH,
  };
}


export function updateScale() {
  if (!toolState.file.image) return;

  const { w, h } = contentDims();

  const dimPx =
    toolState.scale.scaleDim === "width"
      ? w
      : h;

  toolState.scale.pxPerUnit =
    dimPx / toolState.scale.scaleValue;
}

export function otherDimensionLabel(): string {
  if (!toolState.file.image) return "—";

  const { w, h } = contentDims();

  const otherDimPx =
    toolState.scale.scaleDim === "width"
      ? h
      : w;

  const otherVal =
    otherDimPx / toolState.scale.pxPerUnit;

  const label =
    toolState.scale.scaleDim === "width"
      ? "Alto"
      : "Ancho";

  return `${label} ≈ ${Math.round(otherVal * 100) / 100} ${toolState.scale.unit}`;
}

export function setScaleDim(dim: ScaleDim) {
  toolState.scale.scaleDim = dim;
  updateScale();
}

export function setScaleValue(v: number) {
  if (v > 0) {
    toolState.scale.scaleValue = v;
    updateScale();
  }
}

export function setScaleUnit(newUnit: Unit) {
  if (newUnit === toolState.scale.unit) return;

  if (newUnit === "mm" && toolState.scale.unit === "cm") {
    toolState.scale.scaleValue *= 10;
  }

  if (newUnit === "cm" && toolState.scale.unit === "mm") {
    toolState.scale.scaleValue /= 10;
  }

  toolState.scale.unit = newUnit;
  updateScale();
}