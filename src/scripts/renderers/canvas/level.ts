import { t } from '../../i18n';
import { fitFontSize, getCanvasColor } from './utils';
import type { DrawCanvasPartParams } from './types';

export const drawLevel = ({ options, ctx }: DrawCanvasPartParams) => {
  if (!options.template.fields.level) {
    return;
  }

  const i18n =
    options.template.i18n?.[
      options.language as keyof typeof options.template.i18n
    ] ?? {};

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'hanging';
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'black';
  ctx.shadowOffsetY = options.template.fields.level.fontSize * 0.07;
  ctx.shadowColor = 'black';
  ctx.font = `${options.template.fields.level.fontSize}px "Supercell Magic"`;
  const localizedCardName = t('level', options, i18n);
  const cardNameFontSize = ctx.measureText(localizedCardName);
  ctx.fillStyle = getCanvasColor(ctx, options.template.fields.level.color, {
    rarity: options.rarity,
    gradientX: options.template.fields['rarity-value'].x,
    gradientY: options.template.fields['rarity-value'].y,
    gradientWidth: cardNameFontSize.width,
  });
  ctx.strokeText(
    localizedCardName,
    options.template.fields.level.x,
    options.template.fields.level.y,
  );
  ctx.fillText(
    localizedCardName,
    options.template.fields.level.x,
    options.template.fields.level.y,
  );
  ctx.restore();
};
