// canvas/dragging.ts

import { screenToOriginal, transformPoint } from "./coordinates";
import { toolState } from "../state/state.svelte";
import { transformState } from "../state/transform.svelte";
import type { Point, RefObject } from "../types";

/**
 * Convierte un desplazamiento de pantalla a un desplazamiento
 * en coordenadas originales.
 *
 * No se aplica traslación porque estamos transformando un vector,
 * no un punto.
 */
function screenDeltaToOriginal(
  dxScreen: number,
  dyScreen: number,
): Point {
  const zoom = toolState.view.zoom;

  // Pantalla → oriented.
  const dx =
    dxScreen / zoom;

  const dy =
    dyScreen / zoom;

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
  return {
    x:
      rotatedX /
      transformState.scaleX,

    y:
      rotatedY /
      transformState.scaleY,
  };
}

/**
 * Busca un objeto de tipo punto cerca de la posición del cursor.
 *
 * El punto almacenado está en coordenadas originales,
 * por lo que primero se transforma a oriented y después a pantalla.
 */
export function findNearPointObject(
  mx: number,
  my: number,
): RefObject | null {
  const W = toolState.file.naturalW;
  const H = toolState.file.naturalH;

  for (
    let i = toolState.tools.refObjects.length - 1;
    i >= 0;
    i--
  ) {
    const o =
      toolState.tools.refObjects[i];

    if (o.locked) continue;
    if (o.type !== "point") continue;

    const screenPoint =
      transformPoint(
        {
          x: o.ax,
          y: o.ay,
        },
        transformState,
        W,
        H,
      );

    const sx =
      screenPoint.x *
        toolState.view.zoom +
      toolState.view.panX;

    const sy =
      screenPoint.y *
        toolState.view.zoom +
      toolState.view.panY;

    if (
      Math.hypot(
        sx - mx,
        sy - my,
      ) < 10
    ) {
      return o;
    }
  }

  return null;
}

/**
 * Comprueba si el cursor está cerca del punto de fuga.
 */
export function nearVanishingPoint(
  mx: number,
  my: number,
): boolean {
  const vp =
    toolState.tools.vanishingPoint;

  if (!vp) return false;

  const screenPoint =
    transformPoint(
      vp,
      transformState,
      toolState.file.naturalW,
      toolState.file.naturalH,
    );

  const sx =
    screenPoint.x *
      toolState.view.zoom +
    toolState.view.panX;

  const sy =
    screenPoint.y *
      toolState.view.zoom +
    toolState.view.panY;

  return (
    Math.hypot(
      sx - mx,
      sy - my,
    ) < 10
  );
}

/**
 * Mueve un objeto de tipo punto.
 */
export function dragRefObjectTo(
  o: RefObject,
  mx: number,
  my: number,
) {
  const p =
    screenToOriginal(
      mx,
      my,
    );

  o.ax = p.x;
  o.ay = p.y;
  o.bx = p.x;
  o.by = p.y;
}

/**
 * Mueve el punto de fuga.
 */
export function dragVanishingPointTo(
  mx: number,
  my: number,
) {
  toolState.tools.vanishingPoint =
    screenToOriginal(
      mx,
      my,
    );
}

/**
 * Busca un extremo/ancla de una referencia cerca del cursor.
 */
export function findNearRefEndpoint(
  mx: number,
  my: number,
): {
  object: RefObject;
  endpoint: "a" | "b";
} | null {
  const W = toolState.file.naturalW;
  const H = toolState.file.naturalH;

  for (
    let i = toolState.tools.refObjects.length - 1;
    i >= 0;
    i--
  ) {
    const o =
      toolState.tools.refObjects[i];

    if (o.locked) continue;

    // -------------------------------------------------------------
    // Horizontal / vertical:
    // tienen un único punto de anclaje.
    // -------------------------------------------------------------
    if (
      o.type === "h" ||
      o.type === "v"
    ) {
      const anchor =
        transformPoint(
          {
            x: o.ax,
            y: o.ay,
          },
          transformState,
          W,
          H,
        );

      const sx =
        anchor.x *
          toolState.view.zoom +
        toolState.view.panX;

      const sy =
        anchor.y *
          toolState.view.zoom +
        toolState.view.panY;

      if (
        Math.hypot(
          sx - mx,
          sy - my,
        ) < 10
      ) {
        return {
          object: o,
          endpoint: "a",
        };
      }

      continue;
    }

    // -------------------------------------------------------------
    // Custom / edge:
    // tienen dos puntos de control.
    // -------------------------------------------------------------
    if (
      o.type !== "custom" &&
      o.type !== "edge"
    ) {
      continue;
    }

    const a =
      transformPoint(
        {
          x: o.ax,
          y: o.ay,
        },
        transformState,
        W,
        H,
      );

    const asx =
      a.x *
        toolState.view.zoom +
      toolState.view.panX;

    const asy =
      a.y *
        toolState.view.zoom +
      toolState.view.panY;

    if (
      Math.hypot(
        asx - mx,
        asy - my,
      ) < 10
    ) {
      return {
        object: o,
        endpoint: "a",
      };
    }

    const b =
      transformPoint(
        {
          x: o.bx,
          y: o.by,
        },
        transformState,
        W,
        H,
      );

    const bsx =
      b.x *
        toolState.view.zoom +
      toolState.view.panX;

    const bsy =
      b.y *
        toolState.view.zoom +
      toolState.view.panY;

    if (
      Math.hypot(
        bsx - mx,
        bsy - my,
      ) < 10
    ) {
      return {
        object: o,
        endpoint: "b",
      };
    }
  }

  return null;
}

/**
 * Mueve un extremo de una referencia.
 */
export function dragRefEndpointTo(
  o: RefObject,
  endpoint: "a" | "b",
  mx: number,
  my: number,
) {
  const p =
    screenToOriginal(
      mx,
      my,
    );

  // -------------------------------------------------------------
  // Horizontal:
  // solamente cambia Y.
  // -------------------------------------------------------------
  if (o.type === "h") {
    o.ay = p.y;
    o.by = p.y;
    return;
  }

  // -------------------------------------------------------------
  // Vertical:
  // solamente cambia X.
  // -------------------------------------------------------------
  if (o.type === "v") {
    o.ax = p.x;
    o.bx = p.x;
    return;
  }

  // -------------------------------------------------------------
  // Custom / edge:
  // cada extremo es independiente.
  // -------------------------------------------------------------
  if (endpoint === "a") {
    o.ax = p.x;
    o.ay = p.y;
  } else {
    o.bx = p.x;
    o.by = p.y;
  }
}

/**
 * Mueve un objeto completo.
 *
 * El desplazamiento se recibe en coordenadas de pantalla,
 * por lo que debe invertirse la transformación antes de
 * aplicarlo a las coordenadas originales.
 */
export function dragRefObjectAsWhole(
  o: RefObject,
  startA: Point,
  startB: Point,
  dxScreen: number,
  dyScreen: number,
) {
  const delta =
    screenDeltaToOriginal(
      dxScreen,
      dyScreen,
    );

  o.ax =
    startA.x + delta.x;

  o.ay =
    startA.y + delta.y;

  o.bx =
    startB.x + delta.x;

  o.by =
    startB.y + delta.y;
}

/**
 * Alterna el bloqueo de una referencia.
 */
export function toggleRefObjectLock(
  id: number,
) {
  const o =
    toolState.tools.refObjects.find(
      (o) => o.id === id,
    );

  if (!o) return;

  o.locked = !o.locked;
}
