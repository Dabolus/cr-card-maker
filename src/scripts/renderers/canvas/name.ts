import { t } from '../../i18n';
import { fitFontSize, getCanvasColor } from './utils';
import type { DrawCanvasPartParams } from './types';

export const drawName = ({ options, ctx }: DrawCanvasPartParams) => {
  const i18n =
    options.template.i18n?.[
      options.language as keyof typeof options.template.i18n
    ] ?? {};

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'hanging';
  ctx.fillStyle = getCanvasColor(
    ctx,
    options.template.fields['card-name'].color,
  );
  ctx.strokeStyle = 'black';
  ctx.shadowColor = 'black';
  ctx.lineWidth = options.template.fields['card-name'].fontSize * 0.1;
  ctx.shadowOffsetY = options.template.fields['card-name'].fontSize * 0.07;
  const localizedCardName = t('name', options, i18n);
  fitFontSize(
    ctx,
    localizedCardName,
    'Supercell Magic',
    options.template.fields['card-name'].maxWidth,
    options.template.fields['card-name'].fontSize,
  );
  ctx.strokeText(
    localizedCardName,
    options.template.fields['card-name'].x,
    options.template.fields['card-name'].y,
  );
  ctx.fillText(
    localizedCardName,
    options.template.fields['card-name'].x,
    options.template.fields['card-name'].y,
  );
  ctx.restore();
};
