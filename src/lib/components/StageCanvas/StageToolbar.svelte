<script lang="ts">
  import { setTool } from "../../canvas/tools";
  import { setZoom } from "../../canvas/view";
  import { TOOL_NAMES } from "../../constants";
  import type {
    FitNowFn,
    ViewportFn,
  } from "../../interfaces/stageCanvas.interfaces";
  import { coordsText, showRefNames } from "../../shared/stageCanvas.svelte";
  import { toolState } from "../../state/state.svelte";
    import { transformState } from "../../state/transform.svelte";
  import { uiState } from "../../state/ui.svelte";
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

    setZoom(
      toolState.view.zoom * 1.25,
      w / 2,
      h / 2,
    );
  }

  function zoomOutClick() {
    const port = viewport();
    if (!port) return;

    const { w, h } = port;

    setZoom(
      toolState.view.zoom / 1.25,
      w / 2,
      h / 2,
    );
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
      disabled={
        !transformState.oriented ||
        toolState.view.realSizeActive
      }
      onclick={zoomOutClick}
    >
      −
    </button>

    <span class="zoomval">
      {Math.round(toolState.view.zoom * 100)}%
    </span>

    <button
      class="small"
      disabled={
        !transformState.oriented ||
        toolState.view.realSizeActive
      }
      onclick={zoomInClick}
    >
      +
    </button>

    <button
      class="small"
      disabled={
        !transformState.oriented ||
        toolState.view.realSizeActive
      }
      onclick={fitNow}
      title="Encajar la imagen completa en el área visible"
    >
      Encajar
    </button>

    <RotateToggle />

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
      aria-label={
        uiState.sidebarOpen
          ? "Cerrar herramientas"
          : "Abrir herramientas"
      }
      onclick={() => (uiState.sidebarOpen = !uiState.sidebarOpen)}
    >
      {uiState.sidebarOpen ? "×" : "☰"}
    </button>
  </div>

  {#if toolState.tools.activeTool != null}
    <button
      class="active-tool-button"
      onclick={disableActiveTool}
    >
      {TOOL_NAMES[toolState.tools.activeTool]} ×
    </button>
  {/if}

  <div class="coords">
    <span>X: <b>{coordsText.x}</b></span>
    <span>Y: <b>{coordsText.y}</b></span>
  </div>
</div>
