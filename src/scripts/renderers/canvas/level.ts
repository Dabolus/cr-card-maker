import { t } from '../../i18n';
import { getCanvasColor } from './utils';
import { getTemplateField } from '../shared';
import type { DrawCanvasPartParams } from './types';

export const drawLevel = ({ options, ctx, page }: DrawCanvasPartParams) => {
  const levelField = getTemplateField(options.template, 'level', page);

  if (!levelField) {
    return;
  }

  const i18n =
    options.template.i18n?.[
      options.language as keyof typeof options.template.i18n
    ] ?? {};

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'hanging';
  ctx.strokeStyle = 'black';
  ctx.shadowColor = 'black';
  ctx.lineWidth = levelField.fontSize * 0.1;
  ctx.shadowOffsetY = levelField.fontSize * 0.07;
  ctx.font = `${levelField.fontSize}px "Supercell Magic"`;
  const localizedLevel = t('level', options, i18n);
  const levelFontSize = ctx.measureText(localizedLevel);
  ctx.fillStyle = getCanvasColor(ctx, levelField.color, {
    rarity: options.rarity,
    gradientX: levelField.x,
    gradientY: levelField.y,
    gradientWidth: levelFontSize.width,
  });
  ctx.strokeText(localizedLevel, levelField.x, levelField.y);
  ctx.fillText(localizedLevel, levelField.x, levelField.y);
  ctx.restore();
};
