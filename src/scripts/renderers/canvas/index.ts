import { loadImage } from '../../utils';
import { setupLayout } from './layout';
import { drawName } from './name';
import { drawImage } from './image';
import { drawElixirCost } from './elixir-cost';
import { drawRarityType } from './rarity-type';
import { drawDescription } from './description';
import { drawStats } from './stats';
import type { DrawCanvasOptions } from './types';

export const drawCanvas = async (options: DrawCanvasOptions) => {
  const [loadedImage, loadedBgImage, loadedElixirImage, loadedRarityBgImage] =
    await Promise.all([
      loadImage(options.image.src).catch(() => null),
      loadImage('/cards-assets/bg.png'),
      loadImage('/cards-assets/elixir.png'),
      loadImage(
        options.template.fields['rarity-background'].url,
        options.rarity,
      ),
    ]);

  // Setup the layout
  const { ctx } = setupLayout({ options, backgroundImage: loadedBgImage });

  // Draw the card name
  drawName({ options, ctx });

  // Draw the image (if possible)
  drawImage({ options, ctx, image: loadedImage });

  // Draw the elixir cost
  drawElixirCost({ options, ctx, elixirImage: loadedElixirImage });

  // Draw rarity and type
  drawRarityType({ options, ctx, backgroundImage: loadedRarityBgImage });

  // Draw the description
  drawDescription({ options, ctx });

  // Draw the stats
  drawStats({ options, ctx });

  return ctx.canvas;
};
