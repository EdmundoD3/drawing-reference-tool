// calibration.svelte.ts

const CALIBRATION_STORAGE_KEY = "ref001-calibration";
export type TCalibration = {
    calibrationFactor: number;
    isCalibrated: boolean;
};

export const calibrationDefault: TCalibration = {
    calibrationFactor: 1,
    isCalibrated: false,
};

export function loadSavedCalibration(toolState: TCalibration) {
    const saved = localStorage.getItem(CALIBRATION_STORAGE_KEY);

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

        toolState.calibrationFactor = data.calibrationFactor;
        toolState.isCalibrated = data.isCalibrated;

        return true;
    } catch {
        return false;
    }
}

export function calibrate({
    measuredMm,
    toolState
}: {
    toolState: TCalibration;
    measuredMm: number;
}) {
    if (measuredMm <= 0) return;

    const calibrationFactor = 60 / measuredMm;

    toolState.calibrationFactor = calibrationFactor;
    toolState.isCalibrated = true;

    localStorage.setItem(
        CALIBRATION_STORAGE_KEY,
        JSON.stringify({
            calibrationFactor,
            isCalibrated: true,
        }),
    );
}

export function estimateCalibration(toolState: TCalibration) {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    let calibrationFactor = 1.15;

    if (isMobile) {
        if (screen.width <= 360) {
            calibrationFactor = 1.7;
        } else if (screen.width <= 480) {
            calibrationFactor = 1.6;
        } else {
            calibrationFactor = 1.5;
        }
    }

    toolState.calibrationFactor = calibrationFactor;
    toolState.isCalibrated = false;
}