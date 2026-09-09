<script lang="ts">
  import { toolState } from '../state.svelte';
</script>

<section class="panel">
  <h2>Referencias</h2>
  <label class="check"><input type="checkbox" bind:checked={toolState.showRulerTop} /> Regla superior</label>
  <label class="check"><input type="checkbox" bind:checked={toolState.showRulerLeft} /> Regla lateral</label>
  <label class="check"><input type="checkbox" bind:checked={toolState.showGrid} /> Grid</label>
  <div class="row" style="margin-top:8px;">
    <div class="field">
      <label for="gridRows">Filas</label>
      <input id="gridRows" type="number" min="1" max="60" bind:value={toolState.gridRows} />
    </div>
    <div class="field">
      <label for="gridCols">Columnas</label>
      <input id="gridCols" type="number" min="1" max="60" bind:value={toolState.gridCols} />
    </div>
  </div>
</section>
