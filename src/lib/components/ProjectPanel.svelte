<script lang="ts">
// ProjectPanel.svelte
  import { loadProject, saveProject, exportPng } from "../project";
  import { toolState } from "../state/state.svelte";
  import { transformState } from "../state/transform.svelte";

  interface Props {
    onLoaded: () => void;
  }

  let { onLoaded }: Props = $props();

  let fileInput: HTMLInputElement;

  function onChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];

    if (file) {
      loadProject(file, onLoaded);
    }
  }
</script>

<section class="panel">
  <h2>Proyecto</h2>

  <div class="btnrow">
    <button
      class="small"
      disabled={!toolState.file.image}
      onclick={saveProject}
    >
      Guardar proyecto
    </button>

    <button
      class="small"
      onclick={() => fileInput.click()}
    >
      Abrir proyecto
    </button>
  </div>

  <input
    bind:this={fileInput}
    type="file"
    accept="application/json,.json"
    onchange={onChange}
  />

  <div class="btnrow" style="margin-top:10px;">
    <button
      class="small primary"
      style="width:100%;"
      disabled={!transformState.oriented}
      onclick={exportPng}
    >
      Exportar PNG
    </button>
  </div>
</section>