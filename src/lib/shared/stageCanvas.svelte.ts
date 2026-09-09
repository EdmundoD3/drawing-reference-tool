// stageCanvas.svelte.ts
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