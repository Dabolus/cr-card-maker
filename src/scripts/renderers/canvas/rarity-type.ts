import { t } from '../../i18n';
import { fitFontSize, getCanvasColor } from './utils';
import { getTemplateField } from '../shared';
import type { DrawCanvasPartParams } from './types';

export interface DrawRarityTypeParams extends DrawCanvasPartParams {
  rarityBackgroundImage: HTMLImageElement | null;
  typeBackgroundImage: HTMLImageElement | null;
}

export const drawRarityType = ({
  options,
  ctx,
  page,
  rarityBackgroundImage,
  typeBackgroundImage,
}: DrawRarityTypeParams) => {
  const i18n =
    options.template.i18n?.[
      options.language as keyof typeof options.template.i18n
    ] ?? {};

  ctx.save();

  // First of all, draw the rarity and type backgrounds, which might change based on the rarity
  const rarityBackgroundField = getTemplateField(
    options.template,
    'rarity-background',
    page,
  );
  if (rarityBackgroundField && rarityBackgroundImage) {
    ctx.drawImage(
      rarityBackgroundImage,
      rarityBackgroundField.x,
      rarityBackgroundField.y,
      rarityBackgroundField.width,
      rarityBackgroundField.height,
    );
  }

  const typeBackgroundField = getTemplateField(
    options.template,
    'type-background',
    page,
  );
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
  const rarityLabelField = getTemplateField(
    options.template,
    'rarity-label',
    page,
  );
  if (rarityLabelField) {
    ctx.textAlign = rarityLabelField.textAlign || 'left';
    ctx.fillStyle = getCanvasColor(ctx, rarityLabelField.color, {
      rarity: options.rarity,
    });
    fitFontSize(
      ctx,
      t('rarity-label', {}, i18n),
      'Supercell Magic',
      rarityLabelField.maxWidth,
      rarityLabelField.fontSize,
    );
    ctx.fillText(
      t('rarity-label', {}, i18n),
      rarityLabelField.x,
      rarityLabelField.y,
    );
  }
  const typeLabelField = getTemplateField(options.template, 'type-label', page);
  if (typeLabelField) {
    ctx.textAlign = typeLabelField.textAlign || 'left';
    ctx.fillStyle = getCanvasColor(ctx, typeLabelField.color, {
      rarity: options.rarity,
    });
    fitFontSize(
      ctx,
      t('type-label', {}, i18n),
      'Supercell Magic',
      typeLabelField.maxWidth,
      typeLabelField.fontSize,
    );
    ctx.fillText(t('type-label', {}, i18n), typeLabelField.x, typeLabelField.y);
  }
  // Then the rarity value
  const rarityValueField = getTemplateField(
    options.template,
    'rarity-value',
    page,
  );
  if (rarityValueField) {
    ctx.strokeStyle = 'black';
    ctx.shadowColor = 'black';
    ctx.textAlign = rarityValueField.textAlign || 'left';
    ctx.lineWidth = rarityValueField.fontSize * 0.1;
    ctx.shadowOffsetY = rarityValueField.fontSize * 0.07;
    const rarityValueFontSize = fitFontSize(
      ctx,
      t(`rarity-${options.rarity}`, {}, i18n),
      'Supercell Magic',
      rarityValueField.maxWidth,
      rarityValueField.fontSize,
    );
    ctx.fillStyle = getCanvasColor(ctx, rarityValueField.color, {
      rarity: options.rarity,
      gradientX: rarityValueField.x,
      gradientY: rarityValueField.y,
      gradientWidth: rarityValueFontSize.metrics.width,
    });
    ctx.strokeText(
      t(`rarity-${options.rarity}`, {}, i18n),
      rarityValueField.x,
      rarityValueField.y,
    );
    ctx.fillText(
      t(`rarity-${options.rarity}`, {}, i18n),
      rarityValueField.x,
      rarityValueField.y,
    );
  }
  // And finally the type
  const typeValueField = getTemplateField(options.template, 'type-value', page);
  if (typeValueField) {
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'black';
    ctx.textAlign = typeValueField.textAlign || 'left';
    ctx.lineWidth = typeValueField.fontSize * 0.1;
    ctx.shadowOffsetY = typeValueField.fontSize * 0.07;
    const typeValueFontSize = fitFontSize(
      ctx,
      t(`type-${options.cardType}`, {}, i18n),
      'Supercell Magic',
      typeValueField.maxWidth,
      typeValueField.fontSize,
    );
    ctx.fillStyle = getCanvasColor(ctx, typeValueField.color, {
      rarity: options.rarity,
      gradientX: typeValueField.x,
      gradientY: typeValueField.y,
      gradientWidth: typeValueFontSize.metrics.width,
    });
    ctx.strokeText(
      t(`type-${options.cardType}`, {}, i18n),
      typeValueField.x,
      typeValueField.y,
    );
    ctx.fillText(
      t(`type-${options.cardType}`, {}, i18n),
      typeValueField.x,
      typeValueField.y,
    );
  }
  ctx.restore();
};
