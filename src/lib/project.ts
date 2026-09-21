// project.ts
import { APP_NAME } from './constants';
import {
  drawGoldenRatio,
  drawGrid,
  drawMeasurements,
  drawReferenceObjects,
  drawVanishingPoint,
} from './draw';
import {
  loadImageFromDataUrl,
  rebuildOriented,
} from './state/image.svelte';
import {
  DEFAULT_REF_COLOR,
  toolState,
} from './state/state.svelte';
import { transformState } from './state/transform.svelte';
import { LINE_TYPE_LABEL } from './types';
import type { ProjectFile, RefObjectType } from './types';


function projectFileName(imageName: string): string {
  const dot = imageName.lastIndexOf('.');
  const baseName =
    dot > 0
      ? imageName.slice(0, dot)
      : imageName;

  return `${baseName}.json`;
}

export function saveProject() {
  if (!toolState.file.image) {
    alert('Carga una imagen primero.');
    return;
  }

  const tmp = document.createElement('canvas');
  tmp.width = toolState.file.naturalW;
  tmp.height = toolState.file.naturalH;
  tmp.getContext('2d')!.drawImage(toolState.file.image, 0, 0);

  const project: ProjectFile = {
    version: 1,
    image: tmp.toDataURL('image/png'),
    imageName: toolState.file.originalFileName,

    scaleDim: toolState.scale.scaleDim,
    scaleValue: toolState.scale.scaleValue,
    unit: toolState.scale.unit,

    gridRows: toolState.tools.gridRows,
    gridCols: toolState.tools.gridCols,
    showGrid: toolState.tools.showGrid,
    showRulerTop: toolState.tools.showRulerTop,
    showRulerLeft: toolState.tools.showRulerLeft,
    goldenMode: toolState.tools.goldenMode,
    measurements: toolState.tools.measurements,
    refObjects: toolState.tools.refObjects,
    vanishingPoint: toolState.tools.vanishingPoint,
    vpRays: toolState.tools.vpRays,
    nextId: toolState.tools.nextId,
  };

  const blob = new Blob(
    [JSON.stringify(project)],
    { type: 'application/json' },
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = projectFileName(
    toolState.file.originalFileName
  );
  a.click();

  URL.revokeObjectURL(url);
}

export function loadProject(file: File, onDone: () => void) {
  const reader = new FileReader();

  reader.onload = () => {
    let p: ProjectFile;

    try {
      p = JSON.parse(reader.result as string);
    } catch {
      alert('No se pudo abrir el proyecto: archivo inválido.');
      return;
    }

    if (
      !p ||
      typeof p !== 'object' ||
      p.version !== 1 ||
      typeof p.image !== 'string' ||
      typeof p.imageName !== 'string'
    ) {
      alert('El archivo no es un proyecto compatible.');
      return;
    }


    loadImageFromDataUrl(
      p.image,
      p.imageName,
      () => {
        toolState.scale.scaleDim = p.scaleDim || 'width';
        toolState.scale.scaleValue = p.scaleValue || 14.5;
        toolState.scale.unit = p.unit || 'cm';

        toolState.tools.gridRows = p.gridRows || 10;
        toolState.tools.gridCols = p.gridCols || 10;
        toolState.tools.showGrid = p.showGrid !== false;
        toolState.tools.showRulerTop = p.showRulerTop !== false;
        toolState.tools.showRulerLeft = p.showRulerLeft !== false;
        toolState.tools.goldenMode = p.goldenMode || 'none';

        toolState.tools.measurements =
          p.measurements || [];

        const counters: Record<RefObjectType, number> = {
          h: 0,
          v: 0,
          edge: 0,
          custom: 0,
          point: 0,
        };

        toolState.tools.refObjects =
          (p.refObjects || []).map((o) => {
            counters[o.type] =
              (counters[o.type] || 0) + 1;

            return {
              ...o,
              name:
                o.name ||
                `${LINE_TYPE_LABEL[o.type]} ${counters[o.type]}`,
              locked: o.locked ?? false,
              color: o.color ?? DEFAULT_REF_COLOR,
            };
          });

        toolState.tools.typeCounters = counters;

        toolState.tools.vanishingPoint =
          p.vanishingPoint || null;

        toolState.tools.vpRays =
          p.vpRays || [];

        const maxId = Math.max(
          0,
          ...toolState.tools.measurements.map((m) => m.id),
          ...toolState.tools.refObjects.map((o) => o.id),
          ...toolState.tools.vpRays.map((r) => r.id),
        );

        toolState.tools.nextId = Math.max(
          p.nextId ?? 1,
          maxId + 1,
        );

        toolState.view.realSizeActive = false;
        toolState.tools.pendingPoint = null;
        toolState.tools.hoverPoint = null;
        toolState.tools.activeTool = null;

        rebuildOriented();
        onDone();
      },
    );
  };

  reader.readAsText(file);
}

/** Flattens the image plus every active overlay into a single PNG at full resolution. */
export function exportPng() {
  if (!transformState.oriented) {
    alert('Carga una imagen primero.');
    return;
  }

  const W = transformState.orientedW;
  const H = transformState.orientedH;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    transformState.oriented,
    0,
    0,
  );

  if (toolState.tools.showGrid) {
    drawGrid(
      ctx,
      W,
      H,
      W,
      H,
      1,
      0,
      0,
      toolState.tools.gridRows,
      toolState.tools.gridCols,
    );
  }

  drawGoldenRatio(
    ctx,
    toolState.tools.goldenMode,
    W,
    H,
    1,
    0,
    0,
  );

  drawReferenceObjects(
    ctx,
    toolState.tools.refObjects,
    toolState.file.naturalW,
    toolState.file.naturalH,
    1,
    0,
    0,
    false,
  );

  drawVanishingPoint(
    ctx,
    toolState.tools.vanishingPoint,
    toolState.tools.vpRays,
    W,
    H,
    1,
    0,
    0,
  );

  drawMeasurements(
    ctx,
    toolState.tools.measurements,
    toolState.scale.pxPerUnit,
    toolState.scale.unit,
    1,
    0,
    0,
    null,
    null,
    false,
  );

  // Scale caption
  // Rulers aren't baked in, but the reference measurement is.
  const label =
    `Escala — ${toolState.scale.scaleDim === 'width'
      ? 'ancho'
      : 'alto'
    }: ${toolState.scale.scaleValue
    } ${toolState.scale.unit
    }`;

  ctx.font =
    `600 ${Math.max(14, Math.round(W * 0.014))}px sans-serif`;

  const pad =
    Math.max(8, Math.round(W * 0.006));

  const tw =
    ctx.measureText(label).width;

  ctx.fillStyle =
    'rgba(11,18,28,0.75)';

  ctx.fillRect(
    pad,
    H - pad * 3 - 18,
    tw + pad * 2,
    pad * 2 + 18,
  );

  ctx.fillStyle = '#E9E4D8';
  ctx.textBaseline = 'top';

  ctx.fillText(
    label,
    pad * 2,
    H - pad * 3 + pad - 4,
  );

  canvas.toBlob((blob) => {
    if (!blob) return;

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement('a');

    a.href = url;

    const dot =
      toolState.file.originalFileName.lastIndexOf('.');

    const baseName =
      dot > 0
        ? toolState.file.originalFileName.slice(0, dot)
        : toolState.file.originalFileName;

    a.download =
      `${baseName} · ${APP_NAME}.png`;

    a.click();

    URL.revokeObjectURL(url);
  });
}
