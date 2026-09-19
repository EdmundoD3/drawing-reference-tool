<script lang="ts">
  // RealSizePanel.svelte
  import { toolState } from "../../state.svelte";
  import { uiState } from "../../ui.svelte";
  import { fmt } from "../../geometry";
  import { sidebarOpen } from "../../globalState.svelte";

  interface Props {
    onToggle: () => void;
  }
  let { onToggle }: Props = $props();
  function showCalibField() {
      uiState.showCalib = true;
      sidebarOpen.value = false;
    }
</script>

<section class="panel">
  <h2>Tamaño real en pantalla</h2>
  <button
    class="small toolbtn"
    class:active={toolState.realSizeActive}
    style="width:100%;"
    disabled={!toolState.oriented}
    onclick={onToggle}
  >
    Mostrar tamaño real
  </button>
  <div class="field" style="margin-top:8px;">
    <span
      style="font-family:var(--mono); color:var(--text-dim); display:block; font-size:12px;"
    >
      {toolState.isCalibrated
        ? "Calibración: automática (96 dpi)"
        : `Calibración: ${fmt(toolState.calibrationFactor)}× (ajustada con regla)`}
    </span>
  </div>
  <button
    class="small ghost"
    style="width:100%;"
    disabled={!toolState.oriented}
    onclick={showCalibField}
  >
    Calibrar con una regla física
  </button>
</section>
