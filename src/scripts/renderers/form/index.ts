import { loadImage } from '../../utils';
import { rarities } from '../shared';
import { setupLayout } from './layout';
import { drawStats } from './stats';
import { drawImage } from './image';
import { drawName } from './name';
import { drawElixirCost } from './elixir-cost';
import { drawRarityType } from './rarity-type';
import { drawDescription } from './description';
import type { Rarity } from '../types';
import type { DrawFormOptions } from './types';

export const drawForm = async (options: DrawFormOptions) => {
  const [loadedImage, loadedBgImage, loadedElixirImage] = await Promise.all([
    loadImage(options.image.src).catch(() => null),
    loadImage('/cards-assets/bg.png'),
    loadImage('/cards-assets/elixir.png'),
  ]);
  const loadedRarityBgImages: Record<Rarity, HTMLImageElement> =
    await Promise.all(
      rarities.map(async (rarity) => [
        rarity,
        await loadImage(
          options.template.fields['rarity-background'].url,
          rarity,
        ),
      ]),
    ).then((entries) => Object.fromEntries(entries));

  // Setup the layout
  const { toRelative, container, shadow, styles, form } = setupLayout({
    options,
    backgroundImage: loadedBgImage,
  });

  // Draw the card name
  drawName({ options, toRelative, styles, form });

  // Draw the image (if possible)
  const { updateRarityFrame } = drawImage({
    options,
    toRelative,
    styles,
    form,
    image: loadedImage,
  });

  // Draw the elixir cost
  drawElixirCost({
    options,
    toRelative,
    styles,
    form,
    elixirImage: loadedElixirImage,
  });

  // Draw rarity and type
  // First of all, draw the rarity background, which changes based on the rarity
  drawRarityType({
    options,
    toRelative,
    styles,
    form,
    backgroundImages: loadedRarityBgImages,
    updateRarityFrame,
  });

  // Draw the description
  drawDescription({ options, toRelative, styles, form });

  // Draw the stats
  drawStats({ options, toRelative, styles, form });

  shadow.adoptedStyleSheets = [styles];
  shadow.appendChild(form);

  return container;
};
