<script lang="ts">
  import { toolState, setTool, deleteRefObject, renameRefObject } from '../state.svelte';
  import { refObjectInfo } from '../geometry';

  function rename(id: number, current: string) {
    const n = prompt('Nombre:', current);
    if (n && n.trim()) renameRefObject(id, n);
  }
</script>

<section class="panel">
  <h2>Líneas de referencia</h2>
  <div class="btnrow">
    <button class="small toolbtn" class:active={toolState.activeTool === 'line-h'} disabled={!toolState.oriented} onclick={() => setTool('line-h')}>Horizontal</button>
    <button class="small toolbtn" class:active={toolState.activeTool === 'line-v'} disabled={!toolState.oriented} onclick={() => setTool('line-v')}>Vertical</button>
  </div>
  <div class="btnrow" style="margin-top:6px;">
    <button class="small toolbtn" class:active={toolState.activeTool === 'line-edge'} disabled={!toolState.oriented} onclick={() => setTool('line-edge')}>Extremo a extremo</button>
    <button class="small toolbtn" class:active={toolState.activeTool === 'line-custom'} disabled={!toolState.oriented} onclick={() => setTool('line-custom')}>Personalizada</button>
  </div>
  <div class="btnrow" style="margin-top:6px;">
    <button class="small toolbtn" style="width:100%;" class:active={toolState.activeTool === 'point'} disabled={!toolState.oriented} onclick={() => setTool('point')}>+ Punto</button>
  </div>
  <div class="list">
    {#if toolState.refObjects.length === 0}
      <div class="empty-hint">Sin líneas ni puntos todavía.</div>
    {:else}
      {#each toolState.refObjects as o (o.id)}
        <div class="list-item">
          <div class="top">
            <span><span class="tag cyan"></span>{o.name}</span>
            <span>
              <button title="Renombrar" onclick={() => rename(o.id, o.name)}>✎</button>
              <button title="Eliminar" onclick={() => deleteRefObject(o.id)}>×</button>
            </span>
          </div>
          <div class="val">{refObjectInfo(o, toolState.pxPerUnit, toolState.unit)}</div>
        </div>
      {/each}
    {/if}
  </div>
</section>
