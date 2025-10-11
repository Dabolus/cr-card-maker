import type { RendererBaseOptions } from '../types';

export type DrawCanvasOptions = RendererBaseOptions & {
  /**
   * The canvas element to draw on.
   * If not provided, a new canvas element will be created and returned.
   */
  element?: HTMLCanvasElement;
};

export interface DrawCanvasPartParams {
  options: DrawCanvasOptions;
  ctx: CanvasRenderingContext2D;
}
