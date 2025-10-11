import { getCanvasColor, wrapText } from './utils';
import type { DrawCanvasPartParams } from './types';

export const drawDescription = ({ options, ctx }: DrawCanvasPartParams) => {
  ctx.save();
  ctx.font = `${options.template.fields.description.fontSize}px "SC CCBackBeat"`;
  // Alignment
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = getCanvasColor(
    ctx,
    options.template.fields.description.color,
  );

  wrapText(
    ctx,
    options.description,
    options.template.fields.description.x,
    options.template.fields.description.y,
    options.template.fields.description.maxWidth,
    options.template.fields.description.lineHeight,
  );
  ctx.restore();
};
