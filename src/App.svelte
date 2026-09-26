<script lang="ts">
  import ScalePanel from "./lib/components/ScalePanel.svelte";
  import TransformPanel from "./lib/components/TransformPanel.svelte";
  import ReferencesPanel from "./lib/components/ReferencesPanel.svelte";
  // import GoldenRatioPanel from "./lib/components/GoldenRatioPanel.svelte";
  import MeasurementsPanel from "./lib/components/MeasurementsPanel.svelte";
  import LinesPanel from "./lib/components/LinesPanel.svelte";
  import VanishingPointPanel from "./lib/components/VanishingPointPanel.svelte";
  import RealSizePanel from "./lib/components/calib/RealSizePanel.svelte";
  import ProjectPanel from "./lib/components/ProjectPanel.svelte";
  import StageCanvas from "./lib/components/StageCanvas.svelte";
  import { uiState } from "./lib/state/ui.svelte";
  import { loadSavedScale } from "./lib/state/scale.svelte";

  let stage: ReturnType<typeof StageCanvas> | undefined = $state();
  loadSavedScale();
</script>

<div class="app">
  <aside class:open={uiState.sidebarOpen} class="sidebar">
    <div class="brand">
      <div class="mark">REF · 001</div>
      <h1>Herramienta de referencias</h1>
      <p>Calca proporciones reales desde una imagen hacia tu lienzo.</p>
    </div>

    <ProjectPanel />

    <ScalePanel onScaleChange={() => stage?.reapplyRealSizeIfActive()} />

    <ReferencesPanel />

    <!-- <GoldenRatioPanel /> -->

    <MeasurementsPanel />

    <LinesPanel />

    <VanishingPointPanel />

    <TransformPanel onAfterTransform={() => stage?.fitNow()} />

    <RealSizePanel onToggle={() => stage?.toggleRealSizeNow()} />
  </aside>

  <button
    class="sidebar-backdrop"
    class:visible={uiState.sidebarOpen}
    aria-label="Cerrar menú"
    onclick={() => (uiState.sidebarOpen = false)}
  ></button>

  <StageCanvas bind:this={stage} />
</div>

<style>
  .app {
    display: grid;
    grid-template-columns: 292px minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);

    height: 100vh;
    width: 100vw;

    min-height: 0;
  }
  .sidebar {
    background: var(--ink);
    border-right: 1px solid var(--line);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .brand {
    padding: 18px 18px 14px 18px;
    border-bottom: 1px solid var(--line);
  }
  .brand .mark {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.14em;
    color: var(--cyan);
  }
  .brand h1 {
    margin: 4px 0 0 0;
    font-size: 16px;
    font-weight: 600;
  }
  .brand p {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: var(--text-dim);
    line-height: 1.4;
  }

  @media (max-width: 700px) {
    .app {
      display: flex;
      flex-direction: column;
      width: 100vw;
      height: 100dvh;
    }
    .sidebar {
      position: fixed;
      z-index: 20;

      left: 0;
      right: 0;
      bottom: 0;

      width: 100%;
      height: min(75dvh, 620px);

      border-right: none;
      border-top: 1px solid var(--line);

      transform: translateY(100%);
      transition: transform 180ms ease;
    }
    .sidebar.open {
      transform: translateY(0);
    }

    .brand {
      padding: 16px;
    }
  }
  @media (max-width: 400px) {
    .sidebar {
      height: 80dvh;
    }
  }
</style>
