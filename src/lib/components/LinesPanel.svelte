<script lang="ts">
  // LinesPanel.svelte
  import { tick } from "svelte";

  import {
    deleteRefObject,
    renameRefObject,
    setRefObjectColor,
    setTool,
  } from "../canvas/tools";
  import { toggleRefObjectLock } from "../canvas/dragging";
  import { refObjectInfo } from "../geometry";
  import { toolState } from "../state/state.svelte";
  import { transformState } from "../state/transform.svelte";

  let myInput = $state<HTMLInputElement | null>(null);

  let editingId = $state<number | null>(null);
  let editingName = $state("");

  function startRename(id: number, current: string) {
    editingId = id;
    editingName = current;
  }

  function saveRename() {
    if (editingId === null) return;

    const name = editingName.trim();

    if (name) {
      renameRefObject(editingId, name);
    }

    editingId = null;
    editingName = "";
  }

  function cancelRename() {
    editingId = null;
    editingName = "";
  }

  function redirectFocus() {
    if (myInput) {
      myInput.focus();
    }
  }

  async function handleRename(id: number, current: string) {
    startRename(id, current);

    await tick();

    redirectFocus();
  }
</script>

<section class="panel">
  <h2>Líneas de referencia</h2>

  <span>
    usa ctrl para mover ambos puntos, usa shift (flecha arriba) para ver los
    nombres
  </span>

  <div class="btnrow">
    <button
      class="small toolbtn"
      class:active={toolState.tools.activeTool === "line-h"}
      disabled={!transformState.oriented}
      onclick={() => setTool("line-h")}
    >
      Horizontal
    </button>

    <button
      class="small toolbtn"
      class:active={toolState.tools.activeTool === "line-v"}
      disabled={!transformState.oriented}
      onclick={() => setTool("line-v")}
    >
      Vertical
    </button>
  </div>

  <div class="btnrow" style="margin-top:6px;">
    <button
      class="small toolbtn"
      class:active={toolState.tools.activeTool === "line-edge"}
      disabled={!transformState.oriented}
      onclick={() => setTool("line-edge")}
    >
      Extremo a extremo
    </button>

    <button
      class="small toolbtn"
      class:active={toolState.tools.activeTool === "line-custom"}
      disabled={!transformState.oriented}
      onclick={() => setTool("line-custom")}
    >
      Personalizada
    </button>
  </div>

  <div class="btnrow" style="margin-top:6px;">
    <button
      class="small toolbtn"
      style="width:100%;"
      class:active={toolState.tools.activeTool === "point"}
      disabled={!transformState.oriented}
      onclick={() => setTool("point")}
    >
      + Punto
    </button>
  </div>

  <div class="list">
    {#if toolState.tools.refObjects.length === 0}
      <div class="empty-hint">Sin líneas ni puntos todavía.</div>
    {:else}
      {#each toolState.tools.refObjects as o (`refObj-${o.id}`)}
        <div class="list-item">
          <div class="top">
            <span class="name-area">
              <input
                class="color-picker"
                type="color"
                value={o.color}
                title="Cambiar color"
                aria-label={`Color de ${o.name}`}
                onchange={(e) =>
                  setRefObjectColor(
                    o.id,
                    (e.currentTarget as HTMLInputElement).value,
                  )}
              />

              {#if editingId === o.id}
                <input
                  class="rename-input"
                  type="text"
                  bind:value={editingName}
                  onblur={saveRename}
                  onkeydown={(e) => {
                    if (e.key === "Enter") saveRename();
                    if (e.key === "Escape") cancelRename();
                  }}
                  bind:this={myInput}
                />
              {:else}
                <button
                  class="name-button"
                  title="Clic para renombrar"
                  onclick={() => handleRename(o.id, o.name)}
                >
                  {o.name}
                </button>
              {/if}
            </span>

            <span>
              <button
                title="Renombrar"
                onclick={() => handleRename(o.id, o.name)}
              >
                ✎
              </button>

              <button
                title={o.locked ? "Desbloquear" : "Bloquear"}
                onclick={() => toggleRefObjectLock(o.id)}
              >
                {o.locked ? "🔒" : "🔓"}
              </button>

              <button
                title="Eliminar"
                onclick={() => {
                  if (editingId === o.id) {
                    return cancelRename();
                  }

                  deleteRefObject(o.id);
                }}
              >
                ×
              </button>
            </span>
          </div>

          {#each refObjectInfo(o, toolState.scale.pxPerUnit, toolState.scale.unit) as info, index (`refObjInfo-${o.id}-${index}`)}
            <span class="val">{info}</span>
          {/each}
        </div>
      {/each}
    {/if}
  </div>
</section>

<style>
  .rename-input {
    width: auto;
    min-width: 80px;
    max-width: 150px;
    padding: 2px 4px;
    margin: -2px 0;
    font-size: 12px;
    line-height: 1.2;
    border-radius: 2px;
  }
  .name-area {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .color-picker {
    width: 14px;
    height: 14px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    overflow: hidden;
  }

  .color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-picker::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
  }
</style>
