<script lang="ts">
    import type { Snippet } from "svelte";

interface Props {
  title: string;
  summary?: Snippet;
  children: Snippet;
}

let { title, summary, children }: Props = $props();

let isOpen = $state(true);

</script>

<section class="panel">
  <div class="collapse-header">
    <button
      type="button"
      class="collapse-toggle"
      aria-expanded={isOpen}
      onclick={() => (isOpen = !isOpen)}
    >
      <span class="collapse-title">
        <span>{title}</span>

        {#if summary && !isOpen}
          <span class="collapse-summary">
            {@render summary()}
          </span>
        {/if}
      </span>

      <span
        class="collapse-icon"
        class:open={isOpen}
        aria-hidden="true"
      >
        ›
      </span>
    </button>
  </div>

  {#if isOpen}
    <div class="collapse-content">
      {@render children()}
    </div>
  {/if}
</section>

<style>
.collapse-header {
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.collapse-toggle {
  min-width: 0;
  flex: 1;
  min-height: 44px;
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font: inherit;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.collapse-title {
  min-width: 0;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
}

.collapse-summary {
  color: var(--text-dim);
  font-size: 12px;
  font-weight: 400;
}
.collapse-icon {
  width: 24px;
  height: 24px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  line-height: 1;
  color: var(--text-dim);
  transform: rotate(0deg);
  transition: transform 120ms ease;
}

.collapse-icon.open {
  transform: rotate(90deg);
}

.collapse-content {
  padding-top: 4px;
}
</style>
