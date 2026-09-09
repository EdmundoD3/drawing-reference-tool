<script lang="ts">
  import { toolState, setTool, deleteMeasurement } from '../state.svelte';
  import { fmt, measureDist } from '../geometry';
</script>

<section class="panel">
  <h2>Mediciones</h2>
  <button
    class="primary toolbtn"
    class:active={toolState.activeTool === 'measure'}
    style="width:100%;"
    disabled={!toolState.oriented}
    onclick={() => setTool('measure')}
  >
    + Nueva medición
  </button>
  <div class="list">
    {#if toolState.measurements.length === 0}
      <div class="empty-hint">Sin mediciones todavía.</div>
    {:else}
      {#each toolState.measurements as m, i (m.id)}
        <div class="list-item" style="flex-direction: row; align-items: center; justify-content: space-between;">
          <span><span class="tag"></span>M{i + 1}
            <span class="val" style="padding-left: 8px;">{fmt(measureDist(m, toolState.pxPerUnit).total)} {toolState.unit}</span>
          </span>
          <button title="Eliminar" onclick={() => deleteMeasurement(m.id)}>×</button>
        </div>
      {/each}
    {/if}
  </div>
</section>
