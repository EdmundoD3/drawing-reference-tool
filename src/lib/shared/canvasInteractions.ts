// ---------------------------------------------------------------
// Zoom controls
// ---------------------------------------------------------------

import { fmt, screenToImg } from "../geometry";
import { dragRefEndpointTo, dragRefObjectAsWhole, dragRefObjectTo, dragVanishingPointTo, findNearPointObject, findNearRefEndpoint, handleToolClick, imageCenterScreen, nearVanishingPoint, setFreeAngle, setTool, setZoom, toolState } from "../state.svelte";
import type { Point } from "../types";
import { coordsText, dragging, hoverTarget, isPanning, mainCanvas, panStart } from "./stageCanvas.svelte";

export function onWheel(e: WheelEvent) {
    if (!toolState.oriented) return;
    e.preventDefault();
    if (!mainCanvas.value) return;
    const point = getCanvasPoint(e);
    if (!point) return;
    const { x: mx, y: my } = point;
    const factor = Math.pow(1.0015, -e.deltaY);
    setZoom(toolState.zoom * factor, mx, my);
}

// ---------------------------------------------------------------
// Pointer interaction: pan, drag existing points, or run the active tool
// ---------------------------------------------------------------

export function onMouseMove(e: MouseEvent) {
    if (!toolState.oriented) return;
    if (!mainCanvas.value) return;
    const point = getCanvasPoint(e);
    if (!point) return;
    const { x: mx, y: my, rect } = point;
    const inside = mx >= 0 && my >= 0 && mx <= rect.width && my <= rect.height;

    if (dragging.handle) {
        const c = imageCenterScreen();
        const mouseAngle = Math.atan2(my - c.y, mx - c.x);
        let deg = ((mouseAngle + Math.PI / 2) * 180) / Math.PI;
        deg = ((((deg + 180) % 360) + 360) % 360) - 180;
        setFreeAngle(deg);
        return;
    }

    if (dragging.isDragging) {
        const dx = e.clientX - dragging.startX,
            dy = e.clientY - dragging.startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragging.moved = true;
        if (dragging.vanishingPoint) {
            dragVanishingPointTo(mx, my);
        } else if (dragging.refObj && dragging.refMoveMode === "translate") {
            dragRefObjectAsWhole(
                dragging.refObj,
                dragging.refStartA,
                dragging.refStartB,
                e.clientX - dragging.startX,
                e.clientY - dragging.startY,
            );
        } else if (dragging.refObj && dragging.refEndpoint) {
            dragRefEndpointTo(dragging.refObj, dragging.refEndpoint, mx, my);
        } else if (dragging.refObj) {
            dragRefObjectTo(dragging.refObj, mx, my);
        } else if (toolState.activeTool === null) {
            toolState.panX = panStart.x + dx;
            toolState.panY = panStart.y + dy;
        }
    } else if (toolState.activeTool === null) {
        hoverTarget.value =
            inside &&
            (nearVanishingPoint(mx, my) ||
                !!findNearRefEndpoint(mx, my) ||
                !!findNearPointObject(mx, my));
    }

    if (inside) {
        const p = screenToImg(
            mx,
            my,
            toolState.zoom,
            toolState.panX,
            toolState.panY,
        );
        coordsText.x = `${fmt(p.x / toolState.pxPerUnit)} ${toolState.unit}`;
        coordsText.y = `${fmt(p.y / toolState.pxPerUnit)} ${toolState.unit}`;
        toolState.hoverPoint = p;
    } else {
        coordsText.x = "—";
        coordsText.y = "—";
        toolState.hoverPoint = null;
    }
}

export function onMouseUp(e: MouseEvent) {
    if (dragging.handle) {
        dragging.handle = false;
        return;
    }

    if (!dragging.isDragging) return;

    const wasClick = !dragging.moved;

    dragging.isDragging = false;
    dragging.vanishingPoint = false;
    dragging.refObj = null;
    dragging.refEndpoint = null;
    dragging.refMoveMode = null;

    isPanning.value = false;

    if (wasClick && toolState.activeTool) {
        if (!mainCanvas.value) return;

        const point = getCanvasPoint(e);
        if (!point) return;
        const { x: mx, y: my, rect } = point;

        if (mx >= 0 && my >= 0 && mx <= rect.width && my <= rect.height) {
            handleToolClick(mx, my);
        }
    }
}


export function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
        if (toolState.pendingPoint) toolState.pendingPoint = null;
        else setTool(null);
    }
}

export function onHandleMouseDown(e: MouseEvent) {
    e.stopPropagation();
    dragging.handle = true;
}

// ---------------------------------------------------------------
// Pointer interaction: pan, drag existing points, or run the active tool
// ---------------------------------------------------------------
export function onMouseDown(e: MouseEvent) {
    if (!toolState.oriented) return;
    if (!mainCanvas.value) return;
    const point = getCanvasPoint(e);
    if (!point) return;
    const { x: mx, y: my } = point;
    dragging.startX = e.clientX;
    dragging.startY = e.clientY;
    dragging.moved = false;

    if (toolState.activeTool === null && nearVanishingPoint(mx, my)) {
        dragging.vanishingPoint = true;
        dragging.isDragging = true;
        return;
    }
    if (toolState.activeTool === null) {
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
                e.ctrlKey &&
                (endpoint.object.type === "custom" || endpoint.object.type === "edge")
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
    panStart.x = toolState.panX;
    panStart.y = toolState.panY;
    if (toolState.activeTool === null) isPanning.value = true;
}

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function getCanvasPoint(e: MouseEvent): Point & { rect: DOMRect } | null {
    if (!mainCanvas.value) return null;

    const rect = mainCanvas.value.getBoundingClientRect();

    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        rect,
    };
}