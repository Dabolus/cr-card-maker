import { fitFontSize, getCanvasColor } from './utils';
import { getTemplateField, type Icon } from '../shared';
import type { Fields } from '../../../templates/generated/types';
import type { CardStat } from '../types';
import type { DrawCanvasPartParams } from './types';

export interface DrawStatsParams extends DrawCanvasPartParams {
  evenBackgroundImage: HTMLImageElement | null;
  oddBackgroundImage: HTMLImageElement | null;
  iconsImages: Record<Icon, HTMLImageElement>;
}

const drawStat = ({
  ctx,
  stat,
  background,
  x,
  y,
  itemsConfig,
  iconsImages,
}: {
  ctx: CanvasRenderingContext2D;
  stat: CardStat;
  background: HTMLImageElement | null;
  x: number;
  y: number;
  itemsConfig: NonNullable<Fields['stats']>['items'];
  iconsImages: Record<Icon, HTMLImageElement>;
}) => {
  ctx.translate(x, y);
  // Background
  if (background) {
    ctx.drawImage(background, 0, 0, itemsConfig.width, itemsConfig.height);
  }
  // Name
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'hanging';
  ctx.fillStyle = getCanvasColor(ctx, itemsConfig.name.color);
  const nameFontFamily = itemsConfig.name.fontFamily || 'SC CCBackBeat';
  ctx.font = `${itemsConfig.name.fontSize}px "${nameFontFamily}"`;
  fitFontSize(
    ctx,
    stat.name,
    nameFontFamily,
    itemsConfig.name.maxWidth,
    itemsConfig.name.fontSize,
  );
  ctx.fillText(stat.name, itemsConfig.name.dx, itemsConfig.name.dy);
  // Value
  ctx.fillStyle = getCanvasColor(ctx, itemsConfig.value.color);
  ctx.strokeStyle = '#000';
  ctx.shadowColor = '#000';
  ctx.lineWidth = itemsConfig.value.fontSize * 0.14;
  ctx.shadowOffsetY = itemsConfig.value.fontSize * 0.07;
  fitFontSize(
    ctx,
    stat.value.toString(),
    'Supercell Magic',
    itemsConfig.value.maxWidth,
    itemsConfig.value.fontSize,
  );
  ctx.strokeText(
    stat.value.toString(),
    itemsConfig.value.dx,
    itemsConfig.value.dy,
  );
  ctx.fillText(
    stat.value.toString(),
    itemsConfig.value.dx,
    itemsConfig.value.dy,
  );
  ctx.restore();
  // Icon background
  if (stat.showIconBackground && itemsConfig.icon.backgroundColor) {
    ctx.save();
    ctx.fillStyle = getCanvasColor(ctx, itemsConfig.icon.backgroundColor);
    const iconBgWidth = itemsConfig.icon.width - 10;
    const iconBgHeight = itemsConfig.icon.height - 10;
    const iconBgDx =
      itemsConfig.icon.dx + (itemsConfig.icon.width - iconBgWidth) / 2;
    const iconBgDy =
      itemsConfig.icon.dy + (itemsConfig.icon.height - iconBgHeight) / 2;
    ctx.beginPath();
    ctx.roundRect(iconBgDx, iconBgDy, iconBgWidth, iconBgHeight, 6);
    ctx.fill();
    ctx.restore();
  }
  // Icon
  if (stat.icon in iconsImages) {
    ctx.drawImage(
      iconsImages[stat.icon],
      itemsConfig.icon.dx,
      itemsConfig.icon.dy,
      itemsConfig.icon.width,
      itemsConfig.icon.height,
    );
  }
};

export const drawStats = ({
  options,
  ctx,
  page,
  evenBackgroundImage,
  oddBackgroundImage,
  iconsImages,
}: DrawStatsParams) => {
  const statsConfig = getTemplateField(options.template, 'stats', page);
  if (!statsConfig) {
    return;
  }
  options.stats?.forEach((stat, index) => {
    if (index >= statsConfig.maxItems) {
      return;
    }
    ctx.save();
    const rowIndex = Math.floor(index / statsConfig.itemsPerRow);
    drawStat({
      ctx,
      stat,
      background:
        (rowIndex + 1) % 2 === 0 ? evenBackgroundImage : oddBackgroundImage,
      x:
        statsConfig.x +
        (index % statsConfig.itemsPerRow) *
          (statsConfig.items.width + statsConfig.gapX),
      y:
        statsConfig.y +
        rowIndex * (statsConfig.items.height + statsConfig.gapY),
      itemsConfig: statsConfig.items,
      iconsImages,
    });
    ctx.restore();
  });
};
