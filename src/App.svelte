<script lang="ts">
  import ImagePanel from './lib/components/ImagePanel.svelte';
  import ScalePanel from './lib/components/ScalePanel.svelte';
  import TransformPanel from './lib/components/TransformPanel.svelte';
  import ReferencesPanel from './lib/components/ReferencesPanel.svelte';
  import GoldenRatioPanel from './lib/components/GoldenRatioPanel.svelte';
  import MeasurementsPanel from './lib/components/MeasurementsPanel.svelte';
  import LinesPanel from './lib/components/LinesPanel.svelte';
  import VanishingPointPanel from './lib/components/VanishingPointPanel.svelte';
  import RealSizePanel from './lib/components/RealSizePanel.svelte';
  import ProjectPanel from './lib/components/ProjectPanel.svelte';
  import StageCanvas from './lib/components/StageCanvas.svelte';

  let stage: ReturnType<typeof StageCanvas> | undefined = $state();
</script>

<div class="app">
  <aside class="sidebar">
    <div class="brand">
      <div class="mark">REF · 001</div>
      <h1>Herramienta de referencias</h1>
      <p>Calca proporciones reales desde una imagen hacia tu lienzo.</p>
    </div>

    <ImagePanel onLoaded={() => stage?.fitNow()} />
    <ScalePanel onScaleChange={() => stage?.reapplyRealSizeIfActive()} />
    <TransformPanel onAfterTransform={() => stage?.fitNow()} />
    <ReferencesPanel />
    <!-- <GoldenRatioPanel /> -->
    <MeasurementsPanel />
    <LinesPanel />
    <VanishingPointPanel />
    <RealSizePanel onToggle={() => stage?.toggleRealSizeNow()} />
    <ProjectPanel onLoaded={() => stage?.fitNow()} />
  </aside>

  <StageCanvas bind:this={stage} />
</div>
