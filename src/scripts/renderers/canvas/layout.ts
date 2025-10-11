import type { DrawCanvasOptions } from './types';

export interface SetupLayoutParams {
  options: DrawCanvasOptions;
  backgroundImage: HTMLImageElement;
}

export interface SetupLayoutResult {
  ctx: CanvasRenderingContext2D;
}

export const setupLayout = ({
  options,
  backgroundImage,
}: SetupLayoutParams) => {
  const canvas = options.element ?? document.createElement('canvas');
  canvas.width = options.template.width;
  canvas.height = options.template.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  return { ctx };
};
