import { fmt } from "../geometry";
import { toolState } from "../state/state.svelte";
import type { Point } from "../types";
import { uiState } from "../state/ui.svelte";
import {
  coordsText,
  dragging,
  hoverTarget,
  isPanning,
  mainCanvas,
  panStart,
} from "./stageCanvas.svelte";
import { setZoom } from "../canvas/view";
import { imageCenterScreen, screenToOriginal } from "../canvas/coordinates";
import {
  dragRefEndpointTo,
  dragRefObjectAsWhole,
  dragRefObjectTo,
  dragVanishingPointTo,
  findNearPointObject,
  findNearRefEndpoint,
  nearVanishingPoint,
} from "../canvas/dragging";
import { handleToolClick, setTool } from "../canvas/tools";
import { transformState } from "../state/transform.svelte";
import { setRotation } from "../state/image.svelte";

const pinch = {
  pointers: new Map<number, { x: number; y: number }>(),
  active: false,
  lastDistance: 0,
  lastAngle: 0,
};

export function onWheel(e: WheelEvent) {
  if (!transformState.oriented) return;

  e.preventDefault();

  if (!mainCanvas.value) return;

  const point = getCanvasPoint(e);

  if (!point) return;

  const { x: mx, y: my } = point;

  const factor = Math.pow(1.0015, -e.deltaY);

  setZoom(toolState.view.zoom * factor, mx, my);
}

// ---------------------------------------------------------------
// Pointer interaction: pan, drag existing points, or run the active tool
// ---------------------------------------------------------------

export function onPointerMove(e: PointerEvent) {
  if (!mainCanvas.value) return;

  if (pinch.active && pinch.pointers.has(e.pointerId)) {
    pinch.pointers.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
    });

    if (pinch.pointers.size < 2) return;

    const points = [...pinch.pointers.values()];

    const dx = points[1].x - points[0].x;
    const dy = points[1].y - points[0].y;

    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    let angleDelta = angle - pinch.lastAngle;

    // Evita el salto entre +π y -π.
    if (angleDelta > Math.PI) {
      angleDelta -= Math.PI * 2;
    } else if (angleDelta < -Math.PI) {
      angleDelta += Math.PI * 2;
    }

    if (pinch.lastDistance <= 0) {
      pinch.lastDistance = distance;
      pinch.lastAngle = angle;
      return;
    }

    const midpointX =
      (points[0].x + points[1].x) / 2;

    const midpointY =
      (points[0].y + points[1].y) / 2;

    const point = getCanvasPoint({
      clientX: midpointX,
      clientY: midpointY,
    });

    if (!point) return;

    const factor = distance / pinch.lastDistance;

    setZoom(
      toolState.view.zoom * factor,
      point.x,
      point.y,
    );

    // Solo rotamos si está activa la rotación.
    if (uiState.freeRotateMode) {
      const angleDeltaDeg =
        (angleDelta * 180) / Math.PI;

      const rotationSensitivity = 1.35;

      setRotation(
        transformState.rotation +
        angleDeltaDeg * rotationSensitivity,
      );
    }

    pinch.lastDistance = distance;
    pinch.lastAngle = angle;

    return;
  }

  const point = getCanvasPoint(e);
  if (!point) return;

  const { x: mx, y: my, rect } = point;

  if (
    dragging.handle &&
    dragging.handlePointerId === e.pointerId
  ) {
    const c = imageCenterScreen();

    const mouseAngle = Math.atan2(
      my - c.y,
      mx - c.x,
    );

    let deg =
      ((mouseAngle + Math.PI / 2) * 180) / Math.PI;

    deg = ((((deg + 180) % 360) + 360) % 360) - 180;

    setRotation(deg);
    return;
  }

  if (!transformState.oriented) return;

  const inside =
    mx >= 0 &&
    my >= 0 &&
    mx <= rect.width &&
    my <= rect.height;

  if (dragging.isDragging) {
    const dx = e.clientX - dragging.startX,
      dy = e.clientY - dragging.startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragging.moved = true;
    }

    if (dragging.vanishingPoint) {
      dragVanishingPointTo(mx, my);
    } else if (
      dragging.refObj &&
      dragging.refMoveMode === "translate"
    ) {
      dragRefObjectAsWhole(
        dragging.refObj,
        dragging.refStartA,
        dragging.refStartB,
        e.clientX - dragging.startX,
        e.clientY - dragging.startY,
      );
    } else if (dragging.refObj && dragging.refEndpoint) {
      dragRefEndpointTo(
        dragging.refObj,
        dragging.refEndpoint,
        mx,
        my,
      );
    } else if (dragging.refObj) {
      dragRefObjectTo(
        dragging.refObj,
        mx,
        my,
      );
    } else if (toolState.tools.activeTool === null) {
      toolState.view.panX = panStart.x + dx;
      toolState.view.panY = panStart.y + dy;
    }
  } else if (toolState.tools.activeTool === null) {
    hoverTarget.value =
      inside &&
      (
        nearVanishingPoint(mx, my) ||
        !!findNearRefEndpoint(mx, my) ||
        !!findNearPointObject(mx, my)
      );
  }

  if (inside) {
    updateCoords(mx, my);
  } else {
    coordsText.x = "—";
    coordsText.y = "—";
    toolState.tools.hoverPoint = null;
  }
}

export function onPointerUp(e: PointerEvent) {
  const wasPinch = pinch.active || pinch.pointers.size >= 2;

  if (pinch.pointers.has(e.pointerId)) {
    pinch.pointers.delete(e.pointerId);
  }

  if (wasPinch) {
    endPinch();

    if (mainCanvas.value?.hasPointerCapture(e.pointerId)) {
      mainCanvas.value.releasePointerCapture(e.pointerId);
    }

    cancelDragging();

    isPanning.value = false;

    return;
  }

  if (
    dragging.handle &&
    dragging.handlePointerId === e.pointerId
  ) {
    dragging.handle = false;
    dragging.handlePointerId = null;

    if (mainCanvas.value?.hasPointerCapture(e.pointerId)) {
      mainCanvas.value.releasePointerCapture(e.pointerId);
    }

    return;
  }

  if (!dragging.isDragging) return;

  const wasClick = !dragging.moved;

  cancelDragging();

  isPanning.value = false;

  if (wasClick && toolState.tools.activeTool) {
    if (!mainCanvas.value) return;

    const point = getCanvasPoint(e);
    if (!point) return;

    const { x: mx, y: my, rect } = point;

    if (
      mx >= 0 &&
      my >= 0 &&
      mx <= rect.width &&
      my <= rect.height
    ) {
      handleToolClick(mx, my);
    }
  }

  if (mainCanvas.value?.hasPointerCapture(e.pointerId)) {
    mainCanvas.value.releasePointerCapture(e.pointerId);
  }
}

export function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    if (toolState.tools.pendingPoint) {
      toolState.tools.pendingPoint = null;
    } else {
      setTool(null);
    }
  }
}

export function onHandlePointerDown(e: PointerEvent) {
  e.preventDefault();
  e.stopPropagation();

  dragging.handle = true;
  dragging.handlePointerId = e.pointerId;

  if (mainCanvas.value) {
    mainCanvas.value.setPointerCapture(e.pointerId);
  }
}

// ---------------------------------------------------------------
// Pointer interaction: pan, drag existing points, or run the active tool
// ---------------------------------------------------------------

export function onPointerDown(e: PointerEvent) {
  if (!transformState.oriented) return;
  if (!mainCanvas.value) return;

  mainCanvas.value.setPointerCapture(e.pointerId);

  pinch.pointers.set(e.pointerId, {
    x: e.clientX,
    y: e.clientY,
  });

  if (hasTwoPointers()) return startPinch();

  const point = getCanvasPoint(e);
  if (!point) return;

  const { x: mx, y: my } = point;
  updateCoords(mx, my);

  dragging.startX = e.clientX;
  dragging.startY = e.clientY;
  dragging.moved = false;

  if (
    toolState.tools.activeTool === null &&
    nearVanishingPoint(mx, my)
  ) {
    dragging.vanishingPoint = true;
    dragging.isDragging = true;
    return;
  }

  if (toolState.tools.activeTool === null) {
    const endpoint = findNearRefEndpoint(mx, my);

    if (endpoint) {
      dragging.refObj = endpoint.object;
      dragging.refEndpoint = endpoint.endpoint;

      dragging.refStartA = {
        x: endpoint.object.ax,
        y: endpoint.object.ay,
      };

      dragging.refStartB = {
        x: endpoint.object.bx,
        y: endpoint.object.by,
      };

      // Ctrl + arrastrar cualquiera de los extremos traslada
      // la línea completa sin cambiar su longitud ni orientación.
      // La línea en sí NO es arrastrable para evitar interferencias
      // con otros puntos u objetos que puedan quedar debajo.
      if (
        (e.ctrlKey || uiState.moveBothPoints) &&
        (endpoint.object.type === "custom" ||
          endpoint.object.type === "edge")
      ) {
        dragging.refMoveMode = "translate";
      } else {
        dragging.refMoveMode = "endpoint";
      }

      dragging.isDragging = true;
      return;
    }

    const po = findNearPointObject(mx, my);

    if (po) {
      dragging.refObj = po;
      dragging.refEndpoint = null;
      dragging.refMoveMode = null;
      dragging.isDragging = true;
      return;
    }
  }

  dragging.isDragging = true;

  panStart.x = toolState.view.panX;
  panStart.y = toolState.view.panY;

  if (toolState.tools.activeTool === null) {
    isPanning.value = true;
  }
}

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function getCanvasPoint(
  e: Pick<MouseEvent, "clientX" | "clientY">,
): Point & { rect: DOMRect } | null {
  if (!mainCanvas.value) return null;

  const rect = mainCanvas.value.getBoundingClientRect();

  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
    rect,
  };
}

function cancelDragging() {
  dragging.isDragging = false;
  dragging.vanishingPoint = false;
  dragging.refObj = null;
  dragging.refEndpoint = null;
  dragging.refMoveMode = null;
}

function hasTwoPointers() {
  return pinch.pointers.size === 2;
}

function startPinch() {
  const points = [...pinch.pointers.values()];

  const dx = points[1].x - points[0].x;
  const dy = points[1].y - points[0].y;

  pinch.lastDistance = Math.hypot(dx, dy);
  pinch.lastAngle = Math.atan2(dy, dx);
  pinch.active = true;

  cancelDragging();

  isPanning.value = false;
}

function endPinch() {
  pinch.active = false;
  pinch.lastDistance = 0;
  pinch.lastAngle = 0;
}


function updateCoords(mx: number, my: number) {
  const p = screenToOriginal(mx, my);

  coordsText.x =
    `${fmt(p.x / toolState.scale.pxPerUnit)} ${toolState.scale.unit}`;

  coordsText.y =
    `${fmt(p.y / toolState.scale.pxPerUnit)} ${toolState.scale.unit}`;

  toolState.tools.hoverPoint = p;
}