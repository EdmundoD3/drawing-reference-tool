import type { Arc, Measurement, Point, RefObject } from './types';

export function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

/** Rounds a raw ruler step to a "nice" 1-2-5 * 10^n value. */
export function niceStep(rawStep: number): number {
  if (rawStep <= 0) return 1;
  const exp = Math.floor(Math.log10(rawStep));
  const base = Math.pow(10, exp);
  const f = rawStep / base;
  let niceF: number;
  if (f < 1.5) niceF = 1;
  else if (f < 3) niceF = 2;
  else if (f < 7) niceF = 5;
  else niceF = 10;
  return niceF * base;
}

/** Formats a number for on-screen display, trimming to 2 decimals. */
export function fmt(n: number): string {
  if (Math.abs(n) < 0.005) return '0';
  return (Math.round(n * 100) / 100).toString();
}

/**
 * Clips an infinite line (point + direction) to an axis-aligned rectangle.
 * Returns both intersection points, or null if the line misses the rectangle.
 */
export function clipRay(
  x0: number, y0: number, dx: number, dy: number,
  xmin: number, xmax: number, ymin: number, ymax: number
): { x1: number; y1: number; x2: number; y2: number } | null {
  let tmin = -Infinity, tmax = Infinity;
  if (dx !== 0) {
    let t1 = (xmin - x0) / dx, t2 = (xmax - x0) / dx;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
  } else if (x0 < xmin || x0 > xmax) return null;
  if (dy !== 0) {
    let t1 = (ymin - y0) / dy, t2 = (ymax - y0) / dy;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
  } else if (y0 < ymin || y0 > ymax) return null;
  if (tmin > tmax) return null;
  return { x1: x0 + dx * tmin, y1: y0 + dy * tmin, x2: x0 + dx * tmax, y2: y0 + dy * tmax };
}

export function measureDist(m: Measurement, pxPerUnit: number) {
  const dx = m.bx - m.ax, dy = m.by - m.ay;
  return {
    total: Math.hypot(dx, dy) / pxPerUnit,
    h: Math.abs(dx) / pxPerUnit,
    v: Math.abs(dy) / pxPerUnit,
  };
}

/**
 * Builds the quarter-circle arcs of a golden spiral inscribed in a rectangle,
 * via the classic "whirling squares" construction: repeatedly cut the largest
 * possible square from the rectangle and trace a tangent quarter-arc in it.
 */
export function buildGoldenSpiralArcs(x: number, y: number, w: number, h: number, maxIter: number): Arc[] {
  const arcs: Arc[] = [];
  let rx = x, ry = y, rw = w, rh = h;
  const sides = ['right', 'bottom', 'left', 'top'] as const;
  let s = rw >= rh ? 0 : 1;
  for (let i = 0; i < maxIter; i++) {
    if (rw < 2 || rh < 2) break;
    const side = sides[s % 4];
    const size = Math.min(rw, rh);
    let cx = 0, cy = 0, startAngle = 0, endAngle = 0;
    let next = { x: rx, y: ry, w: rw, h: rh };
    if (side === 'right') {
      cx = rx + rw - size; cy = ry;
      startAngle = Math.PI / 2; endAngle = 0;
      next = { x: rx, y: ry, w: rw - size, h: rh };
    } else if (side === 'bottom') {
      cx = rx + size; cy = ry + rh - size;
      startAngle = Math.PI; endAngle = Math.PI / 2;
      next = { x: rx, y: ry, w: rw, h: rh - size };
    } else if (side === 'left') {
      cx = rx + size; cy = ry + size;
      startAngle = -Math.PI / 2; endAngle = Math.PI;
      next = { x: rx + size, y: ry, w: rw - size, h: rh };
    } else { // top
      cx = rx; cy = ry + size;
      startAngle = 0; endAngle = -Math.PI / 2;
      next = { x: rx, y: ry + size, w: rw, h: rh - size };
    }
    arcs.push({ cx, cy, r: size, startAngle, endAngle, ccw: true });
    rx = next.x; ry = next.y; rw = next.w; rh = next.h;
    s++;
  }
  return arcs;
}

export function toScreen(p: Point, zoom: number, panX: number, panY: number): Point {
  return { x: p.x * zoom + panX, y: p.y * zoom + panY };
}

/** Type-appropriate readout for a reference line/point: only the axis that matters for h/v lines. */
export function refObjectInfo(o: RefObject, pxPerUnit: number, unit: string): string[] {
  if (o.type === 'point') {
    return [`X: ${fmt(o.ax / pxPerUnit)} ${unit}   Y: ${fmt(o.ay / pxPerUnit)} ${unit}`];
  }

  if (o.type === 'h') {
    return [`Y: ${fmt(o.ay / pxPerUnit)} ${unit}`];
  }

  if (o.type === 'v') {
    return [`X: ${fmt(o.ax / pxPerUnit)} ${unit}`];
  }

  const dx = o.bx - o.ax;
  const dy = o.by - o.ay;
  const distance = Math.hypot(dx, dy) / pxPerUnit;

  if (o.type === 'custom') {
    const p1x = fmt(o.ax / pxPerUnit);
    const p1y = fmt(o.ay / pxPerUnit);
    const p2x = fmt(o.bx / pxPerUnit);
    const p2y = fmt(o.by / pxPerUnit);

    return [`P1: X ${p1x} ${unit}   Y ${p1y} ${unit}`,
    `P2: X ${p2x} ${unit}   Y ${p2y} ${unit}`,
    `Distancia: ${fmt(distance)} ${unit}`
    ];
  }

  return [`Longitud: ${fmt(distance)} ${unit}`];
}