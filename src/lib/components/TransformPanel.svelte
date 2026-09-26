<script lang="ts">
// TransformPanel.svelte
  import { uiState } from "../state/ui.svelte";
  import { fmt } from "../geometry";
  import {
    flipHorizontal,
    flipVertical,
    resetTransform,
    rotate,
    setRotation,
  } from "../state/image.svelte";
  import { transformState } from "../state/transform.svelte";

  interface Props {
    onAfterTransform: () => void;
  }
  let { onAfterTransform }: Props = $props();

function go(fn: () => void) {
  fn();
  onAfterTransform();
}

  function toggleFreeRotate() {
    uiState.freeRotateMode = !uiState.freeRotateMode;
    if (!uiState.freeRotateMode) onAfterTransform(); // re-fit once the handle is put away
  }

  const TITLE = {
    panel: "Transformar",
    girar90gradosIzquierda: "⟲ 90°",
    girar90gradosDerecha: "⟳ 90°",
    voltearH: "Voltear H",
    voltearV: "Voltear V",
    rotarLibremente: "✋ Rotar libremente",
    anguloLibre: "Ángulo libre:",
    quitarRotacion: "Quitar rotación libre",
    reset: "Reset vista",
  };

  export function clearRotation() {
    if (transformState.rotation !== 0) {
      setRotation(0);
    }
  }
</script>

<section class="panel">
  <h2>{TITLE.panel}</h2>

  <div class="btnrow">
    <button
      class="small"
      disabled={!transformState.oriented}
      onclick={() => go(() => rotate(-90))}
    >
      {TITLE.girar90gradosIzquierda}
    </button>

    <button
      class="small"
      disabled={!transformState.oriented}
      onclick={() => go(() => rotate(90))}
    >
      {TITLE.girar90gradosDerecha}
    </button>

    <button
      class="small"
      disabled={!transformState.oriented}
      onclick={() => go(flipHorizontal)}
    >
      {TITLE.voltearH}
    </button>

    <button
      class="small"
      disabled={!transformState.oriented}
      onclick={() => go(flipVertical)}
    >
      {TITLE.voltearV}
    </button>
  </div>

  <div class="btnrow" style="margin-top:6px;">
    <button
      class="small toolbtn"
      class:active={uiState.freeRotateMode}
      style="width:100%;"
      disabled={!transformState.oriented}
      onclick={toggleFreeRotate}
    >
      {TITLE.rotarLibremente}
    </button>
  </div>

  {#if transformState.rotation !== 0}
    <div class="field" style="margin-top:8px;">
      <span
        style="font-family:var(--mono); color:var(--text-dim); display:block; font-size:12px;"
      >
        {TITLE.anguloLibre}
        {fmt(transformState.rotation)}°
      </span>
    </div>

    <div class="btnrow" style="margin-top:6px;">
      <button
        class="small ghost"
        style="width:100%;"
        onclick={() => go(clearRotation)}
      >
        {TITLE.quitarRotacion}
      </button>
    </div>
  {/if}

  <div class="btnrow" style="margin-top:6px;">
    <button
      class="small ghost"
      style="width:100%;"
      onclick={() => {
        uiState.freeRotateMode = false;
        go(resetTransform);
      }}
    >
      {TITLE.reset}
    </button>
  </div>
</section>
