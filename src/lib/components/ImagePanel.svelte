<script lang="ts">
  import { loadImageFile } from "../state/image.svelte";
  import { loadProject } from "../project";
  import { toolState } from "../state/state.svelte";

  interface Props {
    onLoaded: () => void;
  }

  let { onLoaded }: Props = $props();

  let fileInput: HTMLInputElement;

  function onChange(e: Event) {
    const file =
      (e.target as HTMLInputElement).files?.[0];

    if (!file) return;

    const isProject =
      file.name.toLowerCase().endsWith(".json");

    if (isProject) {
      loadProject(file, onLoaded);
    } else {
      loadImageFile(file, onLoaded);
    }

    fileInput.value = "";
  }
</script>

<section class="panel">
  <h2>Imagen</h2>

  <div class="btnrow">
    <button
      class="small"
      onclick={() => fileInput.click()}
    >
      Abrir
    </button>
  </div>

  {#if toolState.file.fileName}
    <div class="filename">
      {toolState.file.fileName}
    </div>
  {/if}

  <input
    bind:this={fileInput}
    type="file"
    accept="image/png,image/jpeg,image/webp,application/json,.json"
    onchange={onChange}
  />
</section>