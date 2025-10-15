import type { DrawCanvasPartParams } from './types';

export interface DrawPageBackgroundParams extends DrawCanvasPartParams {
  pageBackgroundImage: HTMLImageElement | null;
}

export const drawPageBackground = ({
  options,
  ctx,
  page,
  pageBackgroundImage,
}: DrawPageBackgroundParams) => {
  const pageOptions = options.template.pages?.[page - 1];
  if (!pageOptions || !pageBackgroundImage) {
    return;
  }
  ctx.drawImage(
    pageBackgroundImage,
    pageOptions.x,
    pageOptions.y,
    pageOptions.width,
    pageOptions.height,
  );
};
