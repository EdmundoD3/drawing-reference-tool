<script lang="ts">
  import { toolState } from '../state/state.svelte';
  import { fmt } from '../geometry';
  import {
    deleteVanishingPoint,
    deleteVanishingRay,
    setTool,
  } from '../canvas/tools';
    import { transformState } from '../state/transform.svelte';
</script>

<section class="panel">
  <h2>Punto de fuga</h2>

  <button
    class="small toolbtn"
    class:active={toolState.tools.activeTool === 'vp-place'}
    style="width:100%;"
    disabled={!transformState.oriented}
    onclick={() => setTool('vp-place')}
  >
    Colocar / mover punto de fuga
  </button>

  <div class="field" style="margin-top:8px;">
    <span style="font-family:var(--mono); color:var(--text-dim); display:block; font-size:12px;">
      {#if toolState.tools.vanishingPoint}
        X: {fmt(toolState.tools.vanishingPoint.x / toolState.scale.pxPerUnit)} {toolState.scale.unit}&nbsp;&nbsp;&nbsp;Y: {fmt(toolState.tools.vanishingPoint.y / toolState.scale.pxPerUnit)} {toolState.scale.unit}
      {:else}
        —
      {/if}
    </span>
  </div>

  <div class="btnrow">
    <button
      class="small toolbtn"
      class:active={toolState.tools.activeTool === 'vp-ray'}
      disabled={!toolState.tools.vanishingPoint}
      onclick={() => setTool('vp-ray')}
    >
      + Línea desde el punto
    </button>

    <button
      class="small ghost"
      disabled={!toolState.tools.vanishingPoint}
      onclick={() => deleteVanishingPoint()}
    >
      Eliminar punto
    </button>
  </div>

  <div class="list">
    {#if !toolState.tools.vanishingPoint || toolState.tools.vpRays.length === 0}
      <div class="empty-hint">Sin líneas de fuga.</div>
    {:else}
      {#each toolState.tools.vpRays as r, i (r.id)}
        <div
          class="list-item"
          style="flex-direction: row; align-items: center; justify-content: space-between;"
        >
          <span><span class="tag"></span>Línea {i + 1}</span>
          <button title="Eliminar" onclick={() => deleteVanishingRay(r.id)}>×</button>
        </div>
      {/each}
    {/if}
  </div>
</section>
