// canvas/coordinates.ts
import type { Point } from "../types";
import { transformState, type TransformState } from "../state/transform.svelte";
import type { ImageCenterScreenFn } from "../interfaces/stageCanvas.interfaces";
import { toolState } from "../state/state.svelte";

/**
 * Convierte un punto de pantalla a coordenadas ORIGINALES.
 *
 * Flujo inverso:
 *
 * pantalla
 *   ↓ quitar pan/zoom
 * oriented
 *   ↓ invertir rotación/escala
 * original
 */
export function screenToOriginal(
  mx: number,
  my: number,
): Point {
  const { zoom, panX, panY } = toolState.view;

  const { orientedW, orientedH } = transformState;

  const naturalW = toolState.file.naturalW;
  const naturalH = toolState.file.naturalH;

  // Pantalla → coordenadas oriented.
  const x =
    (mx - panX) / zoom;

  const y =
    (my - panY) / zoom;

  // Trasladar el origen al centro de la imagen oriented.
  const dx =
    x - orientedW / 2;

  const dy =
    y - orientedH / 2;

  // Invertir la rotación.
  const rad =
    (-transformState.rotation * Math.PI) / 180;

  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const rotatedX =
    dx * cos -
    dy * sin;

  const rotatedY =
    dx * sin +
    dy * cos;

  // Invertir escala / flip.
  const originalX =
    rotatedX / transformState.scaleX;

  const originalY =
    rotatedY / transformState.scaleY;

  return {
    x: originalX + naturalW / 2,
    y: originalY + naturalH / 2,
  };
}
export function transformPoint(
  point: Point,
  transform: TransformState,
  width: number,
  height: number,
): Point {
  const centerX = width / 2;
  const centerY = height / 2;

  // Llevar el punto al centro de la imagen original.
  let x = point.x - centerX;
  let y = point.y - centerY;

  // Aplicar escala / flip.
  x *= transform.scaleX;
  y *= transform.scaleY;

  // Aplicar rotación.
  const rad = (transform.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const rotatedX = x * cos - y * sin;
  const rotatedY = x * sin + y * cos;

  // Llevar el punto al centro del canvas transformado.
  return {
    x: rotatedX + transform.orientedW / 2,
    y: rotatedY + transform.orientedH / 2,
  };
}

export const imageCenterScreen: ImageCenterScreenFn = () => {
  return {
    x:
      toolState.view.panX +
      (transformState.orientedW / 2) *
      toolState.view.zoom,

    y:
      toolState.view.panY +
      (transformState.orientedH / 2) *
      toolState.view.zoom,
  };
};