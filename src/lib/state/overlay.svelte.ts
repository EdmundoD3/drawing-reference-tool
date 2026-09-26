export type OverlayState = {
  measurements: boolean;
  lines: boolean;
  points: boolean;
  grid: boolean;
  ruler: boolean;
  vanishingPoint: boolean;
  refObjects: boolean;
};

export const overlayState = $state<OverlayState>({
  measurements: true,
  lines: true,
  points: true,
  grid: true,
  ruler: true,
  vanishingPoint: true,
  refObjects: true,
});