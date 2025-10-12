import { loadImage } from '../../utils';
import { setupLayout } from './layout';
import { drawName } from './name';
import { drawLevel } from './level';
import { drawImage } from './image';
import { drawElixirCost } from './elixir-cost';
import { drawRarityType } from './rarity-type';
import { drawDescription } from './description';
import { drawStats } from './stats';
import type { DrawCanvasOptions } from './types';

export const drawCanvas = async (options: DrawCanvasOptions) => {
  const rarityBackgroundField = options.template.fields['rarity-background'];
  const typeBackgroundField = options.template.fields['type-background'];

  const [
    loadedImage,
    loadedBgImage,
    loadedElixirImage,
    loadedRarityBgImage,
    loadedTypeBgImage,
  ] = await Promise.all([
    loadImage(options.image.src).catch(() => null),
    loadImage(options.template.background),
    loadImage('/cards-assets/elixir.png'),
    rarityBackgroundField
      ? loadImage(rarityBackgroundField.url, options.rarity)
      : null,
    typeBackgroundField
      ? loadImage(typeBackgroundField.url, options.rarity)
      : null,
  ]);

  // Setup the layout
  const { ctx } = setupLayout({ options, backgroundImage: loadedBgImage });

  // Draw the card name
  drawName({ options, ctx });

  // Draw the level
  drawLevel({ options, ctx });

  // Draw the image (if possible)
  drawImage({ options, ctx, image: loadedImage });

  // Draw the elixir cost
  drawElixirCost({ options, ctx, elixirImage: loadedElixirImage });

  // Draw rarity and type
  drawRarityType({
    options,
    ctx,
    rarityBackgroundImage: loadedRarityBgImage,
    typeBackgroundImage: loadedTypeBgImage,
  });

  // Draw the description
  drawDescription({ options, ctx });

  // Draw the stats
  drawStats({ options, ctx });

  return ctx.canvas;
};
