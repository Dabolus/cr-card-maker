import { t } from '../../i18n';
import { fitFontSize, getCanvasColor } from './utils';
import type { DrawCanvasPartParams } from './types';

export interface DrawRarityTypeParams extends DrawCanvasPartParams {
  rarityBackgroundImage: HTMLImageElement | null;
  typeBackgroundImage: HTMLImageElement | null;
}

export const drawRarityType = ({
  options,
  ctx,
  rarityBackgroundImage,
  typeBackgroundImage,
}: DrawRarityTypeParams) => {
  const i18n =
    options.template.i18n?.[
      options.language as keyof typeof options.template.i18n
    ] ?? {};

  // First of all, draw the rarity background, which changes based on the rarity
  ctx.save();
  const rarityBackgroundField = options.template.fields['rarity-background'];
  if (rarityBackgroundField && rarityBackgroundImage) {
    ctx.drawImage(
      rarityBackgroundImage,
      rarityBackgroundField.x,
      rarityBackgroundField.y,
      rarityBackgroundField.width,
      rarityBackgroundField.height,
    );
  }
  const typeBackgroundField = options.template.fields['type-background'];
  if (typeBackgroundField && typeBackgroundImage) {
    ctx.drawImage(
      typeBackgroundImage,
      typeBackgroundField.x,
      typeBackgroundField.y,
      typeBackgroundField.width,
      typeBackgroundField.height,
    );
  }
  // Ok, now we can draw the text
  ctx.textBaseline = 'hanging';
  // First of all, draw the labels
  ctx.textAlign = options.template.fields['rarity-label'].textAlign || 'left';
  ctx.fillStyle = getCanvasColor(
    ctx,
    options.template.fields['rarity-label'].color,
    { rarity: options.rarity },
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
  ctx.textAlign = options.template.fields['type-label'].textAlign || 'left';
  ctx.fillStyle = getCanvasColor(
    ctx,
    options.template.fields['type-label'].color,
    { rarity: options.rarity },
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
  ctx.strokeStyle = 'black';
  ctx.shadowColor = 'black';
  ctx.textAlign = options.template.fields['rarity-value'].textAlign || 'left';
  ctx.lineWidth = options.template.fields['rarity-value'].fontSize * 0.1;
  ctx.shadowOffsetY = options.template.fields['rarity-value'].fontSize * 0.07;
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
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'white';
  ctx.shadowColor = 'black';
  ctx.textAlign = options.template.fields['type-value'].textAlign || 'left';
  ctx.lineWidth = options.template.fields['type-value'].fontSize * 0.1;
  ctx.shadowOffsetY = options.template.fields['type-value'].fontSize * 0.07;
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
      rarity: options.rarity,
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
