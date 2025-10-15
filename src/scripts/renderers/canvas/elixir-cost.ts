import { getTemplateField } from '../shared';
import type { DrawCanvasPartParams } from './types';

export interface DrawElixirCostParams extends DrawCanvasPartParams {
  elixirImage: HTMLImageElement;
}

export const drawElixirCost = ({
  options,
  ctx,
  page,
  elixirImage,
}: DrawElixirCostParams) => {
  const elixirCostField = getTemplateField(
    options.template,
    'elixir-cost',
    page,
  );
  if (!elixirCostField) {
    return;
  }
  // Let's draw the elixir drop...
  ctx.save();
  ctx.translate(elixirCostField.x, elixirCostField.y);
  ctx.drawImage(
    elixirImage,
    0,
    0,
    elixirCostField.width,
    elixirCostField.height,
  );
  // ...and then the elixir cost
  ctx.font = `${elixirCostField.fontSize}px "Supercell Magic"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFE9FF';
  ctx.strokeStyle = '#760088';
  ctx.shadowColor = '#760088';
  ctx.lineWidth = elixirCostField.fontSize * 0.1;
  ctx.shadowOffsetY = elixirCostField.fontSize * 0.07;
  const elixirX = elixirCostField.width / 2;
  const elixirY = elixirCostField.height / 2;
  ctx.strokeText(options.elixirCost.toString(), elixirX, elixirY);
  ctx.fillText(options.elixirCost.toString(), elixirX, elixirY);
  ctx.restore();
};
