<!-- CalibOverlay.svelte -->
<script lang="ts">
    import { calibrate } from "../../calibration.svelte";
  import { BASE_PX_PER_MM } from "../../constants";
  import type { ReapplyRealSizeIfActiveFn } from "../../interfaces/stageCanvas.interfaces";
    import { toolState } from "../../state.svelte";
  import { uiState } from "../../ui.svelte";
  interface Props {
    reapplyRealSizeIfActive: ReapplyRealSizeIfActiveFn;
  }
  let { reapplyRealSizeIfActive }: Props = $props();

  let calibInput = $state(60);
  function doCalibrate() {
    if (calibInput > 0) {
      calibrate({measuredMm:calibInput,toolState});
      reapplyRealSizeIfActive();
      uiState.showCalib = false;
    }
  }
</script>

{#if uiState.showCalib}
  <div class="calib-overlay">
    <div
      class="calib-box"
      style={`width:${Math.round(BASE_PX_PER_MM * 60)}px`}
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

<style>
  .calib-overlay {
    position: absolute;
    bottom: 22px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--ink);
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 14px 18px;
    z-index: 5;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
  }
  .calib-box {
    height: 16px;
    background: var(--gold);
    border-radius: 2px;
    margin-bottom: 10px;
  }
  .calib-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-dim);
    flex-wrap: wrap;
    max-width: 520px;
  }
  .calib-controls input {
    width: 90px;
  }
  @media (max-width: 700px) {
    .calib-overlay {
      left: 8px;
      right: 8px;
      bottom: 8px;

      transform: none;

      padding: 12px;
    }
    .calib-controls {
      width: 100%;
      max-width: none;

      gap: 8px;
    }

    .calib-controls input {
      width: 80px;
      min-height: 40px;
    }

    .calib-controls button {
      min-height: 40px;
    }
  }
</style>
