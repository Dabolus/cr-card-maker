import type { DrawCanvasOptions } from './types';

export interface SetupLayoutParams {
  options: DrawCanvasOptions;
  cardBackgroundImage: HTMLImageElement | null;
}

export interface SetupLayoutResult {
  ctx: CanvasRenderingContext2D;
}

export const setupLayout = ({
  options,
  cardBackgroundImage,
}: SetupLayoutParams) => {
  const canvas = options.element ?? document.createElement('canvas');
  canvas.width = options.template.width;
  canvas.height = options.template.height;
  const ctx = canvas.getContext('2d')!;
  if (cardBackgroundImage) {
    ctx.drawImage(cardBackgroundImage, 0, 0, canvas.width, canvas.height);
  }
  return { ctx };
};
