import type { Color } from '../../../templates/generated/types';
import { wrappingSlice } from '../../utils';
import { Rarity } from '../types';

export const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) => {
  const blocks = text.split('\n');
  for (let block of blocks) {
    const words = block.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else line = testLine;
    }
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
};

export const fitFontSize = (
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  maxWidth: number,
  startSize: number,
  minSize: number = 1,
): {
  fontSize: number;
  metrics: TextMetrics;
} => {
  let fontSize = startSize;
  ctx.font = `${fontSize}px "${fontFamily}"`;
  while (fontSize > minSize && ctx.measureText(text).width > maxWidth) {
    fontSize--;
    ctx.font = `${fontSize}px "${fontFamily}"`;
  }
  return {
    fontSize,
    metrics: ctx.measureText(text),
  };
};

export const getCanvasColor = (
  ctx: CanvasRenderingContext2D,
  color: Color,
  {
    rarity = 'common',
    gradientIndex = 0,
    gradientMaxColors = 3,
    gradientX = 0,
    gradientY = 0,
    gradientWidth = ctx.canvas.width,
  }: {
    rarity?: Rarity;
    gradientIndex?: number;
    gradientMaxColors?: number;
    gradientX?: number;
    gradientY?: number;
    gradientWidth?: number;
  } = {},
) => {
  const colorValue =
    typeof color === 'string' || Array.isArray(color) ? color : color[rarity];

  if (Array.isArray(colorValue) && colorValue.length > 1) {
    const gradient = ctx.createLinearGradient(
      gradientX,
      gradientY,
      gradientX + gradientWidth,
      gradientY,
    );
    const colorsToUseCount = Math.min(colorValue.length, gradientMaxColors);
    const gradientStartIndex = gradientIndex % colorValue.length;
    const gradientEndIndex = gradientIndex + colorsToUseCount;
    const colorsToUse = wrappingSlice(
      colorValue,
      gradientStartIndex,
      gradientEndIndex,
    );
    const step = 1 / (colorsToUse.length - 1);
    colorsToUse.forEach((c, i) => gradient.addColorStop(i * step, c));
    return gradient;
  } else {
    return Array.isArray(colorValue) ? colorValue[0] : colorValue;
  }
};
