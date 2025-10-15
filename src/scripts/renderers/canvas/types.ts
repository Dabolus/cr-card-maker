import type { RendererBaseOptions } from '../types';

export type DrawCanvasOptions = RendererBaseOptions & {
  /**
   * The canvas element to draw on.
   * If not provided, a new canvas element will be created and returned.
   */
  element?: HTMLCanvasElement;
  /**
   * The page number to render (1-based).
   * If not provided, the first page will be rendered.
   */
  page?: number;
};

export interface DrawCanvasPartParams {
  options: DrawCanvasOptions;
  ctx: CanvasRenderingContext2D;
  page: number;
}
