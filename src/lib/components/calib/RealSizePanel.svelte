<script lang="ts">
  // RealSizePanel.svelte
  import { calibrationState } from "../../state/calibration.svelte";
  import { toolState } from "../../state/state.svelte";
  import { fmt } from "../../geometry";
  import { uiState } from "../../state/ui.svelte";
    import { transformState } from "../../state/transform.svelte";

  interface Props {
    onToggle: () => void;
  }

  let { onToggle }: Props = $props();

  function showCalibField() {
    uiState.showCalib = true;
    uiState.sidebarOpen = false;
  }
</script>

<section class="panel">
  <h2>Tamaño real en pantalla</h2>

  <button
    class="small toolbtn"
    class:active={toolState.view.realSizeActive}
    style="width:100%;"
    disabled={!transformState.oriented}
    onclick={onToggle}
  >
    Mostrar tamaño real
  </button>

  <div class="field" style="margin-top:8px;">
    <span
      style="font-family:var(--mono); color:var(--text-dim); display:block; font-size:12px;"
    >
      {calibrationState.isCalibrated
        ? `Calibración manual: ${fmt(calibrationState.calibrationFactor)}×`
        : `Calibración estimada: ${fmt(calibrationState.calibrationFactor)}×`}
    </span>
  </div>

  <button
    class="small ghost"
    style="width:100%;"
    disabled={!transformState.oriented}
    onclick={showCalibField}
  >
    Calibrar con una regla física
  </button>
</section>