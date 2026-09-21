<script lang="ts">
  import { loadImageFile } from "../state/image.svelte";
  import { toolState } from "../state/state.svelte";

  interface Props {
    onLoaded: () => void;
  }

  let { onLoaded }: Props = $props();

  let fileInput: HTMLInputElement;

  function onChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];

    if (file) {
      loadImageFile(file, onLoaded);
    }
  }
</script>

<section class="panel">
  <h2>Imagen</h2>

  <div class="btnrow">
    <button
      class="small"
      onclick={() => fileInput.click()}
    >
      Cargar imagen
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
    accept="image/png,image/jpeg,image/webp"
    onchange={onChange}
  />
</section>
