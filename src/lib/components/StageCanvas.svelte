<script lang="ts">
  // StageCanvas.svelte
  import { onMount } from "svelte";
  import { toolState } from "../state/state.svelte";
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
    fileInput,
    mainCanvas,
    rulerCanvas,
    showRefNames,
  } from "../shared/stageCanvas.svelte";
  import StageToolbar from "./toolbar/StageToolbar.svelte";
  import CalibOverlay from "./calib/CalibOverlay.svelte";
  import CanvasWrap from "./StageCanvas/CanvasWrap.svelte";
  import EmptyOverlay from "./StageCanvas/EmptyOverlay.svelte";
  import {
    onKeyDown,
    onPointerMove,
    onPointerUp,
    onWheel,
  } from "../shared/canvasInteractions";
  import { fitToScreen } from "../canvas/view";
  import { applyRealSizeZoom, toggleRealSize } from "../state/realSize.svelte";
  import { loadImageFile } from "../state/image.svelte";
  import { transformState } from "../state/transform.svelte";
  import { loadProject } from "../project";
  import { ACEPT_FILES } from "../constants";
    import StageStatusBar from "./toolbar/StageStatusBar.svelte";

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
    if (toolState.view.realSizeActive) {
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
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      ro.disconnect();
      mainCanvas.value?.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
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

    if (!transformState.oriented) return;

    // -------------------------------------------------------------
    // Imagen transformada
    // -------------------------------------------------------------
    ctx.save();

    ctx.translate(toolState.view.panX, toolState.view.panY);

    ctx.scale(toolState.view.zoom, toolState.view.zoom);

    ctx.imageSmoothingEnabled = toolState.view.zoom < 1;

    ctx.drawImage(transformState.oriented, 0, 0);

    ctx.restore();

    const { zoom, panX, panY } = toolState.view;

    const { orientedW: W, orientedH: H } = transformState;

    // -------------------------------------------------------------
    // Grid
    // -------------------------------------------------------------
    if (toolState.tools.showGrid) {
      drawGrid(
        ctx,
        rect.width,
        rect.height,
        W,
        H,
        zoom,
        panX,
        panY,
        toolState.tools.gridRows,
        toolState.tools.gridCols,
      );
    }

    // -------------------------------------------------------------
    // Golden ratio
    // -------------------------------------------------------------
    drawGoldenRatio(ctx, toolState.tools.goldenMode, W, H, zoom, panX, panY);

    // -------------------------------------------------------------
    // Reference objects
    // -------------------------------------------------------------
    drawReferenceObjects(
      ctx,
      toolState.tools.refObjects,
      toolState.file.naturalW,
      toolState.file.naturalH,
      zoom,
      panX,
      panY,
      showRefNames.value,
    );

    // -------------------------------------------------------------
    // Vanishing point
    // -------------------------------------------------------------
    drawVanishingPoint(
      ctx,
      toolState.tools.vanishingPoint,
      toolState.tools.vpRays,
      W,
      H,
      zoom,
      panX,
      panY,
    );

    // -------------------------------------------------------------
    // Measurements
    // -------------------------------------------------------------
    drawMeasurements(
      ctx,
      toolState.tools.measurements,
      toolState.scale.pxPerUnit,
      toolState.scale.unit,
      zoom,
      panX,
      panY,
      toolState.tools.pendingPoint,
      toolState.tools.hoverPoint,
      toolState.tools.activeTool === "measure",
    );
  }

  function drawRulers() {
    if (!rulerCanvas.top || !rulerCanvas.left) return;

    const dpr = window.devicePixelRatio || 1;

    const topRect = rulerCanvas.top.getBoundingClientRect();
    const topCtx = rulerCanvas.top.getContext("2d")!;

    topCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    topCtx.clearRect(0, 0, topRect.width, topRect.height);

    if (transformState.oriented && toolState.tools.showRulerTop) {
      drawRulerTop(
        topCtx,
        topRect.width,
        topRect.height,
        transformState.orientedW,
        toolState.scale.pxPerUnit,
        toolState.view.zoom,
        toolState.view.panX,
      );
    }

    const leftRect = rulerCanvas.left.getBoundingClientRect();
    const leftCtx = rulerCanvas.left.getContext("2d")!;

    leftCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    leftCtx.clearRect(0, 0, leftRect.width, leftRect.height);

    if (transformState.oriented && toolState.tools.showRulerLeft) {
      drawRulerLeft(
        leftCtx,
        leftRect.width,
        leftRect.height,
        transformState.orientedH,
        toolState.scale.pxPerUnit,
        toolState.view.zoom,
        toolState.view.panY,
      );
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

  function onChangeFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];

    if (!file) return;

    const isProject = file.name.toLowerCase().endsWith(".json");

    if (isProject) {
      loadProject(file, fitNow);
    } else {
      loadImageFile(file, fitNow);
    }

    fileInput.value!.value = "";
  }
</script>

<main class="stage">
  <StageToolbar {fitNow} {toggleRealSizeNow} />

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
  <StageStatusBar/>
  <!-- input global -->
  <input
    bind:this={fileInput.value}
    type="file"
    accept={ACEPT_FILES}
    onchange={onChangeFile}
  />
</main>
