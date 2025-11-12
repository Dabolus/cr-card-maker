import { setupLayout } from './layout';
import { drawPageBackground } from './page-background';
import { drawStats } from './stats';
import { drawHeroImage } from './hero-image';
import { drawImage } from './image';
import { drawName } from './name';
import { drawLevel } from './level';
import { drawElixirCost } from './elixir-cost';
import { drawRarityType } from './rarity-type';
import { drawDescription } from './description';
import type { DrawFormOptions } from './types';

const drawFormElements = async (options: DrawFormOptions, page: number) => {
  // Setup the layout
  const { toRelative, container, shadow, styles, form } = setupLayout({
    options,
  });

  // Draw the page background
  drawPageBackground({
    options,
    toRelative,
    styles,
    form,
    page,
  });

  // Draw the card name
  drawName({
    options,
    toRelative,
    styles,
    form,
    page,
  });

  // Draw the level
  const { updateLevelTextColor } = drawLevel({
    options,
    toRelative,
    styles,
    form,
    page,
  });

  // Draw the hero image (if possible)
  drawHeroImage({
    options,
    toRelative,
    styles,
    form,
    page,
  });

  // Draw the image (if possible)
  const { updateImageFrame } = drawImage({
    options,
    toRelative,
    styles,
    form,
    page,
  });

  // Draw the elixir cost
  drawElixirCost({
    options,
    toRelative,
    styles,
    form,
    page,
  });

  // Draw rarity and type
  drawRarityType({
    options,
    toRelative,
    styles,
    form,
    page,
    onRarityChange: (newRarity) => {
      updateLevelTextColor(newRarity);
      updateImageFrame({ rarity: newRarity, cardType: options.cardType });
    },
    onTypeChange: (newType) => {
      updateImageFrame({ rarity: options.rarity, cardType: newType });
    },
  });

  // Draw the description
  drawDescription({
    options,
    toRelative,
    styles,
    form,
    page,
  });

  // Draw the stats
  drawStats({
    options,
    toRelative,
    styles,
    form,
    page,
  });

  shadow.adoptedStyleSheets = [styles];
  shadow.appendChild(form);

  return container;
};

export const drawForm = async (options: DrawFormOptions) => {
  let currentParams: DrawFormOptions = {
    ...options,
    onChange: (newParams, key, val) => {
      (currentParams as Record<string, unknown>)[key] = val;
      options.onChange?.(newParams, key, val);
    },
  };
  let currentPage = options.defaultPage ?? 1;
  let currentContainer = await drawFormElements(currentParams, currentPage);

  return {
    element: currentContainer,
    setPage: async (page: number) => {
      if (page !== currentPage) {
        currentPage = page;
        const newContainer = await drawFormElements(currentParams, currentPage);
        currentContainer.replaceWith(newContainer);
        currentContainer = newContainer;
      }
    },
  };
};
