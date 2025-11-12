import { loadImage } from '../../utils';
import { setupLayout } from './layout';
import { drawPageBackground } from './page-background';
import { drawName } from './name';
import { drawLevel } from './level';
import { drawImage } from './image';
import { drawElixirCost } from './elixir-cost';
import { drawRarityType } from './rarity-type';
import { drawDescription } from './description';
import { drawStats } from './stats';
import { drawHeroImage } from './hero-image';
import {
  getIconsImages,
  getShape,
  getShapeImage,
  getTemplateField,
} from '../shared';
import type { DrawCanvasOptions } from './types';

export const drawCanvas = async ({
  page = 1,
  ...options
}: DrawCanvasOptions) => {
  const rarityBackgroundField = getTemplateField(
    options.template,
    'rarity-background',
    page,
  );
  const typeBackgroundField = getTemplateField(
    options.template,
    'type-background',
    page,
  );
  const statsField = getTemplateField(options.template, 'stats', page);

  const [
    loadedImage,
    loadedHeroImage,
    loadedCardBgImage,
    loadedPageBgImage,
    loadedElixirImage,
    loadedIconsImages,
    loadedShapeImage,
    loadedRarityBgImage,
    loadedTypeBgImage,
    loadedStatsEvenBgImage,
    loadedStatsOddBgImage,
  ] = await Promise.all([
    options.image
      ? loadImage(options.image?.src ?? options.imagePlaceholderSrc).catch(
          () => null,
        )
      : null,
    options.heroImage
      ? loadImage(
          options.heroImage?.src ?? options.heroImagePlaceholderSrc,
        ).catch(() => null)
      : null,
    options.template.background ? loadImage(options.template.background) : null,
    options.template.pages?.[page - 1]?.background
      ? loadImage(options.template.pages?.[page - 1]?.background)
      : null,
    loadImage('/cards-assets/elixir.png'),
    getIconsImages(options.stats?.map((item) => item.icon) ?? []),
    getShapeImage(getShape(options)),
    rarityBackgroundField
      ? loadImage(rarityBackgroundField.url, options.rarity)
      : null,
    typeBackgroundField
      ? loadImage(typeBackgroundField.url, options.rarity)
      : null,
    statsField?.items.evenBackground
      ? loadImage(statsField.items.evenBackground)
      : null,
    statsField?.items.oddBackground
      ? loadImage(statsField.items.oddBackground)
      : null,
  ]);

  // Setup the layout
  const { ctx } = setupLayout({
    options,
    cardBackgroundImage: loadedCardBgImage,
  });

  // Draw the page background
  drawPageBackground({
    options,
    ctx,
    page,
    pageBackgroundImage: loadedPageBgImage,
  });

  // Draw the card name
  drawName({ options, ctx, page });

  // Draw the level
  drawLevel({ options, ctx, page });

  // Draw the hero image (if possible)
  drawHeroImage({
    options,
    ctx,
    page,
    heroImage: loadedHeroImage,
  });

  // Draw the image (if possible)
  drawImage({
    options,
    ctx,
    page,
    image: loadedImage,
    shapeImage: loadedShapeImage,
  });

  // Draw the elixir cost
  drawElixirCost({ options, ctx, page, elixirImage: loadedElixirImage });

  // Draw rarity and type
  drawRarityType({
    options,
    ctx,
    page,
    rarityBackgroundImage: loadedRarityBgImage,
    typeBackgroundImage: loadedTypeBgImage,
  });

  // Draw the description
  drawDescription({ options, ctx, page });

  // Draw the stats
  drawStats({
    options,
    ctx,
    page,
    evenBackgroundImage: loadedStatsEvenBgImage,
    oddBackgroundImage: loadedStatsOddBgImage,
    iconsImages: loadedIconsImages,
  });

  return ctx.canvas;
};
