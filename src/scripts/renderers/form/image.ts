import {
  shapesConfig,
  frameContainerNominalWidth,
  frameContainerNominalHeight,
  getShapeImageSrc,
  getTemplateField,
  getShape,
} from '../shared';
import { css, createToRelativeMapper, openImageEditor } from './utils';
import { readFileAsDataUrl } from '../../utils';
import type { DrawFormOptions, DrawFormPartParams } from './types';
import type { ImageFit, Rarity } from '../types';
import type { Type } from '../../../templates/generated/types';

// Lazy-load CropperJS
import('cropperjs');

export const drawImage = ({
  options,
  toRelative,
  styles,
  form,
  page,
}: DrawFormPartParams): {
  updateImageFrame: (config: { rarity: Rarity; cardType: Type }) => void;
} => {
  const imageField = getTemplateField(options.template, 'image', page);
  if (!options.image || !imageField) {
    return {
      updateImageFrame: () => {},
    };
  }
  // Draw the contour of the image
  styles.insertRule(css`
    #card-image-container {
      cursor: pointer;
      left: ${toRelative(imageField.x)};
      top: ${toRelative(imageField.y)};
      width: ${toRelative(imageField.width)};
      height: ${toRelative(imageField.height)};
      container-type: inline-size;

      & > #card-image-shape,
      & > #card-image-frame {
        position: absolute;
      }

      & > #card-image-frame {
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
      }

      & > #card-image-shape {
        container-type: inline-size;

        & > .card-image-viewport {
          position: absolute;
          background-color: #fff;
          overflow: hidden;
          pointer-events: none;

          & > #card-image {
            width: 100%;
            height: 100%;
            object-position: center;
            display: block;
          }
        }
      }
    }
  `);
  const container = document.createElement('label');
  container.id = 'card-image-container';

  const imageInput = document.createElement('input');
  imageInput.type = 'file';
  imageInput.accept = 'image/*';
  imageInput.name = 'image';
  imageInput.hidden = true;
  container.appendChild(imageInput);

  const cardImageFrame = document.createElement('div');
  cardImageFrame.id = 'card-image-frame';
  const cardImageShape = document.createElement('div');
  cardImageShape.id = 'card-image-shape';

  const cardImageViewport = document.createElement('div');
  cardImageViewport.classList.add('card-image-viewport');

  const cardImage = document.createElement('img');
  cardImage.id = 'card-image';
  cardImage.alt = '';
  cardImage.style.objectFit = options.image.fit;
  cardImage.style.objectPosition = 'center';
  cardImageViewport.appendChild(cardImage);

  cardImageShape.appendChild(cardImageViewport);
  container.appendChild(cardImageShape);
  container.appendChild(cardImageFrame);

  const containerSize = {
    width: imageField.width,
    height: imageField.height,
  };
  const toContainerRelative = createToRelativeMapper(0, containerSize.width);

  const applyShapeLayout = (config: { rarity: Rarity; cardType: Type }) => {
    const shapeKey = getShape(config);
    const shapeConfig = shapesConfig[shapeKey];
    const scaleX = containerSize.width / frameContainerNominalWidth;
    const scaleY = containerSize.height / frameContainerNominalHeight;
    const scale = Math.min(scaleX, scaleY);

    const frameLeft = shapeConfig.frame.offsetX * scale;
    const frameTop = shapeConfig.frame.offsetY * scale;
    const frameWidth = shapeConfig.frame.width * scale;
    const frameHeight = shapeConfig.frame.height * scale;

    const toFrameRelative = createToRelativeMapper(0, shapeConfig.frame.width);

    cardImageShape.style.left = toContainerRelative(frameLeft);
    cardImageShape.style.top = toContainerRelative(frameTop);
    cardImageShape.style.width = toContainerRelative(frameWidth);
    cardImageShape.style.height = toContainerRelative(frameHeight);

    if (shapeConfig.image.clip) {
      const clipCoordinates = shapeConfig.image
        .clip(shapeConfig.frame.width, shapeConfig.frame.height)
        .map(
          (coord) => `${toFrameRelative(coord.x)} ${toFrameRelative(coord.y)}`,
        )
        .join(', ');
      const clipPath = `polygon(${clipCoordinates})`;
      cardImageShape.style.clipPath = clipPath;
    }

    cardImageViewport.style.left = toFrameRelative(
      shapeConfig.image.paddingLeft,
    );
    cardImageViewport.style.top = toFrameRelative(shapeConfig.image.paddingTop);
    cardImageViewport.style.width = toFrameRelative(shapeConfig.image.width);
    cardImageViewport.style.height = toFrameRelative(shapeConfig.image.height);

    cardImageFrame.style.left = toContainerRelative(frameLeft);
    cardImageFrame.style.top = toContainerRelative(frameTop);
    cardImageFrame.style.width = toContainerRelative(frameWidth);
    cardImageFrame.style.height = toContainerRelative(frameHeight);
    cardImageFrame.style.backgroundImage = `url("${getShapeImageSrc(shapeKey)}")`;
  };

  cardImage.src = options.image?.src ?? options.imagePlaceholderSrc;

  const setImageFit = (fit: ImageFit) => {
    cardImage.style.objectFit = fit;
    options.image = {
      ...options.image,
      fit,
    };
  };
  setImageFit(options.image.fit);

  applyShapeLayout(options);

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
      imageSize: imageField,
      defaultImageFit: options.image?.fit,
    });
    cardImage.src = editResult.image.src;
    setImageFit(editResult.fit);
    const newImageData: DrawFormOptions['image'] = {
      src: editResult.image.src,
      fit: editResult.fit,
    };
    options.image = newImageData;
    options.onChange?.(
      {
        ...options,
        image: newImageData,
      },
      'image',
      newImageData,
    );
  });

  form.appendChild(container);

  return {
    updateImageFrame: applyShapeLayout,
  };
};
