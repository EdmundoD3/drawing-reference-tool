<script lang="ts">
  import { toolState, setTool, deleteVanishingRay, deleteVanishingPoint } from '../state.svelte';
  import { fmt } from '../geometry';
</script>

<section class="panel">
  <h2>Punto de fuga</h2>
  <button
    class="small toolbtn"
    class:active={toolState.activeTool === 'vp-place'}
    style="width:100%;"
    disabled={!toolState.oriented}
    onclick={() => setTool('vp-place')}
  >
    Colocar / mover punto de fuga
  </button>
  <div class="field" style="margin-top:8px;">
    <span style="font-family:var(--mono); color:var(--text-dim); display:block; font-size:12px;">
      {#if toolState.vanishingPoint}
        X: {fmt(toolState.vanishingPoint.x / toolState.pxPerUnit)} {toolState.unit}&nbsp;&nbsp;&nbsp;Y: {fmt(toolState.vanishingPoint.y / toolState.pxPerUnit)} {toolState.unit}
      {:else}
        —
      {/if}
    </span>
  </div>
  <div class="btnrow">
    <button class="small toolbtn" class:active={toolState.activeTool === 'vp-ray'} disabled={!toolState.vanishingPoint} onclick={() => setTool('vp-ray')}>+ Línea desde el punto</button>
    <button class="small ghost" disabled={!toolState.vanishingPoint} onclick={() => deleteVanishingPoint()}>Eliminar punto</button>
  </div>
  <div class="list">
    {#if !toolState.vanishingPoint || toolState.vpRays.length === 0}
      <div class="empty-hint">Sin líneas de fuga.</div>
    {:else}
      {#each toolState.vpRays as r, i (r.id)}
        <div class="list-item" style="flex-direction: row; align-items: center; justify-content: space-between;">
          <span><span class="tag"></span>Línea {i + 1}</span>
          <button title="Eliminar" onclick={() => deleteVanishingRay(r.id)}>×</button>
        </div>
      {/each}
    {/if}
  </div>
</section>
