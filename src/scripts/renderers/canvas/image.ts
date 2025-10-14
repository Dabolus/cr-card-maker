import { fitContentInContainer } from '../form/utils';
import {
  raritiesConfig,
  shapesConfig,
  frameContainerNominalWidth,
  frameContainerNominalHeight,
} from '../shared';
import type { DrawCanvasPartParams } from './types';

export interface DrawImageParams extends DrawCanvasPartParams {
  image: HTMLImageElement | null;
  shapeImage: HTMLImageElement;
}

export const drawImage = ({
  options,
  ctx,
  image,
  shapeImage,
}: DrawImageParams) => {
  ctx.save();

  const shapeConfig = shapesConfig[raritiesConfig[options.rarity].shape];

  const containerField = options.template.fields.image;
  const scaleX = containerField.width / frameContainerNominalWidth;
  const scaleY = containerField.height / frameContainerNominalHeight;
  const scale = Math.min(scaleX, scaleY);
  const frameLeft = containerField.x + shapeConfig.frame.offsetX * scale;
  const frameTop = containerField.y + shapeConfig.frame.offsetY * scale;

  ctx.translate(frameLeft, frameTop);
  ctx.scale(scale, scale);

  // First of all, let's create the clip for the image based on the card rarity (if any)
  ctx.save();
  if (shapeConfig.image.clip) {
    const clip = shapeConfig.image.clip(
      shapeConfig.frame.width,
      shapeConfig.frame.height,
    );
    ctx.beginPath();
    ctx.moveTo(clip[0].x, clip[0].y);
    clip.slice(1).forEach((coord) => {
      ctx.lineTo(coord.x, coord.y);
    });
    ctx.closePath();
    ctx.clip();
  }

  // Draw the image white background
  ctx.fillStyle = '#fff';
  ctx.fillRect(
    shapeConfig.image.paddingLeft,
    shapeConfig.image.paddingTop,
    shapeConfig.image.width,
    shapeConfig.image.height,
  );

  // Now we can finally draw the image
  if (image) {
    switch (options.image.fit) {
      case 'fill': {
        ctx.drawImage(
          image,
          shapeConfig.image.paddingLeft,
          shapeConfig.image.paddingTop,
          shapeConfig.image.width,
          shapeConfig.image.height,
        );
        break;
      }
      case 'contain': {
        const fittedBox = fitContentInContainer(image, {
          width: shapeConfig.image.width,
          height: shapeConfig.image.height,
        });
        ctx.drawImage(
          image,
          shapeConfig.image.paddingLeft + fittedBox.x,
          shapeConfig.image.paddingTop + fittedBox.y,
          fittedBox.width,
          fittedBox.height,
        );
        break;
      }
      case 'cover': {
        const ratio = Math.max(
          shapeConfig.image.width / image.width,
          shapeConfig.image.height / image.height,
        );
        const width = image.width * ratio;
        const height = image.height * ratio;
        ctx.drawImage(
          image,
          shapeConfig.image.paddingLeft + (shapeConfig.image.width - width) / 2,
          shapeConfig.image.paddingTop +
            (shapeConfig.image.height - height) / 2,
          width,
          height,
        );
        break;
      }
    }
  }
  ctx.restore();

  // Draw the frame of the image
  ctx.drawImage(
    shapeImage,
    0,
    0,
    shapeConfig.frame.width,
    shapeConfig.frame.height,
  );
  ctx.restore();
};
