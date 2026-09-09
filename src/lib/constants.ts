import type { Tool } from "./types";

export const TOOL_HINTS: Record<Exclude<Tool, null>, string> = {
  'measure': 'Clic para el punto A, luego el punto B',
  'line-h': 'Clic para colocar una línea horizontal',
  'line-v': 'Clic para colocar una línea vertical',
  'line-edge': 'Clic en dos puntos — la línea se extiende a los bordes de la imagen',
  'line-custom': 'Clic para el punto A, luego el punto B',
  'point': 'Clic para colocar un punto',
  'vp-place': 'Clic para colocar el punto de fuga',
  'vp-ray': 'Clic para añadir una línea desde el punto de fuga',
};

const BASE_PX_PER_MM = 96 / 25.4; // CSS reference pixel assumption (96dpi)
export { BASE_PX_PER_MM };