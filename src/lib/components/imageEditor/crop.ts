import type { Point } from "../../types";

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calcula el rectángulo de recorte más grande posible
 * para una relación de aspecto determinada.
 *
 * El rectángulo siempre queda completamente dentro
 * de la imagen.
 */
export function calculateCropRect(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number,
): CropRect {
  if (
    imageWidth <= 0 ||
    imageHeight <= 0 ||
    aspectRatio <= 0 ||
    !Number.isFinite(aspectRatio)
  ) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }

  const imageRatio =
    imageWidth / imageHeight;

  let width: number;
  let height: number;

  if (imageRatio > aspectRatio) {
    // La imagen es relativamente más ancha.
    height = imageHeight;
    width = height * aspectRatio;
  } else {
    // La imagen es relativamente más alta.
    width = imageWidth;
    height = width / aspectRatio;
  }

  return {
    x: (imageWidth - width) / 2,
    y: (imageHeight - height) / 2,
    width,
    height,
  };
}

/**
 * Mueve un rectángulo de recorte sin permitir
 * que salga de los límites de la imagen.
 */
export function moveCropRect(
  crop: CropRect,
  dx: number,
  dy: number,
  imageWidth: number,
  imageHeight: number,
): CropRect {
  const maxX =
    Math.max(0, imageWidth - crop.width);

  const maxY =
    Math.max(0, imageHeight - crop.height);

  return {
    ...crop,
    x: Math.max(
      0,
      Math.min(maxX, crop.x + dx),
    ),
    y: Math.max(
      0,
      Math.min(maxY, crop.y + dy),
    ),
  };
}