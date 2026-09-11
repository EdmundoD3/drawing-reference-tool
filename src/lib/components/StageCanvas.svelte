<script lang="ts">
  import { onMount } from "svelte";
  import {
    toolState,
    setZoom,
    fitToScreen,
    handleToolClick,
    setTool,
    findNearPointObject,
    nearVanishingPoint,
    dragRefObjectTo,
    dragVanishingPointTo,
    loadImageFile,
    applyRealSizeZoom,
    toggleRealSize,
    setFreeAngle,
    imageCenterScreen,
    dragRefEndpointTo,
    findNearRefEndpoint,
    dragRefObjectAsWhole,
  } from "../state.svelte";
  import { fmt, screenToImg } from "../geometry";
  import {
    drawGrid,
    drawGoldenRatio,
    drawReferenceObjects,
    drawVanishingPoint,
    drawMeasurements,
    drawRulerTop,
    drawRulerLeft,
  } from "../draw";
  import type {
    FitNowFn,
    ViewportFn,
  } from "../interfaces/stageCanvas.interfaces";
  import {
    canvasArea,
    coordsText,
    dragging,
    hoverTarget,
    isPanning,
    mainCanvas,
    panStart,
    rulerCanvas,
    showRefNames,
  } from "../shared/stageCanvas.svelte";
  import StageToolbar from "./StageCanvas/StageToolbar.svelte";
  import CalibOverlay from "./StageCanvas/CalibOverlay.svelte";
  import CanvasWrap from "./StageCanvas/CanvasWrap.svelte";
  import EmptyOverlay from "./StageCanvas/EmptyOverlay.svelte";
  import FileInput from "./StageCanvas/FileInput.svelte";

  const viewport: ViewportFn = () => {
    if (!mainCanvas.value) return;
    const r = mainCanvas.value.getBoundingClientRect();
    return { w: r.width, h: r.height };
  };

  // ---------------------------------------------------------------
  // Actions exposed to sidebar panels (they don't have viewport size)
  // ---------------------------------------------------------------

  export const fitNow: FitNowFn = () => {
    const port = viewport();
    if (!port) return;
    const { w, h } = port;
    fitToScreen(w, h);
  };

  export function toggleRealSizeNow() {
    const port = viewport();
    if (!port) return;
    const { w, h } = port;
    toggleRealSize(w, h);
  }
  export function reapplyRealSizeIfActive() {
    if (toolState.realSizeActive) {
      const port = viewport();
      if (!port) return;
      const { w, h } = port;
      applyRealSizeZoom(w, h);
    }
  }

  // ---------------------------------------------------------------
  // Canvas sizing (device-pixel-ratio aware)
  // ---------------------------------------------------------------
  function sizeCanvas(c: HTMLCanvasElement) {
    const rect = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width = Math.max(1, Math.round(rect.width * dpr));
    c.height = Math.max(1, Math.round(rect.height * dpr));
  }
  function resizeCanvases() {
    if (!rulerCanvas.top || !rulerCanvas.left || !mainCanvas.value) return;

    sizeCanvas(mainCanvas.value);
    sizeCanvas(rulerCanvas.top);
    sizeCanvas(rulerCanvas.left);
  }

  onMount(() => {
    if (!canvasArea.value || !mainCanvas.value) return;

    resizeCanvases();
    redraw();

    const ro = new ResizeObserver(() => {
      resizeCanvases();
      redraw();
    });

    ro.observe(canvasArea.value);

    mainCanvas.value.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      ro.disconnect();
      mainCanvas.value?.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  });

  // ---------------------------------------------------------------
  // Reactive redraw — re-runs whenever any state read inside it changes
  // ---------------------------------------------------------------
  $effect(() => {
    if (!mainCanvas.value || !rulerCanvas.top || !rulerCanvas.left) return;
    redraw();
  });

  function redraw() {
    drawMain();
    drawRulers();
  }

  function drawMain() {
    if (!mainCanvas.value) return;
    const rect = mainCanvas.value.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const ctx = mainCanvas.value.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "#0B121C";
    ctx.fillRect(0, 0, rect.width, rect.height);
    if (!toolState.oriented) return;

    ctx.save();
    ctx.translate(toolState.panX, toolState.panY);
    ctx.scale(toolState.zoom, toolState.zoom);
    ctx.imageSmoothingEnabled = toolState.zoom < 1;
    ctx.drawImage(toolState.oriented, 0, 0);
    ctx.restore();

    const { zoom, panX, panY, orientedW: W, orientedH: H } = toolState;
    if (toolState.showGrid)
      drawGrid(
        ctx,
        rect.width,
        rect.height,
        W,
        H,
        zoom,
        panX,
        panY,
        toolState.gridRows,
        toolState.gridCols,
      );
    drawGoldenRatio(ctx, toolState.goldenMode, W, H, zoom, panX, panY);
    drawReferenceObjects(
      ctx,
      toolState.refObjects,
      W,
      H,
      zoom,
      panX,
      panY,
      showRefNames.value,
    );
    drawVanishingPoint(
      ctx,
      toolState.vanishingPoint,
      toolState.vpRays,
      rect.width,
      rect.height,
      zoom,
      panX,
      panY,
    );
    drawMeasurements(
      ctx,
      toolState.measurements,
      toolState.pxPerUnit,
      toolState.unit,
      zoom,
      panX,
      panY,
      toolState.pendingPoint,
      toolState.hoverPoint,
      toolState.activeTool === "measure",
    );
  }

  function drawRulers() {
    if (!rulerCanvas.top || !rulerCanvas.left) return;

    const dpr = window.devicePixelRatio || 1;

    const topRect = rulerCanvas.top.getBoundingClientRect();
    const topCtx = rulerCanvas.top.getContext("2d")!;

    topCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    topCtx.clearRect(0, 0, topRect.width, topRect.height);

    if (toolState.oriented && toolState.showRulerTop) {
      drawRulerTop(
        topCtx,
        topRect.width,
        topRect.height,
        toolState.orientedW,
        toolState.pxPerUnit,
        toolState.zoom,
        toolState.panX,
      );
    }

    const leftRect = rulerCanvas.left.getBoundingClientRect();
    const leftCtx = rulerCanvas.left.getContext("2d")!;

    leftCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    leftCtx.clearRect(0, 0, leftRect.width, leftRect.height);

    if (toolState.oriented && toolState.showRulerLeft) {
      drawRulerLeft(
        leftCtx,
        leftRect.width,
        leftRect.height,
        toolState.orientedH,
        toolState.pxPerUnit,
        toolState.zoom,
        toolState.panY,
      );
    }
  }

  // ---------------------------------------------------------------
  // Zoom controls
  // ---------------------------------------------------------------

  function onWheel(e: WheelEvent) {
    if (!toolState.oriented) return;
    e.preventDefault();
    if (!mainCanvas.value) return;
    const rect = mainCanvas.value.getBoundingClientRect();
    const mx = e.clientX - rect.left,
      my = e.clientY - rect.top;
    const factor = Math.pow(1.0015, -e.deltaY);
    setZoom(toolState.zoom * factor, mx, my);
  }

  // ---------------------------------------------------------------
  // Pointer interaction: pan, drag existing points, or run the active tool
  // ---------------------------------------------------------------

  function onMouseMove(e: MouseEvent) {
    if (!toolState.oriented) return;
    if (!mainCanvas.value) return;
    const rect = mainCanvas.value.getBoundingClientRect();
    const mx = e.clientX - rect.left,
      my = e.clientY - rect.top;
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

  function onMouseUp(e: MouseEvent) {
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

      const rect = mainCanvas.value.getBoundingClientRect();

      const mx = e.clientX - rect.left,
        my = e.clientY - rect.top;

      if (mx >= 0 && my >= 0 && mx <= rect.width && my <= rect.height) {
        handleToolClick(mx, my);
      }
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      if (toolState.pendingPoint) toolState.pendingPoint = null;
      else setTool(null);
    }
  }

  // ---------------------------------------------------------------
  // Loading images: click-to-browse and drag & drop
  // ---------------------------------------------------------------

  function onDrop(e: DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) loadImageFile(file, fitNow);
  }
</script>

<main class="stage">
  <StageToolbar {fitNow} {viewport} />

  <div
    class="canvas-area"
    role="region"
    aria-label="Área de trabajo"
    bind:this={canvasArea.value}
    ondragover={(e) => e.preventDefault()}
    ondragenter={(e) => e.preventDefault()}
    ondrop={onDrop}
  >
    <CanvasWrap />

    <EmptyOverlay />

    <CalibOverlay {reapplyRealSizeIfActive} />
  </div>

  <FileInput {fitNow} />
</main>
