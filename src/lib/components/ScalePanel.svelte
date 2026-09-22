<script lang="ts">
  import {
    otherDimensionLabel,
    presetValue,
    scalePresets,
    setScaleDim,
    setScaleUnit,
    setScaleValue,
  } from "../state/scale.svelte";

  import { toolState } from "../state/state.svelte";
  import type { ScaleDim, Unit } from "../types";
  import DimensionIndicator from "./icons/DimensionIndicator.svelte";

  interface Props {
    onScaleChange: () => void;
  }

  let { onScaleChange }: Props = $props();

  let showInfo = $state(false);

  function onDim(e: Event) {
    setScaleDim((e.target as HTMLSelectElement).value as ScaleDim);

    onScaleChange();
  }

  function onValue(e: Event) {
    setScaleValue(parseFloat((e.target as HTMLInputElement).value));

    onScaleChange();
  }

  function onUnit(e: Event) {
    setScaleUnit((e.target as HTMLSelectElement).value as Unit);

    onScaleChange();
  }

  function usePreset(value: number) {
    setScaleValue(value);
    onScaleChange();
  }

  function presetIcon(icon?: "horizontal" | "vertical") {
    if (icon === "horizontal") return "▭";
    if (icon === "vertical") return "▯";

    return "";
  }
  function imageOrientation(): "portrait" | "landscape" {
    return toolState.file.naturalW >= toolState.file.naturalH
      ? "landscape"
      : "portrait";
  }
</script>

<section class="panel">
  <h2 style="display:flex; align-items:center; gap:4px;">
    Escala de referencia

    <button
      type="button"
      aria-label="Información sobre la escala de referencia"
      aria-expanded={showInfo}
      onclick={() => (showInfo = !showInfo)}
      onmouseenter={() => (showInfo = true)}
      onmouseleave={() => (showInfo = false)}
      onfocus={() => (showInfo = true)}
      onblur={() => (showInfo = false)}
      style="
        width:18px;
        height:18px;
        padding:0;
        border:1px solid var(--text-dim);
        border-radius:50%;
        background:transparent;
        color:var(--text-dim);
        font-size:11px;
        line-height:16px;
        cursor:help;
        display:inline-flex;
        align-items:center;
        justify-content:center;
      "
    >
      i
    </button>
  </h2>

  {#if showInfo}
    <div
      style="
        margin-bottom:10px;
        padding:8px 10px;
        border:1px solid var(--border);
        border-radius:6px;
        color:var(--text-dim);
        font-size:12px;
        line-height:1.45;
      "
    >
      La medida corresponde solamente al lado seleccionado. El otro lado
      conserva la proporción original de la imagen. Los símbolos ▭ y ▯ indican
      el lado corto y largo del formato de papel; puedes aplicar cualquiera de
      ellos al ancho o al alto. La imagen no se gira ni se recorta.
    </div>
  {/if}

  <div class="field">
    <label for="scaleDim">Dimensión conocida</label>

    <div
      style="
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:6px;
  "
    >
      <button
        type="button"
        class="small"
        class:primary={toolState.scale.scaleDim === "width"}
        onclick={() => {
          setScaleDim("width");
          onScaleChange();
        }}
        style="
      display:flex;
      align-items:center;
      justify-content:center;
      gap:7px;
      min-height:44px;
    "
      >
        <DimensionIndicator
          orientation={imageOrientation()}
          dimension="width"
          size={30}
        />

        <span>Ancho</span>
      </button>

      <button
        type="button"
        class="small"
        class:primary={toolState.scale.scaleDim === "height"}
        onclick={() => {
          setScaleDim("height");
          onScaleChange();
        }}
        style="
      display:flex;
      align-items:center;
      justify-content:center;
      gap:7px;
      min-height:44px;
    "
      >
        <DimensionIndicator
          orientation={imageOrientation()}
          dimension="height"
          size={30}
        />

        <span>Alto</span>
      </button>
    </div>

    <select
      id="scaleDim"
      value={toolState.scale.scaleDim}
      onchange={onDim}
      style="display:none;"
      aria-hidden="true"
      tabindex="-1"
    >
      <option value="width">Ancho</option>
      <option value="height">Alto</option>
    </select>
  </div>

  <div class="row">
    <div class="field">
      <label for="scaleValue">Medida</label>

      <input
        id="scaleValue"
        type="number"
        step={toolState.scale.unit === "mm" ? "1" : "0.1"}
        min={toolState.scale.unit === "mm" ? "1" : "0.01"}
        value={toolState.scale.scaleValue}
        oninput={onValue}
      />
    </div>

    <div class="field">
      <label for="scaleUnit">Unidad</label>

      <select id="scaleUnit" value={toolState.scale.unit} onchange={onUnit}>
        <option value="cm">cm</option>
        <option value="mm">mm</option>
      </select>
    </div>
  </div>

  <div class="field">
    <span>Tamaños rápidos</span>

    <div
      style="
      display:grid;
      grid-template-columns:repeat(2, minmax(0, 1fr));
      gap:6px;
    "
    >
      {#each scalePresets() as preset}
        <button
          type="button"
          class="small quick-size quick-sizes-btn"
          onclick={() => usePreset(presetValue(preset))}
        >
          <DimensionIndicator
            orientation={preset.icon === "vertical" ? "portrait" : "landscape"}
            dimension={toolState.scale.scaleDim}
            size={30}
          />

          <span>
            {preset.label}
            {presetValue(preset)}
            {toolState.scale.unit}
          </span>
        </button>
      {/each}
    </div>
  </div>

  <div class="field">
    <span
      style="
        font-family:var(--mono);
        color:var(--text-dim);
        display:block;
        font-size:12px;
      "
    >
      {otherDimensionLabel()}
    </span>
  </div>
</section>

<style>
  .quick-size {
    transition:
      background-color 120ms ease,
      border-color 120ms ease,
      transform 80ms ease;
  }
  .quick-sizes-btn {
    display: flex;
    align-items: center;
    /* use flex-start por que si no se ve extraño al no tener ningun icono alineado */
    justify-content: flex-start;
    gap: 7px;
    min-height: 44px;
    flex-direction: row;
  }

  .quick-size:hover {
    background-color: var(--panel-hover);
    border-color: var(--text-dim);
  }

  .quick-size:active {
    transform: scale(0.97);
  }
</style>
