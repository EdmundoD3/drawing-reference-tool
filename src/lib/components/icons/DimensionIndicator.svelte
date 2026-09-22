<script lang="ts">
  type Orientation = "portrait" | "landscape";
  type Dimension = "width" | "height";

  interface Props {
    orientation?: Orientation;
    dimension?: Dimension;
    size?: number;
  }

  let {
    orientation = "portrait",
    dimension = "width",
    size = 30,
  }: Props = $props();
  const isPortrait = $derived(orientation === "portrait");
  const isWidth = $derived(dimension === "width");

  // La hoja cambia de proporción según su orientación.
  const sheetWidth = $derived(isPortrait ? 16 : 24);
  const sheetHeight = $derived(isPortrait ? 24 : 16);

  const padding = 5;
  const ruleSpace = 5;

  const svgWidth = $derived(
    sheetWidth + padding * 2 + (isWidth ? 0 : ruleSpace),
  );

  const svgHeight = $derived(
    sheetHeight + padding * 2 + (isWidth ? ruleSpace : 0),
  );

  const scale = $derived(size / Math.max(svgWidth, svgHeight));

  // Posición de la hoja.
  const sheetX = $derived(isWidth ? padding : padding + ruleSpace);

  const sheetY = $derived(isWidth ? padding + ruleSpace : padding);

  // Regla superior para ancho.
  const horizontalRuleY = $derived(sheetY - 2);

  // Regla izquierda para alto.
  const verticalRuleX = $derived(sheetX - 2);
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
  width={svgWidth * scale}
  height={svgHeight * scale}
  fill="none"
  aria-hidden="true"
  style="display:block; flex:none;"
>
  <!-- Hoja -->
  <rect
    x={sheetX}
    y={sheetY}
    width={sheetWidth}
    height={sheetHeight}
    rx="1.5"
    stroke="currentColor"
    stroke-opacity="0.55"
    stroke-width="1.4"
  />

  {#if isWidth}
    <!-- Regla superior -->
    <line
      x1={sheetX}
      y1={horizontalRuleY}
      x2={sheetX + sheetWidth}
      y2={horizontalRuleY}
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
    />

    <!-- Graduaciones -->
    <line
      x1={sheetX + sheetWidth * 0.25}
      y1={horizontalRuleY}
      x2={sheetX + sheetWidth * 0.25}
      y2={horizontalRuleY + 2.5}
      stroke="currentColor"
      stroke-width="0.8"
      stroke-linecap="round"
    />

    <line
      x1={sheetX + sheetWidth * 0.5}
      y1={horizontalRuleY}
      x2={sheetX + sheetWidth * 0.5}
      y2={horizontalRuleY + 3}
      stroke="currentColor"
      stroke-width="0.8"
      stroke-linecap="round"
    />

    <line
      x1={sheetX + sheetWidth * 0.75}
      y1={horizontalRuleY}
      x2={sheetX + sheetWidth * 0.75}
      y2={horizontalRuleY + 2.5}
      stroke="currentColor"
      stroke-width="0.8"
      stroke-linecap="round"
    />
  {:else}
    <!-- Regla izquierda -->
    <line
      x1={verticalRuleX}
      y1={sheetY}
      x2={verticalRuleX}
      y2={sheetY + sheetHeight}
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
    />

    <!-- Graduaciones -->
    <line
      x1={verticalRuleX}
      y1={sheetY + sheetHeight * 0.25}
      x2={verticalRuleX + 2.5}
      y2={sheetY + sheetHeight * 0.25}
      stroke="currentColor"
      stroke-width="0.8"
      stroke-linecap="round"
    />

    <line
      x1={verticalRuleX}
      y1={sheetY + sheetHeight * 0.5}
      x2={verticalRuleX + 3}
      y2={sheetY + sheetHeight * 0.5}
      stroke="currentColor"
      stroke-width="0.8"
      stroke-linecap="round"
    />

    <line
      x1={verticalRuleX}
      y1={sheetY + sheetHeight * 0.75}
      x2={verticalRuleX + 2.5}
      y2={sheetY + sheetHeight * 0.75}
      stroke="currentColor"
      stroke-width="0.8"
      stroke-linecap="round"
    />
  {/if}
</svg>
