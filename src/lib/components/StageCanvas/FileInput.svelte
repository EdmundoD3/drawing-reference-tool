<script lang="ts">
  import type { FitNowFn } from "../../interfaces/stageCanvas.interfaces";
  import { fileInput } from "../../shared/stageCanvas.svelte";
    import { loadImageFile } from "../../state/image.svelte";

  interface Props {
    fitNow: FitNowFn;
  }

  let { fitNow }: Props = $props();



  function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) loadImageFile(file, fitNow);
  }
</script>

<input
  bind:this={fileInput.value}
  type="file"
  accept="image/png,image/jpeg,image/webp"
  onchange={onFileChange}
/>