<script lang="ts">
// RotateToggle.svelte
  import { transformState } from "../../state/transform.svelte";
  import { uiState } from "../../state/ui.svelte";

  function toggleFreeRotate() {
    uiState.freeRotateMode = !uiState.freeRotateMode;
  }
</script>

<button
  class="small rotate-toggle stage-toolbar-button"
  class:active={uiState.freeRotateMode}
  disabled={!transformState.oriented}
  aria-label="Rotación libre"
  title="Rotación libre"
  onclick={toggleFreeRotate}
>
  ⟳
</button>
