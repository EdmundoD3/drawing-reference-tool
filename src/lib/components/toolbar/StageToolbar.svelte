<script lang="ts">
  // StageToolbar.svelte
  import { setTool } from "../../canvas/tools";
  import { TOOL_NAMES } from "../../constants";
  import type { FitNowFn } from "../../interfaces/stageCanvas.interfaces";
  import { showRefNames } from "../../shared/stageCanvas.svelte";
  import { toolState } from "../../state/state.svelte";
  import { transformState } from "../../state/transform.svelte";
  import { uiState } from "../../state/ui.svelte";
  import CalibWarningBtn from "../calib/CalibWarningBtn.svelte";
  import RotateToggle from "../StageCanvas/RotateToggle.svelte";

  interface Props {
    fitNow: FitNowFn;
    toggleRealSizeNow: () => void;
  }

  let { fitNow, toggleRealSizeNow }: Props = $props();

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
  <button
    class="small fit-button stage-toolbar-button"
    disabled={!transformState.oriented || toolState.view.realSizeActive}
    onclick={fitNow}
    aria-label="Encajar imagen"
    title="Encajar la imagen completa en el área visible"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9V4h5" />
      <path d="M20 9V4h-5" />
      <path d="M4 15v5h5" />
      <path d="M20 15v5h-5" />
    </svg>
  </button>

  <RotateToggle />

  <button
    class="small mobile-names-button stage-toolbar-button"
    class:active={showRefNames.value}
    aria-label="Mostrar nombres"
    title="Mostrar nombres"
    onclick={toggleRefNames}
  >
    <span class="names-icon">Aa</span>
  </button>

  <button
    class="small mobile-move-points-button stage-toolbar-button"
    class:active={uiState.moveBothPoints}
    aria-label="Mover ambos puntos"
    title="Mover ambos puntos"
    onclick={toggleMoveBothPoints}
  >
    <svg viewBox="0 0 32 24" aria-hidden="true">
      <circle cx="7" cy="12" r="3" />
      <circle cx="25" cy="12" r="3" />
      <path d="M12 8l-4 4 4 4" />
      <path d="M20 8l4 4-4 4" />
    </svg>
  </button>

  <CalibWarningBtn onToggle={toggleRealSizeNow} />
  {#if toolState.tools.activeTool != null}
    <button class="active-tool-button stage-toolbar-button" onclick={disableActiveTool}>
      {TOOL_NAMES[toolState.tools.activeTool]} ×
    </button>
  {/if}
  <button
    class="mobile-panel-button stage-toolbar-button"
    aria-label={uiState.sidebarOpen
      ? "Cerrar herramientas"
      : "Abrir herramientas"}
    onclick={() => (uiState.sidebarOpen = !uiState.sidebarOpen)}
  >
    {uiState.sidebarOpen ? "×" : "☰"}
  </button>


</div>
