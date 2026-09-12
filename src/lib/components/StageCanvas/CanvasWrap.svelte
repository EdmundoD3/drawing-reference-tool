<script lang="ts">
  import { onHandleMouseDown, onMouseDown } from "../../shared/canvasInteractions";

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