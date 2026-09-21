// transform.svelte.ts
export type TransformState = {
  rotation: number;
  scaleX: number;
  scaleY: number;

  oriented: HTMLCanvasElement | null;
  orientedW: number;
  orientedH: number;
};

export const transformDefault: TransformState = {
  rotation: 0,
  scaleX: 1,
  scaleY: 1,

  oriented: null,
  orientedW: 0,
  orientedH: 0,
};

export const transformState: TransformState = $state({
  ...transformDefault,
});

export function cleanTransform(): void {
  transformState.rotation = transformDefault.rotation;
  transformState.scaleX = transformDefault.scaleX;
  transformState.scaleY = transformDefault.scaleY;

  transformState.oriented = transformDefault.oriented;
  transformState.orientedW = transformDefault.orientedW;
  transformState.orientedH = transformDefault.orientedH;
}