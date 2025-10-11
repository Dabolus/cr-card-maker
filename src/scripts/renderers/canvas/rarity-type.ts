import { t } from '../../i18n';
import { fitFontSize, getCanvasColor } from './utils';
import type { DrawCanvasPartParams } from './types';

export interface DrawRarityTypeParams extends DrawCanvasPartParams {
  backgroundImage: HTMLImageElement;
}

export const drawRarityType = ({
  options,
  ctx,
  backgroundImage,
}: DrawRarityTypeParams) => {
  const i18n =
    options.template.i18n?.[
      options.language as keyof typeof options.template.i18n
    ] ?? {};

  // First of all, draw the rarity background, which changes based on the rarity
  ctx.save();
  ctx.drawImage(
    backgroundImage,
    options.template.fields['rarity-background'].x,
    options.template.fields['rarity-background'].y,
    options.template.fields['rarity-background'].width,
    options.template.fields['rarity-background'].height,
  );
  // Ok, now we can draw the text
  ctx.textBaseline = 'hanging';
  // First of all, draw the labels
  ctx.fillStyle = getCanvasColor(
    ctx,
    options.template.fields['rarity-label'].color,
  );
  fitFontSize(
    ctx,
    t('rarity-label', {}, i18n),
    'Supercell Magic',
    options.template.fields['rarity-label'].maxWidth,
    options.template.fields['rarity-label'].fontSize,
  );
  ctx.fillText(
    t('rarity-label', {}, i18n),
    options.template.fields['rarity-label'].x,
    options.template.fields['rarity-label'].y,
  );
  ctx.fillStyle = getCanvasColor(
    ctx,
    options.template.fields['type-label'].color,
  );
  fitFontSize(
    ctx,
    t('type-label', {}, i18n),
    'Supercell Magic',
    options.template.fields['type-label'].maxWidth,
    options.template.fields['type-label'].fontSize,
  );
  ctx.fillText(
    t('type-label', {}, i18n),
    options.template.fields['type-label'].x,
    options.template.fields['type-label'].y,
  );
  // Then the rarity value
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'black';
  ctx.shadowOffsetY = 5;
  ctx.shadowColor = 'black';
  const rarityValueFontSize = fitFontSize(
    ctx,
    t(`rarity-${options.rarity}`, {}, i18n),
    'Supercell Magic',
    options.template.fields['rarity-value'].maxWidth,
    options.template.fields['rarity-value'].fontSize,
  );
  ctx.fillStyle = getCanvasColor(
    ctx,
    options.template.fields['rarity-value'].color,
    {
      rarity: options.rarity,
      gradientX: options.template.fields['rarity-value'].x,
      gradientY: options.template.fields['rarity-value'].y,
      gradientWidth: rarityValueFontSize.metrics.width,
    },
  );
  ctx.strokeText(
    t(`rarity-${options.rarity}`, {}, i18n),
    options.template.fields['rarity-value'].x,
    options.template.fields['rarity-value'].y,
  );
  ctx.fillText(
    t(`rarity-${options.rarity}`, {}, i18n),
    options.template.fields['rarity-value'].x,
    options.template.fields['rarity-value'].y,
  );
  // And finally the type
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'white';
  ctx.shadowOffsetY = 5;
  ctx.shadowColor = 'black';
  const typeValueFontSize = fitFontSize(
    ctx,
    t(`type-${options.cardType}`, {}, i18n),
    'Supercell Magic',
    options.template.fields['type-value'].maxWidth,
    options.template.fields['type-value'].fontSize,
  );
  ctx.fillStyle = getCanvasColor(
    ctx,
    options.template.fields['type-value'].color,
    {
      gradientX: options.template.fields['type-value'].x,
      gradientY: options.template.fields['type-value'].y,
      gradientWidth: typeValueFontSize.metrics.width,
    },
  );
  ctx.strokeText(
    t(`type-${options.cardType}`, {}, i18n),
    options.template.fields['type-value'].x,
    options.template.fields['type-value'].y,
  );
  ctx.fillText(
    t(`type-${options.cardType}`, {}, i18n),
    options.template.fields['type-value'].x,
    options.template.fields['type-value'].y,
  );
  ctx.restore();
};
