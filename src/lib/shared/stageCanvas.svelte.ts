// stageCanvas.svelte.ts

import type { RefObject } from "../types";

export const dragging = $state({
  isDragging: false,
  vanishingPoint: false,

  refObj: null as RefObject | null,
  refEndpoint: null as 'a' | 'b' | null,

  // 'endpoint' = mover solamente el punto seleccionado.
  // 'translate' = mover todo el objeto conservando su geometría.
  refMoveMode: null as 'endpoint' | 'translate' | null,

  // Posiciones originales de los extremos al comenzar el drag.
  // Se usan para trasladar el objeto completo sin acumular error.
  refStartA: { x: 0, y: 0 },
  refStartB: { x: 0, y: 0 },

  handle: false,

  startX: 0,
  startY: 0,
  moved: false,
});

export const showRefNames = $state({
  value: false,
});

export const panStart = $state({
    x:0,y:0
  });
export const fileInput = $state({
  value: null as HTMLInputElement | null
});

export const coordsText = $state({
  x: "—",
  y: "—",
});

export const rulerCanvas = $state({
  top: null as HTMLCanvasElement | null,
  left: null as HTMLCanvasElement | null,

});

export const isPanning = $state({ value: false as boolean });

export const hoverTarget = $state({ value: false as boolean });

export const draggingHandle = $state({ value: false as boolean });

export const mainCanvas = $state({ value: null as HTMLCanvasElement | null});
export const canvasArea = $state({ value: null as  HTMLDivElement | null});