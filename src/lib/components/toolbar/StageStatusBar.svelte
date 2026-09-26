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

<style>
  .stage-status {
    height: 30px;
    flex: 0 0 auto;

    display: flex;
    align-items: center;

    padding: 0 10px;

    background: var(--ink);
    border-top: 1px solid var(--line);

    font-family: var(--mono);
    font-size: 11px;
    color: var(--text-dim);
  }

  .stage-status .coords {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .stage-status .coords span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .stage-status .coords b {
    color: var(--cyan);
    font-weight: 500;
  }

  .stage-status .zoom-status {
    margin-left: auto;

    display: inline-flex;
    align-items: center;
    gap: 5px;

    color: var(--text);
  }

  .stage-status .zoom-status svg {
    width: 15px;
    height: 15px;

    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
