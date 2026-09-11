export interface FitNowFn { (): void };

export interface ViewportFn {
  (): {
    w: number;
    h: number;
  } | undefined;
}

export interface ReapplyRealSizeIfActiveFn { (): void };

export interface ImageCenterScreenFn {
    (): {
        x: number;
        y: number;
    }
}