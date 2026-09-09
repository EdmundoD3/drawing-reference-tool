<script lang="ts">
  import { toolState } from '../state.svelte';
  import { uiState } from '../ui.svelte';
  import { fmt } from '../geometry';

  interface Props { onToggle: () => void }
  let { onToggle }: Props = $props();
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
    <span style="font-family:var(--mono); color:var(--text-dim); display:block; font-size:12px;">
      {toolState.calibrationFactor === 1
        ? 'Calibración: automática (96 dpi)'
        : `Calibración: ${fmt(toolState.calibrationFactor)}× (ajustada con regla)`}
    </span>
  </div>
  <button class="small ghost" style="width:100%;" disabled={!toolState.oriented} onclick={() => (uiState.showCalib = true)}>
    Calibrar con una regla física
  </button>
</section>
