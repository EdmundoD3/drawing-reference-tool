<script lang="ts">
  import { saveProject, exportPng } from "../project";
  import { toolState } from "../state/state.svelte";
  import { transformState } from "../state/transform.svelte";
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
  </div>

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