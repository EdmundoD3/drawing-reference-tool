// calibration.svelte.ts

import { truePxPerUnit } from "./realSize.svelte";

export type CalibrationState = {
  calibrationFactor: number;
  isCalibrated: boolean;
};

// ---------------------------------------------------------------
// Calibration configuration
// ---------------------------------------------------------------

export const BASE_PX_PER_MM =
  96 / 25.4; // CSS reference pixel assumption (96dpi)

export const CALIBRATION_REFERENCE_MM = 100;
export const RULER_REFERENCE_MM = 60;

export const CALIBRATION_STATE_DEFAULT: CalibrationState = {
  calibrationFactor: 1,
  isCalibrated: false,
};

// ---------------------------------------------------------------
// Calibration state
// ---------------------------------------------------------------

export const calibrationState = $state<CalibrationState>({
  ...CALIBRATION_STATE_DEFAULT,
});

const CALIBRATION_STORAGE_KEY = "ref001-calibration";

// ---------------------------------------------------------------
// Calibration persistence
// ---------------------------------------------------------------

function loadSavedCalibration(): boolean {
  const saved = localStorage.getItem(
    CALIBRATION_STORAGE_KEY,
  );

  if (!saved) {
    return false;
  }

  try {
    const data = JSON.parse(saved);

    if (
      typeof data.calibrationFactor !== "number" ||
      data.calibrationFactor <= 0 ||
      data.isCalibrated !== true
    ) {
      return false;
    }

    calibrationState.calibrationFactor =
      data.calibrationFactor;

    calibrationState.isCalibrated = true;

    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------
// Calibration actions
// ---------------------------------------------------------------

export function calibrate(measuredMm: number): void {
  if (measuredMm <= 0) return;

  const calibrationFactor =
    RULER_REFERENCE_MM / measuredMm;

  calibrationState.calibrationFactor = calibrationFactor;
  calibrationState.isCalibrated = true;

  localStorage.setItem(
    CALIBRATION_STORAGE_KEY,
    JSON.stringify({
      calibrationFactor,
      isCalibrated: true,
    }),
  );
}
function estimateCalibration(): void {
  const { width } = window.screen;

  let factor: number;

  if (width < 1280) {
    factor = 0.85;
  } else if (width < 1440) {
    factor = 0.90;
  } else if (width < 1600) {
    factor = 0.94;
  } else if (width < 1920) {
    factor = 0.98;
  } else if (width < 2560) {
    factor = 1.10;
  } else if (width < 3840) {
    factor = 1.20;
  } else {
    factor = 1.30;
  }

  calibrationState.calibrationFactor = factor;
  calibrationState.isCalibrated = false;
}

// ---------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------

if (!loadSavedCalibration()) {
  estimateCalibration();
}