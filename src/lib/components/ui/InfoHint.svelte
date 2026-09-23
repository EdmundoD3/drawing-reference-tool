<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  let showInfo = $state(false);
</script>

<div class="info-text" class:show-info={showInfo}>
  <button
    type="button"
    class="info-button"
    aria-label="Mostrar información"
    aria-expanded={showInfo}
    onclick={() => (showInfo = !showInfo)}
  >
    i
  </button>

  <span>
    {@render children()}
  </span>
</div>

<style>
.info-text {
  margin-bottom: 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-dim);
  font-size: 12px;
  line-height: 1.45;

  display: flex;
  align-items: flex-start;
  gap: 7px;
}

.info-text span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-text.show-info span {
  white-space: normal;
  overflow: visible;
}

.info-button {
    width: 18px;
    height: 18px;
    min-width: 18px;
    min-height: 18px;
    max-width: 18px;
    max-height: 18px;

    padding: 0;
    margin: 0;
    flex: 0 0 18px;

    box-sizing: border-box;

    border: 1px solid var(--text-dim);
    border-radius: 50%;

    background: transparent;
    color: var(--text-dim);

    font-size: 11px;
    line-height: 1;

    cursor: help;

    display: inline-flex;
    align-items: center;
    justify-content: center;
}

</style>
