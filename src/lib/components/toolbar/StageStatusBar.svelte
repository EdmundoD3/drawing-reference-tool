<script lang="ts">
  import { coordsText } from "../../shared/stageCanvas.svelte";
  import { toolState } from "../../state/state.svelte";
</script>

<div class="stage-status">
  <div class="coords">
    <span>X <b>{coordsText.x}</b></span>
    <span>Y <b>{coordsText.y}</b></span>
  </div>

  <div class="zoom-status" aria-label="Zoom">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M16 16l5 5" />
    </svg>

    <span>
      {Math.round(toolState.view.zoom * 100)}%
    </span>
  </div>
</div>