<script lang="ts">
  import { TOOL_HINTS } from "../../constants";
  import type { FitNowFn, ViewportFn } from "../../interfaces/stageCanvas.interfaces";
  import { coordsText } from "../../shared/stageCanvas.svelte";
  import { setZoom, toolState } from "../../state.svelte";
    interface Props {
    fitNow: FitNowFn;
    viewport:ViewportFn;
  }
    let { fitNow,viewport }: Props = $props();

  function zoomInClick() {
    const { w, h } = viewport();
    setZoom(toolState.zoom * 1.25, w / 2, h / 2);
  }
  function zoomOutClick() {
    const { w, h } = viewport();
    setZoom(toolState.zoom / 1.25, w / 2, h / 2);
  }
</script>
  <div class="stage-toolbar">
    <div class="zoomctl">
      <button
        class="small"
        disabled={!toolState.oriented || toolState.realSizeActive}
        onclick={zoomOutClick}>−</button
      >
      <span class="zoomval">{Math.round(toolState.zoom * 100)}%</span>
      <button
        class="small"
        disabled={!toolState.oriented || toolState.realSizeActive}
        onclick={zoomInClick}>+</button
      >
      <button
        class="small"
        disabled={!toolState.oriented || toolState.realSizeActive}
        onclick={fitNow}>Ajustar</button
      >
    </div>
    <div class="toolhint">
      {toolState.activeTool ? TOOL_HINTS[toolState.activeTool] : ""}
    </div>
    <div class="coords">
      <span>X: <b>{coordsText.x}</b></span>
      <span>Y: <b>{coordsText.y}</b></span>
    </div>
  </div>