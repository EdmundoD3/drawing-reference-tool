<script lang="ts">
  // MeasurementsPanel.svelte
  import { deleteMeasurement, setTool } from "../canvas/tools";
  import { fmt, measureDist } from "../geometry";
  import { toolState } from "../state/state.svelte";
  import { transformState } from "../state/transform.svelte";
</script>

<section class="panel">
  <h2>Mediciones</h2>

  <button
    class="primary toolbtn"
    class:active={toolState.tools.activeTool === "measure"}
    style="width:100%;"
    disabled={!transformState.oriented}
    onclick={() => setTool("measure")}
  >
    + Nueva medición
  </button>

  <div class="list">
    {#if toolState.tools.measurements.length === 0}
      <div class="empty-hint">Sin mediciones todavía.</div>
    {:else}
      {#each toolState.tools.measurements as m, i (m.id)}
        <div
          class="list-item"
          style="flex-direction: row; align-items: center; justify-content: space-between;"
        >
          <span>
            <span class="tag"></span>
            M{i + 1}

            <span class="val" style="padding-left: 8px;">
              {fmt(measureDist(m, toolState.scale.pxPerUnit).total)}
              {toolState.scale.unit}
            </span>
          </span>

          <button title="Eliminar" onclick={() => deleteMeasurement(m.id)}>
            ×
          </button>
        </div>
      {/each}
    {/if}
  </div>
</section>
