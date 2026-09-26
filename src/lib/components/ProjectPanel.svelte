<script lang="ts">
// ProjectPanel.svelte
  import { saveProject, exportPng } from "../project";
  import { fileInput } from "../shared/stageCanvas.svelte";
  import { toolState } from "../state/state.svelte";
  import { transformState } from "../state/transform.svelte";
    import { uiState } from "../state/ui.svelte";
</script>

<section class="panel">
  <h2>Archivo</h2>

  <div class="btnrow">
    <button
      class="small"
      onclick={() => {
        fileInput.value?.click();
        uiState.sidebarOpen = false;
      }}
    >
      Abrir
    </button>
  </div>

  <div class="btnrow miniTop">
    <button
      class="small"
      disabled={!toolState.file.image}
      onclick={saveProject}
    >
      Guardar proyecto
    </button>
  </div>

  <div class="btnrow miniTop">
    <button
      class="small primary all-width"
      disabled={!transformState.oriented}
      onclick={exportPng}
    >
      Exportar PNG
    </button>
  </div>
  {#if toolState.file.fileName}
    <div class="filename">
      {toolState.file.fileName}
    </div>
  {/if}
</section>

<style>
  .miniTop {
    margin-top: 10px;
  }
  .all-width {
    width: 100%;
  }
</style>
