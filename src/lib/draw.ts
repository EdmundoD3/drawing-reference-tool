import { transformPoint } from './canvas/coordinates';
import { buildGoldenSpiralArcs, clipRay, fmt, measureDist, niceStep, toScreen } from './geometry';
import { toolState } from './state/state.svelte';
import { transformState } from './state/transform.svelte';
import type { GoldenMode, Measurement, Point, RefObject, VanishingRay } from './types';

const FONT = '-apple-system, "Segoe UI", Inter, Helvetica, Arial, sans-serif';

export function drawGrid(
  ctx: CanvasRenderingContext2D, rectW: number, rectH: number,
  w: number, h: number, zoom: number, panX: number, panY: number,
  rows: number, cols: number
) {
  ctx.save();
  ctx.strokeStyle = 'rgba(111,183,201,0.55)';
  ctx.lineWidth = 1;
  for (let i = 1; i < cols; i++) {
    const x = (i / cols) * w * zoom + panX;
    ctx.beginPath();
    ctx.moveTo(x, Math.max(0, panY));
    ctx.lineTo(x, Math.min(rectH, panY + h * zoom));
    ctx.stroke();
  }
  for (let i = 1; i < rows; i++) {
    const y = (i / rows) * h * zoom + panY;
    ctx.beginPath();
    ctx.moveTo(Math.max(0, panX), y);
    ctx.lineTo(Math.min(rectW, panX + w * zoom), y);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawRefLine(
  ctx: CanvasRenderingContext2D,
  sx1: number,
  sy1: number,
  sx2: number,
  sy2: number,
  dashed = false,
  color = '#808080',
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.9;
  ctx.lineWidth = 1.3;

  if (dashed) {
    ctx.setLineDash([6, 4]);
  }

  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();
  ctx.restore();
}

export function drawPointMarker(ctx: CanvasRenderingContext2D, p: Point, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(p.x - 7, p.y); ctx.lineTo(p.x + 7, p.y);
  ctx.moveTo(p.x, p.y - 7); ctx.lineTo(p.x, p.y + 7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function dot(ctx: CanvasRenderingContext2D, p: Point, color: string) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#0B121C';
  ctx.stroke();
}

function drawMeasureLine(ctx: CanvasRenderingContext2D, a: Point, b: Point, label: string, dashed = false) {
  ctx.save();
  ctx.strokeStyle = dashed ? 'rgba(227,139,41,0.7)' : '#E38B29';
  ctx.lineWidth = 1.5;
  if (dashed) ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.setLineDash([]);
  if (!dashed) { dot(ctx, a, '#E38B29'); dot(ctx, b, '#E38B29'); }

  const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
  ctx.font = '600 11.5px ' + FONT;
  const tw = ctx.measureText(label).width;
  ctx.fillStyle = 'rgba(11,18,28,0.85)';
  ctx.fillRect(midX - tw / 2 - 5, midY - 18, tw + 10, 16);
  ctx.fillStyle = '#E9E4D8';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(label, midX, midY - 10);
  ctx.restore();
}

export function drawGoldenRatio(
  ctx: CanvasRenderingContext2D, mode: GoldenMode, W: number, H: number,
  zoom: number, panX: number, panY: number
) {
  if (mode === 'none') return;
  const PHI = 1.6180339887;
  ctx.save();
  ctx.strokeStyle = 'rgba(201,162,75,0.85)';
  ctx.lineWidth = 1.3;

  const ts = (p: Point) => toScreen(p, zoom, panX, panY);

  if (mode === 'vertical' || mode === 'both') {
    [W / PHI, W - W / PHI].forEach(x => {
      const a = ts({ x, y: 0 }), b = ts({ x, y: H });
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });
  }
  if (mode === 'horizontal' || mode === 'both') {
    [H / PHI, H - H / PHI].forEach(y => {
      const a = ts({ x: 0, y }), b = ts({ x: W, y });
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });
  }
  if (mode === 'spiral') {
    const arcs = buildGoldenSpiralArcs(0, 0, W, H, 14);
    arcs.forEach(arc => {
      const c = ts({ x: arc.cx, y: arc.cy });
      ctx.beginPath();
      ctx.arc(c.x, c.y, arc.r * zoom, arc.startAngle, arc.endAngle, arc.ccw);
      ctx.stroke();
    });
  }
  ctx.restore();
}

export function drawReferenceObjects(
  ctx: CanvasRenderingContext2D,
  objects: RefObject[],
  W: number,
  H: number,
  zoom: number,
  panX: number,
  panY: number,
  showNames = false,
) {
  // W/H son las dimensiones ORIGINALES de la imagen.
  const transform = (p: Point) =>
    transformPoint(
      p,
      transformState,
      W,
      H,
    );

  const ts = (p: Point) =>
    toScreen(
      transform(p),
      zoom,
      panX,
      panY,
    );

  objects.forEach((o) => {
    // -------------------------------------------------------------
    // Punto
    // -------------------------------------------------------------
    if (o.type === 'point') {
      drawPointMarker(
        ctx,
        ts({
          x: o.ax,
          y: o.ay,
        }),
        o.color,
      );

      return;
    }

    // -------------------------------------------------------------
    // Línea personalizada: segmento A → B
    // -------------------------------------------------------------
    if (o.type === 'custom') {
      const a = ts({
        x: o.ax,
        y: o.ay,
      });

      const b = ts({
        x: o.bx,
        y: o.by,
      });

      drawRefLine(
        ctx,
        a.x,
        a.y,
        b.x,
        b.y,
        false,
        o.color,
      );

      drawPointMarker(
        ctx,
        a,
        o.color,
      );

      drawPointMarker(
        ctx,
        b,
        o.color,
      );

      return;
    }

    // -------------------------------------------------------------
    // Línea horizontal / vertical / extremo a extremo
    //
    // Primero se recorta en el espacio ORIGINAL.
    // Después se transforma todo el segmento.
    // -------------------------------------------------------------
    let dx: number;
    let dy: number;
    let x0: number;
    let y0: number;

    if (o.type === 'h') {
      dx = 1;
      dy = 0;
      x0 = o.ax;
      y0 = o.ay;
    } else if (o.type === 'v') {
      dx = 0;
      dy = 1;
      x0 = o.ax;
      y0 = o.ay;
    } else {
      // edge
      dx = o.bx - o.ax;
      dy = o.by - o.ay;
      x0 = o.ax;
      y0 = o.ay;
    }

    const c = clipRay(
      x0,
      y0,
      dx,
      dy,
      0,
      W,
      0,
      H,
    );

    if (!c) return;

    const a = ts({
      x: c.x1,
      y: c.y1,
    });

    const b = ts({
      x: c.x2,
      y: c.y2,
    });

    drawRefLine(
      ctx,
      a.x,
      a.y,
      b.x,
      b.y,
      false,
      o.color,
    );

    // -------------------------------------------------------------
    // Puntos de control / ancla
    // -------------------------------------------------------------
    if (o.type === 'h' || o.type === 'v') {
      const anchor = ts({
        x: o.ax,
        y: o.ay,
      });

      drawPointMarker(
        ctx,
        anchor,
        o.color,
      );
    }

    if (o.type === 'edge') {
      const p1 = ts({
        x: o.ax,
        y: o.ay,
      });

      const p2 = ts({
        x: o.bx,
        y: o.by,
      });

      drawPointMarker(
        ctx,
        p1,
        o.color,
      );

      drawPointMarker(
        ctx,
        p2,
        o.color,
      );
    }
  });

  // -------------------------------------------------------------
  // Nombres
  // -------------------------------------------------------------
  if (showNames) {
    objects.forEach((o) => {
      const p = ts(
        refLabelPoint(o),
      );

      drawRefName(
        ctx,
        o.name,
        p.x,
        p.y,
        o.color,
      );
    });
  }
}


export function drawVanishingPoint(
  ctx: CanvasRenderingContext2D,
  vp: Point | null,
  rays: VanishingRay[],
  W: number,
  H: number,
  zoom: number,
  panX: number,
  panY: number,
) {
  if (!vp) return;

  // Los puntos se almacenan en coordenadas ORIGINALES.
  // Primero los transformamos a coordenadas ORIENTED.
  const transform = (p: Point) =>
    transformPoint(
      p,
      transformState,
      toolState.file.naturalW,
      toolState.file.naturalH,
    );

  // Después convertimos de ORIENTED a pantalla.
  const ts = (p: Point) =>
    toScreen(
      p,
      zoom,
      panX,
      panY,
    );

  const vo = transform(vp);
  const vs = ts(vo);

  rays.forEach((r) => {
    const ro = transform(r);
    const rp = ts(ro);

    // El clipping se hace en coordenadas ORIENTED,
    // antes de aplicar zoom y pan.
    const c = clipRay(
      vo.x,
      vo.y,
      ro.x - vo.x,
      ro.y - vo.y,
      0,
      W,
      0,
      H,
    );

    if (c) {
      const a = ts({
        x: c.x1,
        y: c.y1,
      });

      const b = ts({
        x: c.x2,
        y: c.y2,
      });

      drawRefLine(
        ctx,
        a.x,
        a.y,
        b.x,
        b.y,
        true,
      );
    }

    ctx.save();

    ctx.fillStyle =
      'rgba(227,139,41,0.9)';

    ctx.beginPath();

    ctx.arc(
      rp.x,
      rp.y,
      3,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.restore();
  });

  ctx.save();

  ctx.strokeStyle = '#E38B29';
  ctx.lineWidth = 1.8;

  ctx.beginPath();

  ctx.arc(
    vs.x,
    vs.y,
    8,
    0,
    Math.PI * 2,
  );

  ctx.stroke();

  ctx.beginPath();

  ctx.moveTo(
    vs.x - 13,
    vs.y,
  );

  ctx.lineTo(
    vs.x + 13,
    vs.y,
  );

  ctx.moveTo(
    vs.x,
    vs.y - 13,
  );

  ctx.lineTo(
    vs.x,
    vs.y + 13,
  );

  ctx.stroke();

  ctx.restore();
}



export function drawMeasurements(
  ctx: CanvasRenderingContext2D,
  measurements: Measurement[],
  pxPerUnit: number,
  unit: string,
  zoom: number,
  panX: number,
  panY: number,
  pendingPoint: Point | null,
  hoverPoint: Point | null,
  pendingIsMeasure: boolean,
) {
  const transform = (p: Point) =>
    transformPoint(
      p,
      transformState,
      toolState.file.naturalW,
      toolState.file.naturalH,
    );

  const ts = (p: Point) =>
    toScreen(
      transform(p),
      zoom,
      panX,
      panY,
    );

  ctx.save();
  ctx.font = '11.5px ' + FONT;

  measurements.forEach((m) => {
    const a = ts({
      x: m.ax,
      y: m.ay,
    });

    const b = ts({
      x: m.bx,
      y: m.by,
    });

    // La distancia se calcula en coordenadas originales.
    const d = measureDist(
      m,
      pxPerUnit,
    );

    drawMeasureLine(
      ctx,
      a,
      b,
      fmt(d.total) + ' ' + unit,
    );
  });

  if (pendingPoint) {
    const color =
      pendingIsMeasure
        ? '#E38B29'
        : '#6FB7C9';

    const a = ts(pendingPoint);

    dot(
      ctx,
      a,
      color,
    );

    if (hoverPoint) {
      const b = ts(hoverPoint);

      if (pendingIsMeasure) {
        // La distancia también permanece en
        // coordenadas originales.
        const dx =
          hoverPoint.x -
          pendingPoint.x;

        const dy =
          hoverPoint.y -
          pendingPoint.y;

        const total =
          Math.hypot(dx, dy) /
          pxPerUnit;

        drawMeasureLine(
          ctx,
          a,
          b,
          fmt(total) + ' ' + unit,
          true,
        );
      } else {
        drawRefLine(
          ctx,
          a.x,
          a.y,
          b.x,
          b.y,
          true,
        );
      }
    }
  }

  ctx.restore();
}


export function drawRulerTop(
  ctx: CanvasRenderingContext2D, rectW: number, rectH: number,
  orientedW: number, pxPerUnit: number, zoom: number, panX: number
) {
  ctx.clearRect(0, 0, rectW, rectH);
  const pxPerUnitScreen = pxPerUnit * zoom;
  const rawStep = 55 / pxPerUnitScreen;
  const step = niceStep(rawStep);
  const maxUnits = orientedW / pxPerUnit;

  ctx.font = '10px ' + FONT;
  ctx.fillStyle = '#9AA6B5';
  ctx.strokeStyle = 'rgba(154,166,181,0.6)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  for (let u = 0; u <= maxUnits + step; u += step) {
    const x = u * pxPerUnit * zoom + panX;
    if (x < -20 || x > rectW + 20) continue;
    ctx.beginPath();
    ctx.moveTo(x, rectH); ctx.lineTo(x, rectH - 12);
    ctx.stroke();
    ctx.fillText(fmt(u), x + 3, 2);
    for (let k = 1; k < 5; k++) {
      const xu = u + step * k / 5;
      if (xu > maxUnits) break;
      const xm = xu * pxPerUnit * zoom + panX;
      ctx.beginPath();
      ctx.moveTo(xm, rectH); ctx.lineTo(xm, rectH - 6);
      ctx.stroke();
    }
  }
}

export function drawRulerLeft(
  ctx: CanvasRenderingContext2D, rectW: number, rectH: number,
  orientedH: number, pxPerUnit: number, zoom: number, panY: number
) {
  ctx.clearRect(0, 0, rectW, rectH);
  const pxPerUnitScreen = pxPerUnit * zoom;
  const rawStep = 55 / pxPerUnitScreen;
  const step = niceStep(rawStep);
  const maxUnits = orientedH / pxPerUnit;

  ctx.font = '10px ' + FONT;
  ctx.fillStyle = '#9AA6B5';
  ctx.strokeStyle = 'rgba(154,166,181,0.6)';

  for (let u = 0; u <= maxUnits + step; u += step) {
    const y = u * pxPerUnit * zoom + panY;
    if (y < -20 || y > rectH + 20) continue;
    ctx.beginPath();
    ctx.moveTo(rectW, y); ctx.lineTo(rectW - 12, y);
    ctx.stroke();
    ctx.save();
    ctx.translate(rectW - 15, y);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(fmt(u), 2, 0);
    ctx.restore();
    for (let k = 1; k < 5; k++) {
      const yu = u + step * k / 5;
      if (yu > maxUnits) break;
      const ym = yu * pxPerUnit * zoom + panY;
      ctx.beginPath();
      ctx.moveTo(rectW, ym); ctx.lineTo(rectW - 6, ym);
      ctx.stroke();
    }
  }
}

function drawRefName(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  color: string,
) {
  ctx.save();

  ctx.font = '12px -apple-system, "Segoe UI", Inter, Helvetica, Arial, sans-serif';

  const paddingX = 6;
  const paddingY = 4;
  const metrics = ctx.measureText(name);

  const width = metrics.width + paddingX * 2;
  const height = 20;

  const boxX = x + 10;
  const boxY = y - height - 8;

  ctx.fillStyle = 'rgba(20, 24, 28, 0.92)';
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, width, height, 4);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    name,
    boxX + paddingX,
    boxY + height / 2,
  );

  ctx.restore();
}

function refLabelPoint(o: RefObject): Point {
  if (o.type === 'custom' || o.type === 'edge') {
    return {
      x: (o.ax + o.bx) / 2,
      y: (o.ay + o.by) / 2,
    };
  }

  return {
    x: o.ax,
    y: o.ay,
  };
}