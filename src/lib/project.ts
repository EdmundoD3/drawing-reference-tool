import { drawGoldenRatio, drawGrid, drawMeasurements, drawReferenceObjects, drawVanishingPoint } from './draw';
import { rebuildOriented, loadImageFromDataUrl, toolState } from './state.svelte';
import { LINE_TYPE_LABEL } from './types';
import type { ProjectFile, RefObjectType } from './types';

export function saveProject() {
  if (!toolState.image) { alert('Carga una imagen primero.'); return; }
  const tmp = document.createElement('canvas');
  tmp.width = toolState.naturalW; tmp.height = toolState.naturalH;
  tmp.getContext('2d')!.drawImage(toolState.image, 0, 0);

  const project: ProjectFile = {
    version: 1,
    image: tmp.toDataURL('image/png'),
    rotation: toolState.rotation, freeAngle: toolState.freeAngle, flipH: toolState.flipH, flipV: toolState.flipV,
    scaleDim: toolState.scaleDim, scaleValue: toolState.scaleValue, unit: toolState.unit,
    gridRows: toolState.gridRows, gridCols: toolState.gridCols,
    showGrid: toolState.showGrid, showRulerTop: toolState.showRulerTop, showRulerLeft: toolState.showRulerLeft,
    goldenMode: toolState.goldenMode,
    calibrationFactor: toolState.calibrationFactor,
    measurements: toolState.measurements,
    refObjects: toolState.refObjects,
    vanishingPoint: toolState.vanishingPoint,
    vpRays: toolState.vpRays,
  };
  const blob = new Blob([JSON.stringify(project)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'proyecto-referencias.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function loadProject(file: File, onDone: () => void) {
  const reader = new FileReader();
  reader.onload = () => {
    let p: ProjectFile;
    try { p = JSON.parse(reader.result as string); }
    catch { alert('No se pudo abrir el proyecto: archivo inválido.'); return; }
    if (!p.image) { alert('El archivo no contiene una imagen de proyecto válida.'); return; }

    loadImageFromDataUrl(p.image, 'Proyecto cargado', () => {
      toolState.rotation = p.rotation || 0;
      toolState.freeAngle = p.freeAngle || 0;
      toolState.flipH = !!p.flipH; toolState.flipV = !!p.flipV;
      toolState.scaleDim = p.scaleDim || 'width';
      toolState.scaleValue = p.scaleValue || 14.5;
      toolState.unit = p.unit || 'cm';
      toolState.gridRows = p.gridRows || 10; toolState.gridCols = p.gridCols || 10;
      toolState.showGrid = p.showGrid !== false;
      toolState.showRulerTop = p.showRulerTop !== false;
      toolState.showRulerLeft = p.showRulerLeft !== false;
      toolState.goldenMode = p.goldenMode || 'none';
      toolState.calibrationFactor = p.calibrationFactor || 1;
      toolState.measurements = p.measurements || [];

      const counters: Record<RefObjectType, number> = { h: 0, v: 0, edge: 0, custom: 0, point: 0 };
      toolState.refObjects = (p.refObjects || []).map((o) => {
        counters[o.type] = (counters[o.type] || 0) + 1;
        return { ...o, name: o.name || `${LINE_TYPE_LABEL[o.type]} ${counters[o.type]}` };
      });
      toolState.typeCounters = counters;
      toolState.vanishingPoint = p.vanishingPoint || null;
      toolState.vpRays = p.vpRays || [];
      toolState.realSizeActive = false;
      toolState.pendingPoint = null;
      toolState.activeTool = null;

      rebuildOriented();
      onDone();
    });
  };
  reader.readAsText(file);
}

/** Flattens the image plus every active overlay into a single PNG at full resolution. */
export function exportPng() {
  if (!toolState.oriented) { alert('Carga una imagen primero.'); return; }
  const W = toolState.orientedW, H = toolState.orientedH;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(toolState.oriented, 0, 0);
  if (toolState.showGrid) drawGrid(ctx, W, H, W, H, 1, 0, 0, toolState.gridRows, toolState.gridCols);
  drawGoldenRatio(ctx, toolState.goldenMode, W, H, 1, 0, 0);
  drawReferenceObjects(ctx, toolState.refObjects, W, H, 1, 0, 0);
  drawVanishingPoint(ctx, toolState.vanishingPoint, toolState.vpRays, W, H, 1, 0, 0);
  drawMeasurements(ctx, toolState.measurements, toolState.pxPerUnit, toolState.unit, 1, 0, 0, null, null, false);

  // scale caption (rulers aren't baked in, but the reference measurement is)
  const label = `Escala — ${toolState.scaleDim === 'width' ? 'ancho' : 'alto'}: ${toolState.scaleValue} ${toolState.unit}`;
  ctx.font = `600 ${Math.max(14, Math.round(W * 0.014))}px sans-serif`;
  const pad = Math.max(8, Math.round(W * 0.006));
  const tw = ctx.measureText(label).width;
  ctx.fillStyle = 'rgba(11,18,28,0.75)';
  ctx.fillRect(pad, H - pad*3 - 18, tw + pad*2, pad*2 + 18);
  ctx.fillStyle = '#E9E4D8';
  ctx.textBaseline = 'top';
  ctx.fillText(label, pad*2, H - pad*3 + pad - 4);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'referencia-exportada.png';
    a.click();
    URL.revokeObjectURL(url);
  });
}
