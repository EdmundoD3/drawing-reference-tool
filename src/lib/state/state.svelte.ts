
import type {
  GoldenMode, Measurement, Point, RefObject, RefObjectType, ScaleDim, Tool, ToolState, Unit, VanishingRay,
} from '../types';

export const DEFAULT_REF_COLOR = '#808080';

export function freshTypeCounters(): Record<RefObjectType, number> {
  return {
    h: 0,
    v: 0,
    edge: 0,
    custom: 0,
    point: 0,
  };
}

export const toolState = $state({
  file: {
    image: null as HTMLImageElement | null,
    naturalW: 0,
    naturalH: 0,
    fileName: '',
    originalFileName: '',
  },
  scale: {
    scaleDim: 'width' as ScaleDim,
    scaleValue: 14.5,
    unit: 'cm' as Unit,
    pxPerUnit: 1,
  },

  view: {
    zoom: 1,
    panX: 0,
    panY: 0,

    realSizeActive: false,

    savedZoom: 1,
    savedPanX: 0,
    savedPanY: 0,
  },

  tools: {
    showGrid: true,
    showRulerTop: true,
    showRulerLeft: true,
    gridRows: 10,
    gridCols: 10,

    goldenMode: 'none' as GoldenMode,

    activeTool: null as Tool,
    pendingPoint: null as Point | null,
    hoverPoint: null as Point | null,

    measurements: [] as Measurement[],
    refObjects: [] as RefObject[],
    typeCounters: freshTypeCounters(),

    vanishingPoint: null as Point | null,
    vpRays: [] as VanishingRay[],

    nextId: 1,
  },
} as ToolState);
