<script lang="ts">
  import { hoverTarget, isPanning, rulerCanvas } from "../../shared/stageCanvas.svelte";
  import { toolState } from "../../state.svelte";

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
