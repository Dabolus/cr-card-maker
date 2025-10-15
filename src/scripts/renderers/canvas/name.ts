import { t } from '../../i18n';
import { fitFontSize, getCanvasColor } from './utils';
import { getTemplateField } from '../shared';
import type { DrawCanvasPartParams } from './types';

export const drawName = ({ options, ctx, page }: DrawCanvasPartParams) => {
  const nameField = getTemplateField(options.template, 'card-name', page);
  if (!nameField) {
    return;
  }

  const i18n =
    options.template.i18n?.[
      options.language as keyof typeof options.template.i18n
    ] ?? {};

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'hanging';
  ctx.fillStyle = getCanvasColor(ctx, nameField.color);
  ctx.strokeStyle = 'black';
  ctx.shadowColor = 'black';
  ctx.lineWidth = nameField.fontSize * 0.1;
  ctx.shadowOffsetY = nameField.fontSize * 0.07;
  const localizedCardName = t('name', options, i18n);
  fitFontSize(
    ctx,
    localizedCardName,
    'Supercell Magic',
    nameField.maxWidth,
    nameField.fontSize,
  );
  ctx.strokeText(localizedCardName, nameField.x, nameField.y);
  ctx.fillText(localizedCardName, nameField.x, nameField.y);
  ctx.restore();
};
