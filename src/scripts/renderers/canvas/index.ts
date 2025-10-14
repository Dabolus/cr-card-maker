import { loadImage } from '../../utils';
import { setupLayout } from './layout';
import { drawName } from './name';
import { drawLevel } from './level';
import { drawImage } from './image';
import { drawElixirCost } from './elixir-cost';
import { drawRarityType } from './rarity-type';
import { drawDescription } from './description';
import { drawStats } from './stats';
import { getIconsImages, getShapeImage, raritiesConfig } from '../shared';
import type { DrawCanvasOptions } from './types';

export const drawCanvas = async (options: DrawCanvasOptions) => {
  const rarityBackgroundField = options.template.fields['rarity-background'];
  const typeBackgroundField = options.template.fields['type-background'];

  const [
    loadedImage,
    loadedBgImage,
    loadedElixirImage,
    loadedIconsImages,
    loadedShapeImage,
    loadedRarityBgImage,
    loadedTypeBgImage,
    loadedStatsEvenBgImage,
    loadedStatsOddBgImage,
  ] = await Promise.all([
    loadImage(options.image.src).catch(() => null),
    loadImage(options.template.background),
    loadImage('/cards-assets/elixir.png'),
    getIconsImages(options.stats?.map((item) => item.icon) ?? []),
    getShapeImage(raritiesConfig[options.rarity].shape),
    rarityBackgroundField
      ? loadImage(rarityBackgroundField.url, options.rarity)
      : null,
    typeBackgroundField
      ? loadImage(typeBackgroundField.url, options.rarity)
      : null,
    options.template.fields.stats?.items.evenBackground
      ? loadImage(options.template.fields.stats.items.evenBackground)
      : null,
    options.template.fields.stats?.items.oddBackground
      ? loadImage(options.template.fields.stats.items.oddBackground)
      : null,
  ]);

  // Setup the layout
  const { ctx } = setupLayout({ options, backgroundImage: loadedBgImage });

  // Draw the card name
  drawName({ options, ctx });

  // Draw the level
  drawLevel({ options, ctx });

  // Draw the image (if possible)
  drawImage({ options, ctx, image: loadedImage, shapeImage: loadedShapeImage });

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
  drawStats({
    options,
    ctx,
    evenBackgroundImage: loadedStatsEvenBgImage,
    oddBackgroundImage: loadedStatsOddBgImage,
    iconsImages: loadedIconsImages,
  });

  return ctx.canvas;
};
