import type { DrawCanvasPartParams } from './types';

export interface DrawElixirCostParams extends DrawCanvasPartParams {
  elixirImage: HTMLImageElement;
}

export const drawElixirCost = ({
  options,
  ctx,
  elixirImage,
}: DrawElixirCostParams) => {
  // Let's draw the elixir drop...
  ctx.save();
  ctx.translate(
    options.template.fields['elixir-cost'].x,
    options.template.fields['elixir-cost'].y,
  );
  ctx.drawImage(
    elixirImage,
    0,
    0,
    options.template.fields['elixir-cost'].width,
    options.template.fields['elixir-cost'].height,
  );
  // ...and then the elixir cost
  ctx.font = `${options.template.fields['elixir-cost'].fontSize}px "Supercell Magic"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 6;
  ctx.fillStyle = '#FFE9FF';
  ctx.strokeStyle = '#760088';
  ctx.shadowOffsetY = 5;
  ctx.shadowColor = '#760088';
  ctx.strokeText(options.elixirCost.toString(), 52, 62);
  ctx.fillText(options.elixirCost.toString(), 52, 62);
  ctx.restore();
};
