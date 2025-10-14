import { setupLayout } from './layout';
import { drawStats } from './stats';
import { drawImage } from './image';
import { drawName } from './name';
import { drawLevel } from './level';
import { drawElixirCost } from './elixir-cost';
import { drawRarityType } from './rarity-type';
import { drawDescription } from './description';
import type { DrawFormOptions } from './types';

export const drawForm = async (options: DrawFormOptions) => {
  // Setup the layout
  const { toRelative, container, shadow, styles, form } = setupLayout({
    options,
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
  });

  // Draw the elixir cost
  drawElixirCost({
    options,
    toRelative,
    styles,
    form,
  });

  // Draw rarity and type
  drawRarityType({
    options,
    toRelative,
    styles,
    form,
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
  });

  shadow.adoptedStyleSheets = [styles];
  shadow.appendChild(form);

  return container;
};
