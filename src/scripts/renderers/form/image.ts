import {
  imageFitOptions,
  raritiesConfig,
  shapesConfig,
  frameContainerNominalWidth,
  frameContainerNominalHeight,
  getShapeImageSrc,
  getTemplateField,
} from '../shared';
import { css, createToRelativeMapper } from './utils';
import { loadImage, readFileAsDataUrl } from '../../utils';
import { t } from '../../i18n';
import type { DrawFormOptions, DrawFormPartParams } from './types';
import type { ImageFit, Rarity } from '../types';
import type { CropperSelection } from 'cropperjs';
import type { Fields } from '../../../templates/generated/types';

// Lazy-load CropperJS
const cropperJsPromise = import('cropperjs').then((mod) => mod.default);

const handleImageEdit = async ({
  options,
  form,
  fileDataUrl,
  imageField,
}: {
  options: DrawFormPartParams['options'];
  form: HTMLFormElement;
  fileDataUrl: string;
  imageField: NonNullable<Fields['image']>;
}): Promise<{ image: HTMLImageElement; fit: ImageFit }> => {
  const { resolve, promise } = Promise.withResolvers<{
    image: HTMLImageElement;
    fit: ImageFit;
  }>();

  await cropperJsPromise;

  const dialog = document.createElement('dialog');
  dialog.classList.add('fullscreen');
  dialog.id = 'card-crop-dialog';

  const dialogForm = document.createElement('form');
  dialogForm.method = 'dialog';

  const cropperCanvas = document.createElement('cropper-canvas');
  const aspectRatio = imageField.width / imageField.height;
  cropperCanvas.innerHTML = `
      <cropper-image src="${fileDataUrl}" alt="Picture" rotatable scalable skewable translatable></cropper-image>
      <cropper-shade hidden></cropper-shade>
      <cropper-handle action="move" plain></cropper-handle>
      <cropper-selection initial-coverage="0.5" aspect-ratio="${aspectRatio}" movable resizable>
        <cropper-grid role="grid" covered></cropper-grid>
        <cropper-crosshair centered></cropper-crosshair>
        <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>
        <cropper-handle action="n-resize"></cropper-handle>
        <cropper-handle action="e-resize"></cropper-handle>
        <cropper-handle action="s-resize"></cropper-handle>
        <cropper-handle action="w-resize"></cropper-handle>
        <cropper-handle action="ne-resize"></cropper-handle>
        <cropper-handle action="nw-resize"></cropper-handle>
        <cropper-handle action="se-resize"></cropper-handle>
        <cropper-handle action="sw-resize"></cropper-handle>
      </cropper-selection>
    `;
  const cropperSelection =
    cropperCanvas.querySelector<CropperSelection>('cropper-selection')!;
  dialogForm.appendChild(cropperCanvas);

  const actionsContainer = document.createElement('div');
  actionsContainer.classList.add('dialog-actions');
  dialogForm.appendChild(actionsContainer);

  const imageFitLabel = document.createElement('label');
  imageFitLabel.id = 'image-fit';
  imageFitLabel.textContent = t('image-fit-label');

  const imageFitSelect = document.createElement('select');
  imageFitSelect.name = 'image-fit';
  imageFitSelect.innerHTML = imageFitOptions
    .map(
      (option) =>
        `<option value="${option}" ${option === options.image.fit ? 'selected' : ''}>${t(`image-fit-${option}`)}</option>`,
    )
    .join('');
  imageFitLabel.appendChild(imageFitSelect);
  actionsContainer.appendChild(imageFitLabel);

  const buttonsContainer = document.createElement('div');
  buttonsContainer.classList.add('dialog-buttons');

  const dontCropButton = document.createElement('button');
  dontCropButton.classList.add('secondary-action');
  dontCropButton.type = 'submit';
  dontCropButton.formMethod = 'dialog';
  dontCropButton.value = 'dont-crop';
  dontCropButton.textContent = t('dont-crop');
  buttonsContainer.appendChild(dontCropButton);

  const cropButton = document.createElement('button');
  cropButton.classList.add('primary-action');
  cropButton.type = 'submit';
  cropButton.formMethod = 'dialog';
  cropButton.value = 'crop';
  cropButton.textContent = t('crop');
  buttonsContainer.appendChild(cropButton);
  actionsContainer.appendChild(buttonsContainer);

  dialogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitter = (e as SubmitEvent).submitter as HTMLButtonElement;

    if (submitter.value === 'crop') {
      const selection = await cropperSelection.$toCanvas();
      const croppedDataUrl = selection.toDataURL('image/png');
      const croppedImage = await loadImage(croppedDataUrl);
      resolve({
        image: croppedImage,
        fit: imageFitSelect.value as ImageFit,
      });
    } else {
      const originalImage = await loadImage(fileDataUrl);
      resolve({
        image: originalImage,
        fit: imageFitSelect.value as ImageFit,
      });
    }

    dialog.close();
    form.removeChild(dialog);
  });

  dialogForm.appendChild(actionsContainer);
  dialog.appendChild(dialogForm);
  form.appendChild(dialog);
  dialog.showModal();

  return await promise;
};

export const drawImage = ({
  options,
  toRelative,
  styles,
  form,
  page,
}: DrawFormPartParams): {
  updateRarityFrame: (rarity: Rarity) => void;
} => {
  const imageField = getTemplateField(options.template, 'image', page);
  if (!imageField) {
    return {
      updateRarityFrame: () => {},
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
  styles.insertRule(css`
    #card-crop-dialog {
      padding: 1rem;

      & > form {
        width: 100%;
        height: 100%;

        & > cropper-canvas {
          flex: 1;
          border-radius: 8px;
        }

        & > .dialog-actions #image-fit {
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

  const applyShapeLayout = (rarity: Rarity) => {
    const shapeKey = raritiesConfig[rarity].shape;
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

  cardImage.src = options.image?.src ?? '';

  const setImageFit = (fit: ImageFit) => {
    cardImage.style.objectFit = fit;
    options.image.fit = fit;
  };
  setImageFit(options.image.fit);

  applyShapeLayout(options.rarity);

  imageInput.addEventListener('change', async (event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) {
      return;
    }
    const file = target.files[0];
    const fileDataUrl = await readFileAsDataUrl(file);
    // Reset the input
    imageInput.value = '';
    const editResult = await handleImageEdit({
      options,
      form,
      fileDataUrl,
      imageField,
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
    updateRarityFrame: (rarity: Rarity) => {
      applyShapeLayout(rarity);
    },
  };
};
