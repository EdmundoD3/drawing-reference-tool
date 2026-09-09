<script lang="ts">
  import { onMount } from "svelte";
  import {
    toolState,
    TOOL_HINTS,
    BASE_PX_PER_MM,
    setZoom,
    fitToScreen,
    handleToolClick,
    setTool,
    findNearPointObject,
    nearVanishingPoint,
    dragRefObjectTo,
    dragVanishingPointTo,
    loadImageFile,
    calibrate,
    applyRealSizeZoom,
    toggleRealSize,
    setFreeAngle,
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
  import { uiState } from "../ui.svelte";
  import type { RefObject } from "../types";

  let mainCanvas: HTMLCanvasElement;
  let rulerTopCanvas: HTMLCanvasElement;
  let rulerLeftCanvas: HTMLCanvasElement;
  let canvasArea: HTMLDivElement;
  let fileInput: HTMLInputElement;

  let isPanning = $state(false);
  let hoverTarget = $state(false);
  let coordXText = $state("—");
  let coordYText = $state("—");
  let calibInput = $state(100);

  // Plain (non-reactive) interaction bookkeeping — doesn't drive the template.
  let dragging = false;
  let draggingVP = false;
  let draggingRefObj: RefObject | null = null;
  let draggingHandle = false;
  let dragStartX = 0,
    dragStartY = 0,
    dragMoved = false;
  let panStartX = 0,
    panStartY = 0;

  function viewport() {
    const r = mainCanvas.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }

  function imageCenterScreen() {
    return {
      x: toolState.panX + (toolState.orientedW / 2) * toolState.zoom,
      y: toolState.panY + (toolState.orientedH / 2) * toolState.zoom,
    };
  }

  /** Handle sits at a fixed screen radius just outside the image, orbiting with freeAngle. */
  let handlePos = $derived.by(() => {
    const c = imageCenterScreen();
    const radius =
      (Math.max(toolState.orientedW, toolState.orientedH) / 2) *
        toolState.zoom +
      32;
    const ang = -Math.PI / 2 + (toolState.freeAngle * Math.PI) / 180;
    return {
      cx: c.x,
      cy: c.y,
      x: c.x + radius * Math.cos(ang),
      y: c.y + radius * Math.sin(ang),
    };
  });

  function onHandleMouseDown(e: MouseEvent) {
    e.stopPropagation();
    draggingHandle = true;
  }

  // ---------------------------------------------------------------
  // Actions exposed to sidebar panels (they don't have viewport size)
  // ---------------------------------------------------------------
  export function fitNow() {
    const { w, h } = viewport();
    fitToScreen(w, h);
  }
  export function toggleRealSizeNow() {
    const { w, h } = viewport();
    toggleRealSize(w, h);
  }
  export function reapplyRealSizeIfActive() {
    if (toolState.realSizeActive) {
      const { w, h } = viewport();
      applyRealSizeZoom(w, h);
    }
  }

  function doCalibrate() {
    if (calibInput > 0) {
      calibrate(calibInput);
      reapplyRealSizeIfActive();
      uiState.showCalib = false;
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
    sizeCanvas(mainCanvas);
    sizeCanvas(rulerTopCanvas);
    sizeCanvas(rulerLeftCanvas);
  }

  onMount(() => {
    resizeCanvases();
    redraw();
    const ro = new ResizeObserver(() => {
      resizeCanvases();
      redraw();
    });
    ro.observe(canvasArea);
    mainCanvas.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      ro.disconnect();
      mainCanvas.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  });

  // ---------------------------------------------------------------
  // Reactive redraw — re-runs whenever any state read inside it changes
  // ---------------------------------------------------------------
  $effect(() => {
    if (!mainCanvas || !rulerTopCanvas || !rulerLeftCanvas) return;
    redraw();
  });

  function redraw() {
    drawMain();
    drawRulers();
  }

  function drawMain() {
    const rect = mainCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const ctx = mainCanvas.getContext("2d")!;
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
    drawReferenceObjects(ctx, toolState.refObjects, W, H, zoom, panX, panY);
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
    const dpr = window.devicePixelRatio || 1;

    const topRect = rulerTopCanvas.getBoundingClientRect();
    const topCtx = rulerTopCanvas.getContext("2d")!;
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

    const leftRect = rulerLeftCanvas.getBoundingClientRect();
    const leftCtx = rulerLeftCanvas.getContext("2d")!;
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
  function zoomInClick() {
    const { w, h } = viewport();
    setZoom(toolState.zoom * 1.25, w / 2, h / 2);
  }
  function zoomOutClick() {
    const { w, h } = viewport();
    setZoom(toolState.zoom / 1.25, w / 2, h / 2);
  }

  function onWheel(e: WheelEvent) {
    if (!toolState.oriented) return;
    e.preventDefault();
    const rect = mainCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left,
      my = e.clientY - rect.top;
    const factor = Math.pow(1.0015, -e.deltaY);
    setZoom(toolState.zoom * factor, mx, my);
  }

  // ---------------------------------------------------------------
  // Pointer interaction: pan, drag existing points, or run the active tool
  // ---------------------------------------------------------------
  function onMouseDown(e: MouseEvent) {
    if (!toolState.oriented) return;
    const rect = mainCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left,
      my = e.clientY - rect.top;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragMoved = false;

    if (toolState.activeTool === null && nearVanishingPoint(mx, my)) {
      draggingVP = true;
      dragging = true;
      return;
    }
    if (toolState.activeTool === null) {
      const po = findNearPointObject(mx, my);
      if (po) {
        draggingRefObj = po;
        dragging = true;
        return;
      }
    }
    dragging = true;
    panStartX = toolState.panX;
    panStartY = toolState.panY;
    if (toolState.activeTool === null) isPanning = true;
  }

  function onMouseMove(e: MouseEvent) {
    if (!toolState.oriented) return;
    const rect = mainCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left,
      my = e.clientY - rect.top;
    const inside = mx >= 0 && my >= 0 && mx <= rect.width && my <= rect.height;

    if (draggingHandle) {
      const c = imageCenterScreen();
      const mouseAngle = Math.atan2(my - c.y, mx - c.x);
      let deg = ((mouseAngle + Math.PI / 2) * 180) / Math.PI;
      deg = ((((deg + 180) % 360) + 360) % 360) - 180;
      setFreeAngle(deg);
      return;
    }

    if (dragging) {
      const dx = e.clientX - dragStartX,
        dy = e.clientY - dragStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved = true;
      if (draggingVP) {
        dragVanishingPointTo(mx, my);
      } else if (draggingRefObj) {
        dragRefObjectTo(draggingRefObj, mx, my);
      } else if (toolState.activeTool === null) {
        toolState.panX = panStartX + dx;
        toolState.panY = panStartY + dy;
      }
    } else if (toolState.activeTool === null) {
      hoverTarget =
        inside && (nearVanishingPoint(mx, my) || !!findNearPointObject(mx, my));
    }

    if (inside) {
      const p = screenToImg(
        mx,
        my,
        toolState.zoom,
        toolState.panX,
        toolState.panY,
      );
      coordXText = `${fmt(p.x / toolState.pxPerUnit)} ${toolState.unit}`;
      coordYText = `${fmt(p.y / toolState.pxPerUnit)} ${toolState.unit}`;
      toolState.hoverPoint = p;
    } else {
      coordXText = "—";
      coordYText = "—";
      toolState.hoverPoint = null;
    }
  }

  function onMouseUp(e: MouseEvent) {
    if (draggingHandle) {
      draggingHandle = false;
      return;
    }
    if (!dragging) return;
    const wasClick = !dragMoved;
    dragging = false;
    draggingVP = false;
    draggingRefObj = null;
    isPanning = false;

    if (wasClick && toolState.activeTool) {
      const rect = mainCanvas.getBoundingClientRect();
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
  function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) loadImageFile(file, fitNow);
  }
  function onDrop(e: DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) loadImageFile(file, fitNow);
  }
</script>

<main class="stage">
  <div class="stage-toolbar">
    <div class="zoomctl">
      <button
        class="small"
        disabled={!toolState.oriented || toolState.realSizeActive}
        onclick={zoomOutClick}>−</button
      >
      <span class="zoomval">{Math.round(toolState.zoom * 100)}%</span>
      <button
        class="small"
        disabled={!toolState.oriented || toolState.realSizeActive}
        onclick={zoomInClick}>+</button
      >
      <button
        class="small"
        disabled={!toolState.oriented || toolState.realSizeActive}
        onclick={fitNow}>Ajustar</button
      >
    </div>
    <div class="toolhint">
      {toolState.activeTool ? TOOL_HINTS[toolState.activeTool] : ""}
    </div>
    <div class="coords">
      <span>X: <b>{coordXText}</b></span>
      <span>Y: <b>{coordYText}</b></span>
    </div>
  </div>

  <div
    class="canvas-area"
    role="region"
    aria-label="Área de trabajo"
    bind:this={canvasArea}
    ondragover={(e) => e.preventDefault()}
    ondragenter={(e) => e.preventDefault()}
    ondrop={onDrop}
  >
    <div class="canvas-wrap">
      <div class="corner"></div>
      <canvas class="ruler-top" bind:this={rulerTopCanvas}></canvas>
      <canvas class="ruler-left" bind:this={rulerLeftCanvas}></canvas>
      <canvas
        class="main-canvas"
        class:tool-active={toolState.activeTool !== null}
        class:panning={isPanning}
        class:hover-target={hoverTarget}
        bind:this={mainCanvas}
        onmousedown={onMouseDown}
      ></canvas>

      {#if uiState.freeRotateMode && toolState.oriented}
        <svg class="rotate-handle-layer">
          <line
            x1={handlePos.cx}
            y1={handlePos.cy}
            x2={handlePos.x}
            y2={handlePos.y}
          />
          <circle
            cx={handlePos.x}
            cy={handlePos.y}
            r="9"
            role="slider"
            aria-label="Rotar libremente"
            aria-valuenow={Math.round(toolState.freeAngle)}
            tabindex="0"
            onmousedown={onHandleMouseDown}
          />
        </svg>
      {/if}
    </div>

    {#if !toolState.oriented}
      <div class="empty-overlay">
        <button type="button" class="box" onclick={() => fileInput.click()}>
          <strong>Sin imagen cargada</strong>
          Arrastra una imagen aquí<br />o haz clic para seleccionarla
        </button>
      </div>
    {/if}

    {#if uiState.showCalib}
      <div class="calib-overlay">
        <div
          class="calib-box"
          style={`width:${Math.round(BASE_PX_PER_MM * 100)}px`}
        ></div>
        <div class="calib-controls">
          <span
            >Compara esta barra con una regla física y escribe lo que mide
            realmente:</span
          >
          <input type="number" step="0.1" bind:value={calibInput} />
          <button class="small primary" onclick={doCalibrate}>Calibrar</button>
          <button
            class="small ghost"
            onclick={() => (uiState.showCalib = false)}>Cerrar</button
          >
        </div>
      </div>
    {/if}
  </div>

  <input
    bind:this={fileInput}
    type="file"
    accept="image/png,image/jpeg,image/webp"
    onchange={onFileChange}
  />
</main>
