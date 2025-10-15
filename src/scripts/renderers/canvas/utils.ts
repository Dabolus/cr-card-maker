import { wrappingSlice } from '../../utils';
import { Rarity } from '../types';
import type { Color } from '../../../templates/generated/types';

export const computeTextLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] => {
  const blocks = text.split('\n');
  const lines: string[] = [];
  for (let block of blocks) {
    const words = block.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);
  }
  return lines;
};

export const drawMultilineText = (
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  startY: number,
  lineHeight: number,
) => {
  let y = startY;
  for (let line of lines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
};

export const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) => {
  const lines = computeTextLines(ctx, text, maxWidth);
  drawMultilineText(ctx, lines, x, y, lineHeight);
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
    const startX =
      ctx.textAlign === 'center' ? gradientX - gradientWidth / 2 : gradientX;
    const gradient = ctx.createLinearGradient(
      startX,
      gradientY,
      startX + gradientWidth,
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
