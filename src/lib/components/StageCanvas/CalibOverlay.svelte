<!-- CalibOverlay.svelte -->
<script lang="ts">
  import { BASE_PX_PER_MM } from "../../constants";
  import type { ReapplyRealSizeIfActiveFn } from "../../interfaces/stageCanvas.interfaces";
  import { calibrate } from "../../state.svelte";
  import { uiState } from "../../ui.svelte";
  interface Props {
    reapplyRealSizeIfActive: ReapplyRealSizeIfActiveFn;
  }
  let { reapplyRealSizeIfActive }: Props = $props();

  let calibInput = $state(100);
  function doCalibrate() {
    if (calibInput > 0) {
      calibrate(calibInput);
      reapplyRealSizeIfActive();
      uiState.showCalib = false;
    }
  }
</script>

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
      <input type="number" step="0.1" bind:value={calibInput} /><span>mm</span>
      <button class="small primary" onclick={doCalibrate}>Calibrar</button>
      <button class="small ghost" onclick={() => (uiState.showCalib = false)}
        >Cerrar</button
      >
    </div>
  </div>
{/if}
