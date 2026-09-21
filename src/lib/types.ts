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

type FileState = {
    image: HTMLImageElement | null;
    naturalW: number;
    naturalH: number;
    fileName: string;
};

type ScaleState = {
    scaleDim: ScaleDim;
    scaleValue: number;
    unit: Unit;
    pxPerUnit: number;
};

type ViewState = {
    zoom: number;
    panX: number;
    panY: number;
    realSizeActive: boolean;
    savedZoom: number;
    savedPanX: number;
    savedPanY: number;
};

type ToolsState = {
    showGrid: boolean;
    showRulerTop: boolean;
    showRulerLeft: boolean;
    gridRows: number;
    gridCols: number;
    goldenMode: GoldenMode;
    activeTool: Tool;
    pendingPoint: Point | null;
    hoverPoint: Point | null;
    measurements: Measurement[];
    refObjects: RefObject[];
    typeCounters: Record<RefObjectType, number>;
    vanishingPoint: Point | null;
    vpRays: VanishingRay[];
    nextId: number;
};

export type ToolState = {
    file: FileState;
    scale: ScaleState;
    view: ViewState;
    tools: ToolsState;
};

export interface ProjectFile {
  version: 1;

  image: string;

  scaleDim: ScaleDim;
  scaleValue: number;
  unit: Unit;

  gridRows: number;
  gridCols: number;
  showGrid: boolean;
  showRulerTop: boolean;
  showRulerLeft: boolean;

  goldenMode: GoldenMode;

  measurements: Measurement[];
  refObjects: RefObject[];

  vanishingPoint: Point | null;
  vpRays: VanishingRay[];

  nextId: number;
}
