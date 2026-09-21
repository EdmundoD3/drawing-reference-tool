<script lang="ts">
  import { toolState } from "../state/state.svelte";
</script>

<section class="panel">
  <h2>Proporción áurea</h2>

  <div class="field">
    <label for="goldenMode">Modo</label>

    <select
      id="goldenMode"
      bind:value={toolState.tools.goldenMode}
    >
      <option value="none">Desactivada</option>
      <option value="vertical">Vertical</option>
      <option value="horizontal">Horizontal</option>
      <option value="both">Ambas direcciones</option>
      <option value="spiral">Espiral áurea</option>
    </select>
  </div>
</section>
