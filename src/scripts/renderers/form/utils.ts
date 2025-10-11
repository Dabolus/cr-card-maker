import { wrappingSlice } from '../../utils';
import type { Color } from '../../../templates/generated/types';
import type { Rarity } from '../shared';

export const getCssSimplifiedColor = (
  color: Color,
  {
    rarity = 'common',
    gradientIndex = 0,
  }: {
    rarity?: Rarity;
    gradientIndex?: number;
  },
) => {
  const colorValue =
    typeof color === 'string' || Array.isArray(color) ? color : color[rarity];
  return Array.isArray(colorValue) ? colorValue[gradientIndex] : colorValue;
};

export const getCssColor = (
  color: Color,
  {
    rarity = 'common',
    gradientIndex = 0,
    gradientMaxColors = 3,
  }: {
    rarity?: Rarity;
    gradientIndex?: number;
    gradientMaxColors?: number;
  } = {},
) => {
  const colorValue =
    typeof color === 'string' || Array.isArray(color) ? color : color[rarity];

  if (Array.isArray(colorValue) && colorValue.length > 1) {
    const colorsToUseCount = Math.min(colorValue.length, gradientMaxColors);
    const gradientStartIndex = gradientIndex % colorValue.length;
    const gradientEndIndex = gradientIndex + colorsToUseCount;
    const colorsToUse = wrappingSlice(
      colorValue,
      gradientStartIndex,
      gradientEndIndex,
    );
    return `linear-gradient(to right, ${colorsToUse.join(', ')})`;
  } else {
    return Array.isArray(colorValue) ? colorValue[0] : colorValue;
  }
};

export const createToRelativeMapper =
  (min: number, max: number) =>
  (pixels: number): string =>
    `${((pixels - min) / (max - min)) * 100}cqw`;

// Only needed for syntax highlighting
export const css = (strings: TemplateStringsArray, ...values: unknown[]) =>
  strings
    .map((str, i) => `${str}${i < values.length ? values[i] : ''}`)
    .join('');

export interface Size {
  width: number;
  height: number;
}

export interface BoundingBox extends Size {
  x: number;
  y: number;
}

export const fitContentInContainer = (
  content: Size,
  container: Size,
): BoundingBox => {
  const ratio = Math.min(
    container.width / content.width,
    container.height / content.height,
  );
  const width = content.width * ratio;
  const height = content.height * ratio;
  return {
    x: (container.width - width) / 2,
    y: (container.height - height) / 2,
    width,
    height,
  };
};
