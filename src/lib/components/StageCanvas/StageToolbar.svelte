<script lang="ts">
  import { TOOL_NAMES } from "../../constants";
  import { sidebarOpen } from "../../globalState.svelte";
  import type {
    FitNowFn,
    ViewportFn,
  } from "../../interfaces/stageCanvas.interfaces";
  import { coordsText, showRefNames } from "../../shared/stageCanvas.svelte";
  import { setTool, setZoom, toolState } from "../../state.svelte";
  import { uiState } from "../../ui.svelte";
  import CalibWarningBtn from "../calib/CalibWarningBtn.svelte";
  import RotateToggle from "./RotateToggle.svelte";
  interface Props {
    fitNow: FitNowFn;
    viewport: ViewportFn;
    toggleRealSizeNow: () => void;
  }
  let { fitNow, viewport, toggleRealSizeNow }: Props = $props();

  function zoomInClick() {
    const port = viewport();
    if (!port) return;
    const { w, h } = port;
    setZoom(toolState.zoom * 1.25, w / 2, h / 2);
  }
  function zoomOutClick() {
    const port = viewport();
    if (!port) return;
    const { w, h } = port;
    setZoom(toolState.zoom / 1.25, w / 2, h / 2);
  }

  function disableActiveTool() {
    setTool(null);
  }
  function toggleRefNames() {
    showRefNames.value = !showRefNames.value;
  }
  function toggleMoveBothPoints() {
    uiState.moveBothPoints = !uiState.moveBothPoints;
  }
</script>

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
      onclick={fitNow}
      title="Encajar la imagen completa en el área visible"
    >
      Encajar
    </button>
    <RotateToggle></RotateToggle>
    <button
      class="small mobile-names-button"
      class:active={showRefNames.value}
      aria-label="Mostrar nombres"
      onclick={toggleRefNames}
    >
      Nombres
    </button>
    <button
      class="small mobile-move-points-button"
      class:active={uiState.moveBothPoints}
      aria-label="Mover ambos puntos"
      title="Mover ambos puntos"
      onclick={toggleMoveBothPoints}
    >
      2 puntos
    </button>
    <CalibWarningBtn onToggle={toggleRealSizeNow} />

    <button
      class="mobile-panel-button"
      aria-label={sidebarOpen.value
        ? "Cerrar herramientas"
        : "Abrir herramientas"}
      onclick={() => (sidebarOpen.value = !sidebarOpen.value)}
    >
      {sidebarOpen.value ? "×" : "☰"}
    </button>
  </div>
  {#if toolState.activeTool != null}
    <button class="active-tool-button" onclick={disableActiveTool}>
      {TOOL_NAMES[toolState.activeTool]} ×
    </button>
  {/if}
  <div class="coords">
    <span>X: <b>{coordsText.x}</b></span>
    <span>Y: <b>{coordsText.y}</b></span>
  </div>
</div>
