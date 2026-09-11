<script lang="ts">
  // CanvasWrap.svelte
  import {
    dragging,
    hoverTarget,
    isPanning,
    mainCanvas,
    panStart,
    rulerCanvas,
    showRefNames,
  } from "../../shared/stageCanvas.svelte";
  import {
    findNearPointObject,
    findNearRefEndpoint,
    imageCenterScreen,
    nearVanishingPoint,
    toolState,
  } from "../../state.svelte";
  import { uiState } from "../../ui.svelte";
  const RADIUS_SCALE = 0.5;

  let handlePos = $derived.by(() => {
    const c = imageCenterScreen();
    // radio de una esquina de la imagen hacia el centro
    const radius =
      (Math.max(toolState.orientedW, toolState.orientedH) / 2) *
      toolState.zoom *
      RADIUS_SCALE;
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
    dragging.handle = true;
  }

  // ---------------------------------------------------------------
  // Pointer interaction: pan, drag existing points, or run the active tool
  // ---------------------------------------------------------------
  function onMouseDown(e: MouseEvent) {
    if (!toolState.oriented) return;
    if (!mainCanvas.value) return;
    const rect = mainCanvas.value.getBoundingClientRect();
    const mx = e.clientX - rect.left,
      my = e.clientY - rect.top;
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
  function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Shift') {
    showRefNames.value = true;
  }
}

function onKeyUp(e: KeyboardEvent) {
  if (e.key === 'Shift') {
    showRefNames.value = false;
  }
}
</script>

<div class="canvas-wrap">
  <div class="corner"></div>
  <canvas class="ruler-top" bind:this={rulerCanvas.top}></canvas>
  <canvas class="ruler-left" bind:this={rulerCanvas.left}></canvas>
  <canvas
    class="main-canvas"
    class:tool-active={toolState.activeTool !== null}
    class:panning={isPanning.value}
    class:hover-target={hoverTarget.value}
    bind:this={mainCanvas.value}
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
<svelte:window
  onkeydown={onKeyDown}
  onkeyup={onKeyUp}
  onblur={() => (showRefNames.value = false)}
/>