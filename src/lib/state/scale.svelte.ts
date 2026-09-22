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

export type ScalePreset = {
  label: string;
  valueCm: number;
  icon?: "horizontal" | "vertical";
};

export function scalePresets(): ScalePreset[] {
  return [
    {
      label: "Bolsillo",
      valueCm: 9,
    },

    {
      label: "A6",
      valueCm: 10.5,
      icon: "horizontal",
    },
    {
      label: "A6",
      valueCm: 14.8,
      icon: "vertical",
    },

    {
      label: "A5",
      valueCm: 14.8,
      icon: "horizontal",
    },
    {
      label: "A5",
      valueCm: 21,
      icon: "vertical",
    },

    {
      label: "A4",
      valueCm: 21,
      icon: "horizontal",
    },
    {
      label: "A4",
      valueCm: 29.7,
      icon: "vertical",
    },

    {
      label: "A3",
      valueCm: 29.7,
      icon: "horizontal",
    },
    {
      label: "A3",
      valueCm: 42,
      icon: "vertical",
    },
  ];
}

export function presetValue(preset: ScalePreset): number {
  return toolState.scale.unit === "cm"
    ? preset.valueCm
    : preset.valueCm * 10;
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

// ---------------- STORAGE ---------------------

const SCALE_STORAGE_KEY = "drawing-reference-tool-scale";

type SavedScale = {
  scaleDim: ScaleDim;
  scaleValue: number;
  unit: Unit;
};

export function saveScale(): void {
  const saved: SavedScale = {
    scaleDim: toolState.scale.scaleDim,
    scaleValue: toolState.scale.scaleValue,
    unit: toolState.scale.unit,
  };

  localStorage.setItem(
    SCALE_STORAGE_KEY,
    JSON.stringify(saved),
  );
}

export function loadSavedScale(): boolean {
  const raw = localStorage.getItem(SCALE_STORAGE_KEY);

  if (!raw) return false;

  try {
    const saved = JSON.parse(raw) as SavedScale;

    if (
      (saved.scaleDim !== "width" &&
        saved.scaleDim !== "height") ||
      typeof saved.scaleValue !== "number" ||
      !Number.isFinite(saved.scaleValue) ||
      saved.scaleValue <= 0 ||
      (saved.unit !== "cm" &&
        saved.unit !== "mm")
    ) {
      return false;
    }

    toolState.scale.scaleDim = saved.scaleDim;
    toolState.scale.scaleValue = saved.scaleValue;
    toolState.scale.unit = saved.unit;

    updateScale();

    return true;
  } catch {
    return false;
  }
}

export function setScaleDim(dim: ScaleDim) {
  toolState.scale.scaleDim = dim;
  updateScale();
  saveScale();
}

export function setScaleValue(v: number) {
  if (v > 0) {
    toolState.scale.scaleValue = v;
    updateScale();
    saveScale();
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
  saveScale();
}
