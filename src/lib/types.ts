export interface Point {
  x: number;
  y: number;
}

export type RefObjectType = 'h' | 'v' | 'edge' | 'custom' | 'point';

export interface RefObject {
  id: number;
  type: RefObjectType;
  name: string;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  locked: boolean;
  color: string;
}

export interface Measurement {
  id: number;
  ax: number; ay: number;
  bx: number; by: number;
}

export interface VanishingRay {
  id: number;
  x: number;
  y: number;
}

export type Tool =
  | null
  | 'measure'
  | 'line-h'
  | 'line-v'
  | 'line-edge'
  | 'line-custom'
  | 'point'
  | 'vp-place'
  | 'vp-ray';

export type Unit = 'cm' | 'mm';
export type ScaleDim = 'width' | 'height';
export type GoldenMode = 'none' | 'vertical' | 'horizontal' | 'both' | 'spiral';

export const LINE_TYPE_LABEL: Record<RefObjectType, string> = {
  h: 'Horizontal',
  v: 'Vertical',
  edge: 'Extremo a extremo',
  custom: 'Personalizada',
  point: 'Punto',
};

export interface Arc {
  cx: number; cy: number; r: number;
  startAngle: number; endAngle: number; ccw: boolean;
}

export interface ProjectFile {
  version: 1;
  image: string;
  rotation: number;
  freeAngle?: number;
  flipH: boolean;
  flipV: boolean;
  scaleDim: ScaleDim;
  scaleValue: number;
  unit: Unit;
  gridRows: number;
  gridCols: number;
  showGrid: boolean;
  showRulerTop: boolean;
  showRulerLeft: boolean;
  goldenMode: GoldenMode;
  calibrationFactor: number;
  measurements: Measurement[];
  refObjects: RefObject[];
  vanishingPoint: Point | null;
  vpRays: VanishingRay[];
  nextId: number;
}
