import { setupLayout } from './layout';
import { drawPageBackground } from './page-background';
import { drawStats } from './stats';
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

  // Draw the image (if possible)
  const { updateRarityFrame } = drawImage({
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
      updateRarityFrame(newRarity);
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

  // IMPROVE
  if (options.template.pages && options.template.pages.length > 1) {
    const pageSelect = document.createElement('select');
    pageSelect.style.position = 'absolute';
    pageSelect.style.top = '8px';
    pageSelect.style.right = '8px';
    pageSelect.style.zIndex = '10';
    pageSelect.innerHTML = options.template.pages
      .map(
        (_, i) =>
          `<option value="${i + 1}"${i + 1 === currentPage ? ' selected' : ''}>Page ${i + 1}</option>`,
      )
      .join('');
    pageSelect.addEventListener('change', async (e) => {
      const newPage = Number((e.target as HTMLSelectElement).value);
      if (newPage !== currentPage) {
        currentPage = newPage;
        const newContainer = await drawFormElements(currentParams, currentPage);
        currentContainer.replaceWith(newContainer);
        currentContainer = newContainer;
      }
    });
    document.body.appendChild(pageSelect);
  }

  return currentContainer;
};
