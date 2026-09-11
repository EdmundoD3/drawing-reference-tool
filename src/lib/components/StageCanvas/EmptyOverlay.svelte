<script lang="ts">
  import { fileInput } from "../../shared/stageCanvas.svelte";
  import { toolState } from "../../state.svelte";
</script>

{#if !toolState.oriented}
  <div class="empty-overlay">
    <button type="button" class="box" onclick={() => fileInput.value?.click()}>
      <strong>Sin imagen cargada</strong>
      Arrastra una imagen aquí<br />o haz clic para seleccionarla
    </button>
  </div>
{/if}
