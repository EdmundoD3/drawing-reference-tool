<script lang="ts">
  import { toolState } from '../state/state.svelte';
</script>

<section class="panel">
  <h2>Referencias</h2>
  <label class="check"><input type="checkbox" bind:checked={toolState.tools.showRulerTop} /> Regla superior</label>
  <label class="check"><input type="checkbox" bind:checked={toolState.tools.showRulerLeft} /> Regla lateral</label>
  <label class="check"><input type="checkbox" bind:checked={toolState.tools.showGrid} /> Grid</label>
  <div class="row" style="margin-top:8px;">
    <div class="field">
      <label for="gridRows">Filas</label>
      <input id="gridRows" type="number" min="1" max="60" bind:value={toolState.tools.gridRows} />
    </div>
    <div class="field">
      <label for="gridCols">Columnas</label>
      <input id="gridCols" type="number" min="1" max="60" bind:value={toolState.tools.gridCols} />
    </div>
  </div>
</section>
