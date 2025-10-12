import { computeTextLines, drawMultilineText, getCanvasColor } from './utils';
import type { DrawCanvasPartParams } from './types';
import type {
  $Schema as TemplateSchema,
  TextBaseline,
} from '../../../templates/generated/types';

const computeStartY = (
  textBaseline: TextBaseline,
  descriptionOptions: NonNullable<TemplateSchema['fields']['description']>,
  totalHeight: number,
) => {
  if (textBaseline === 'middle' || textBaseline === 'bottom') {
    const maxHeight =
      descriptionOptions.maxLines * descriptionOptions.lineHeight - totalHeight;
    const offsetY = textBaseline === 'middle' ? maxHeight / 2 : maxHeight;
    return Math.max(descriptionOptions.y + offsetY, descriptionOptions.y);
  } else {
    return descriptionOptions.y;
  }
};

export const drawDescription = ({ options, ctx }: DrawCanvasPartParams) => {
  const descriptionOptions = options.template.fields.description;
  if (!descriptionOptions) {
    return;
  }
  ctx.save();
  ctx.font = `${descriptionOptions.fontSize}px "SC CCBackBeat"`;
  // Alignment
  ctx.textAlign = descriptionOptions.textAlign || 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = getCanvasColor(ctx, descriptionOptions.color);

  const lines = computeTextLines(
    ctx,
    options.description,
    descriptionOptions.maxWidth,
  );
  const totalHeight = lines.length * descriptionOptions.lineHeight;
  const startY = computeStartY(
    descriptionOptions.textBaseline || 'top',
    descriptionOptions,
    totalHeight,
  );
  drawMultilineText(
    ctx,
    lines.slice(0, descriptionOptions.maxLines),
    descriptionOptions.x,
    startY,
    descriptionOptions.lineHeight,
  );
  ctx.restore();
};
