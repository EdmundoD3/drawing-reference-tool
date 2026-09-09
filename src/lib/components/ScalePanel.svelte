<script lang="ts">
  import { otherDimensionLabel, setScaleDim, setScaleUnit, setScaleValue, toolState } from '../state.svelte';
  import type { ScaleDim, Unit } from '../types';

  interface Props { onScaleChange: () => void }
  let { onScaleChange }: Props = $props();

  function onDim(e: Event) { setScaleDim((e.target as HTMLSelectElement).value as ScaleDim); onScaleChange(); }
  function onValue(e: Event) { setScaleValue(parseFloat((e.target as HTMLInputElement).value)); onScaleChange(); }
  function onUnit(e: Event) { setScaleUnit((e.target as HTMLSelectElement).value as Unit); onScaleChange(); }
</script>

<section class="panel">
  <h2>Escala de referencia</h2>
  <div class="field">
    <label for="scaleDim">Dimensión conocida</label>
    <select id="scaleDim" value={toolState.scaleDim} onchange={onDim}>
      <option value="width">Ancho</option>
      <option value="height">Alto</option>
    </select>
  </div>
  <div class="row">
    <div class="field">
      <label for="scaleValue">Medida</label>
      <input id="scaleValue" type="number" step="0.1" min="0.01"
        value={toolState.scaleValue}
        oninput={onValue} />
    </div>
    <div class="field">
      <label for="scaleUnit">Unidad</label>
      <select id="scaleUnit" value={toolState.unit} onchange={onUnit}>
        <option value="cm">cm</option>
        <option value="mm">mm</option>
      </select>
    </div>
  </div>
  <div class="field">
    <span style="font-family: var(--mono); color: var(--text-dim); display:block; font-size:12px;">{otherDimensionLabel()}</span>
  </div>
</section>
