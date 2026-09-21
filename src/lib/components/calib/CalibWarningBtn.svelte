<script lang="ts">
  // CalibWarningBtn.svelte
  import { calibrationState } from "../../state/calibration.svelte";
  import { toolState } from "../../state/state.svelte";
  import { uiState } from "../../state/ui.svelte";

  interface Props {
    onToggle: () => void;
  }

  let { onToggle }: Props = $props();

  function showCalibrationWarning() {
    uiState.showCalibrationWarning = true;
  }
</script>

{#if calibrationState.isCalibrated}
  <button
    class="small"
    class:active={toolState.view.realSizeActive}
    aria-label="Mostrar tamaño real"
    title="Mostrar tamaño real en pantalla"
    onclick={onToggle}
  >
    1:1
  </button>
{/if}

{#if !calibrationState.isCalibrated}
  <button
    class="small calibration-warning"
    aria-label="Pantalla sin calibrar"
    title="Pantalla sin calibrar"
    onclick={showCalibrationWarning}
  >
    ⚠
  </button>

  {#if uiState.showCalibrationWarning && !uiState.showCalib}
    <div class="calibration-warning-popup">
      <p>
        La pantalla todavía no está calibrada. El tamaño real mostrado puede
        tener cierta diferencia respecto a una medida física.
      </p>

      <div>
        <button
          class="small primary"
          onclick={() => {
            uiState.showCalibrationWarning = false;
            uiState.showCalib = true;
          }}
        >
          Calibrar
        </button>

        <button
          class="small ghost"
          onclick={() => (uiState.showCalibrationWarning = false)}
        >
          Cancelar
        </button>
      </div>
    </div>
  {/if}
{/if}
<style>
  .calibration-warning-popup {
    position: fixed;
    top: 60px;
    right: 12px;
    width: min(320px, calc(100vw - 24px));
    padding: 14px;
    background: var(--ink);
    border: 1px solid var(--line);
    border-radius: 6px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
    z-index: 100;
  }
  @media (max-width: 700px) {
    .calibration-warning-popup {
      top: 56px;
      left: 8px;
      right: 8px;
      width: auto;
    }
  }
</style>
