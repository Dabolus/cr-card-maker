import { fitContentInContainer } from '../form/utils';
import { getTemplateField } from '../shared';
import type { DrawCanvasPartParams } from './types';

export interface DrawHeroImageParams extends DrawCanvasPartParams {
  heroImage: HTMLImageElement | null;
}

export const drawHeroImage = ({
  options,
  ctx,
  page,
  heroImage,
}: DrawHeroImageParams) => {
  const heroImageField = getTemplateField(options.template, 'hero-image', page);
  if (!options.heroImage || !heroImageField || !heroImage) {
    return;
  }

  ctx.save();

  switch (options.heroImage.fit) {
    case 'fill': {
      ctx.drawImage(
        heroImage,
        heroImageField.x,
        heroImageField.y,
        heroImageField.width,
        heroImageField.height,
      );
      break;
    }
    case 'contain': {
      const fittedBox = fitContentInContainer(heroImage, {
        width: heroImageField.width,
        height: heroImageField.height,
      });
      ctx.drawImage(
        heroImage,
        heroImageField.x + fittedBox.x,
        heroImageField.y + fittedBox.y,
        fittedBox.width,
        fittedBox.height,
      );
      break;
    }
    case 'cover': {
      const ratio = Math.max(
        heroImageField.width / heroImage.width,
        heroImageField.height / heroImage.height,
      );
      const width = heroImageField.width * ratio;
      const height = heroImageField.height * ratio;
      ctx.drawImage(
        heroImage,
        heroImageField.x + (heroImageField.width - width) / 2,
        heroImageField.y + (heroImageField.height - height) / 2,
        width,
        height,
      );
      break;
    }
  }

  ctx.restore();
};
