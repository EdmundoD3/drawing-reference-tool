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
export const TOOL_NAMES: Record<Exclude<Tool, null>, string> = {
  'measure': 'Medir',
  'line-h': 'Línea H',
  'line-v': 'Línea V',
  'line-edge': 'Línea borde',
  'line-custom': 'Línea',
  'point': 'Punto',
  'vp-place': 'Punto de fuga',
  'vp-ray': 'Línea de fuga',
};

