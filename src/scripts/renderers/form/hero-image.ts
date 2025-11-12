import { getTemplateField } from '../shared';
import { css, openImageEditor } from './utils';
import { readFileAsDataUrl } from '../../utils';
import type { DrawFormOptions, DrawFormPartParams } from './types';
import type { ImageFit } from '../types';

// Lazy-load CropperJS
import('cropperjs');

export const drawHeroImage = ({
  options,
  toRelative,
  styles,
  form,
  page,
}: DrawFormPartParams) => {
  const heroImageField = getTemplateField(options.template, 'hero-image', page);
  if (!options.heroImage || !heroImageField) {
    return;
  }
  // Draw the contour of the image
  styles.insertRule(css`
    #card-hero-image-container {
      cursor: pointer;
      left: ${toRelative(heroImageField.x)};
      top: ${toRelative(heroImageField.y)};
      width: ${toRelative(heroImageField.width)};
      height: ${toRelative(heroImageField.height)};

      & > #card-hero-image {
        width: 100%;
        height: 100%;
        object-position: center;
        display: block;
      }
    }
  `);
  styles.insertRule(css`
    #card-hero-crop-dialog {
      padding: 1rem;

      & > form {
        width: 100%;
        height: 100%;

        & > cropper-canvas {
          flex: 1;
          border-radius: 8px;
        }

        & > .dialog-actions #hero-image-fit {
          color: #000;
          margin-right: auto;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;

          @media (min-width: 600px) {
            flex-direction: row;
            align-items: center;
          }

          & > select {
            padding: 0.25rem;
            border-radius: 4px;
          }
        }
      }
    }
  `);
  const container = document.createElement('label');
  container.id = 'card-hero-image-container';

  const imageInput = document.createElement('input');
  imageInput.type = 'file';
  imageInput.accept = 'image/*';
  imageInput.name = 'image';
  imageInput.hidden = true;
  container.appendChild(imageInput);

  const cardHeroImage = document.createElement('img');
  cardHeroImage.id = 'card-hero-image';
  cardHeroImage.alt = '';
  cardHeroImage.style.objectFit = options.heroImage.fit;
  cardHeroImage.style.objectPosition = 'center';
  container.appendChild(cardHeroImage);

  cardHeroImage.src = options.heroImage?.src ?? options.heroImagePlaceholderSrc;

  const setImageFit = (fit: ImageFit) => {
    cardHeroImage.style.objectFit = fit;
    options.heroImage = {
      ...options.heroImage,
      fit,
    };
  };
  setImageFit(options.heroImage.fit);

  imageInput.addEventListener('change', async (event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) {
      return;
    }
    const file = target.files[0];
    const fileDataUrl = await readFileAsDataUrl(file);
    // Reset the input
    imageInput.value = '';
    const editResult = await openImageEditor({
      form,
      fileDataUrl,
      imageSize: heroImageField,
      defaultImageFit: options.heroImage?.fit,
    });
    cardHeroImage.src = editResult.image.src;
    setImageFit(editResult.fit);
    const newHeroImageData: DrawFormOptions['image'] = {
      src: editResult.image.src,
      fit: editResult.fit,
    };
    options.heroImage = newHeroImageData;
    options.onChange?.(
      {
        ...options,
        heroImage: newHeroImageData,
      },
      'heroImage',
      newHeroImageData,
    );
  });

  form.appendChild(container);
};
