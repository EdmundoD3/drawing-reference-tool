

// ---------------------------------------------------------------
// Tools & click handling
// ---------------------------------------------------------------

import { DEFAULT_REF_COLOR, toolState } from "../state/state.svelte";
import { LINE_TYPE_LABEL, type RefObjectType, type Tool } from "../types";
import { screenToOriginal } from "./coordinates";


export function setTool(tool: Tool) {
  toolState.tools.activeTool =
    toolState.tools.activeTool === tool
      ? null
      : tool;

  toolState.tools.pendingPoint = null;
}

function nextName(type: RefObjectType): string {
  toolState.tools.typeCounters[type] =
    (toolState.tools.typeCounters[type] || 0) + 1;

  return `${LINE_TYPE_LABEL[type]} ${toolState.tools.typeCounters[type]}`;
}

export function handleToolClick(mx: number, my: number) {
  const p = screenToOriginal(mx, my);

  const tool = toolState.tools.activeTool;

  if (
    tool === "measure" ||
    tool === "line-edge" ||
    tool === "line-custom"
  ) {
    if (!toolState.tools.pendingPoint) {
      toolState.tools.pendingPoint = p;
    } else {
      if (tool === "measure") {
        toolState.tools.measurements.push({
          id: toolState.tools.nextId++,
          ax: toolState.tools.pendingPoint.x,
          ay: toolState.tools.pendingPoint.y,
          bx: p.x,
          by: p.y,
        });
      } else {
        const type: RefObjectType =
          tool === "line-edge"
            ? "edge"
            : "custom";

        toolState.tools.refObjects.push({
          id: toolState.tools.nextId++,
          type,
          name: nextName(type),
          ax: toolState.tools.pendingPoint.x,
          ay: toolState.tools.pendingPoint.y,
          bx: p.x,
          by: p.y,
          locked: false,
          color: DEFAULT_REF_COLOR,
        });
      }

      toolState.tools.pendingPoint = null;
    }
  } else if (tool === "line-h") {
    toolState.tools.refObjects.push({
      id: toolState.tools.nextId++,
      type: "h",
      name: nextName("h"),
      ax: 0,
      ay: p.y,
      bx: 0,
      by: p.y,
      locked: false,
      color: DEFAULT_REF_COLOR,
    });
  } else if (tool === "line-v") {
    toolState.tools.refObjects.push({
      id: toolState.tools.nextId++,
      type: "v",
      name: nextName("v"),
      ax: p.x,
      ay: 0,
      bx: p.x,
      by: 0,
      locked: false,
      color: DEFAULT_REF_COLOR,
    });
  } else if (tool === "point") {
    toolState.tools.refObjects.push({
      id: toolState.tools.nextId++,
      type: "point",
      name: nextName("point"),
      ax: p.x,
      ay: p.y,
      bx: p.x,
      by: p.y,
      locked: false,
      color: DEFAULT_REF_COLOR,
    });
  } else if (tool === "vp-place") {
    toolState.tools.vanishingPoint = {
      x: p.x,
      y: p.y,
    };
  } else if (tool === "vp-ray") {
    if (toolState.tools.vanishingPoint) {
      toolState.tools.vpRays.push({
        id: toolState.tools.nextId++,
        x: p.x,
        y: p.y,
      });
    }
  }
}

export function deleteMeasurement(id: number) {
  toolState.tools.measurements =
    toolState.tools.measurements.filter(
      (m) => m.id !== id
    );
}

export function deleteRefObject(id: number) {
  toolState.tools.refObjects =
    toolState.tools.refObjects.filter(
      (o) => o.id !== id
    );
}

export function renameRefObject(
  id: number,
  name: string
) {
  const o = toolState.tools.refObjects.find(
    (o) => o.id === id
  );

  if (o && name.trim()) {
    o.name = name.trim();
  }
}

export function setRefObjectColor(
  id: number,
  color: string
) {
  const o = toolState.tools.refObjects.find(
    (o) => o.id === id
  );

  if (o) {
    o.color = color;
  }
}

export function deleteVanishingRay(id: number) {
  toolState.tools.vpRays =
    toolState.tools.vpRays.filter(
      (r) => r.id !== id
    );
}

export function deleteVanishingPoint() {
  toolState.tools.vanishingPoint = null;
  toolState.tools.vpRays = [];

  if (toolState.tools.activeTool === "vp-ray") {
    setTool(null);
  }
}

