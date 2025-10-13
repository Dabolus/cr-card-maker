import { loadImage } from '../../utils';
import { rarities } from '../shared';
import type { Url } from '../../../templates/generated/types';
import { setupLayout } from './layout';
import { drawStats } from './stats';
import { drawImage } from './image';
import { drawName } from './name';
import { drawLevel } from './level';
import { drawElixirCost } from './elixir-cost';
import { drawRarityType } from './rarity-type';
import { drawDescription } from './description';
import type { Rarity } from '../types';
import type { DrawFormOptions } from './types';

const loadBackgrounds = async (
  supportedRarities: Rarity[],
  field?: {
    url: Url;
  },
): Promise<Partial<Record<Rarity, HTMLImageElement>> | null> => {
  if (!field) {
    return null;
  }

  const entries = await Promise.all(
    supportedRarities.map(
      async (rarity) => [rarity, await loadImage(field.url, rarity)] as const,
    ),
  );

  return Object.fromEntries(entries) as Partial<
    Record<Rarity, HTMLImageElement>
  >;
};

export const drawForm = async (options: DrawFormOptions) => {
  const supportedRarities = options.template['supported-rarities'] ?? rarities;
  const [
    loadedImage,
    loadedBgImage,
    loadedElixirImage,
    loadedRarityBgImages,
    loadedTypeBgImages,
    loadedStatsEvenBgImage,
    loadedStatsOddBgImage,
  ] = await Promise.all([
    loadImage(options.image.src).catch(() => null),
    loadImage(options.template.background),
    loadImage('/cards-assets/elixir.png'),
    loadBackgrounds(
      supportedRarities,
      options.template.fields['rarity-background'],
    ),
    loadBackgrounds(
      supportedRarities,
      options.template.fields['type-background'],
    ),
    options.template.fields.stats?.items.evenBackground
      ? loadImage(options.template.fields.stats.items.evenBackground)
      : null,
    options.template.fields.stats?.items.oddBackground
      ? loadImage(options.template.fields.stats.items.oddBackground)
      : null,
  ]);

  // Setup the layout
  const { toRelative, container, shadow, styles, form } = setupLayout({
    options,
    backgroundImage: loadedBgImage,
  });

  // Draw the card name
  drawName({ options, toRelative, styles, form });

  // Draw the level
  const { updateLevelTextColor } = drawLevel({
    options,
    toRelative,
    styles,
    form,
  });

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
  drawRarityType({
    options,
    toRelative,
    styles,
    form,
    rarityBackgroundImages: loadedRarityBgImages,
    typeBackgroundImages: loadedTypeBgImages,
    onRarityChange: (newRarity) => {
      updateLevelTextColor(newRarity);
      updateRarityFrame(newRarity);
    },
  });

  // Draw the description
  drawDescription({ options, toRelative, styles, form });

  // Draw the stats
  drawStats({
    options,
    toRelative,
    styles,
    form,
    evenBackgroundImage: loadedStatsEvenBgImage,
    oddBackgroundImage: loadedStatsOddBgImage,
  });

  shadow.adoptedStyleSheets = [styles];
  shadow.appendChild(form);

  return container;
};
