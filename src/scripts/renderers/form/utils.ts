import { loadImage, wrappingSlice } from '../../utils';
import { t } from '../../i18n';
import { imageFitOptions, type ImageFit } from '../shared';
import type { Color, Rarity } from '../../../templates/generated/types';
import type { CropperSelection } from 'cropperjs';

export const getCssSimplifiedColor = (
  color: Color,
  {
    rarity = 'common',
    gradientIndex = 0,
  }: {
    rarity?: Rarity;
    gradientIndex?: number;
  },
): string => {
  const colorValue =
    typeof color === 'string' || Array.isArray(color)
      ? color
      : (color[rarity] ?? color.common);
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
): string => {
  const colorValue =
    typeof color === 'string' || Array.isArray(color)
      ? color
      : (color[rarity] ?? color.common);

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

export const openImageEditor = async ({
  form,
  fileDataUrl,
  imageSize,
  defaultImageFit = 'contain',
}: {
  form: HTMLFormElement;
  fileDataUrl: string;
  imageSize: { width: number; height: number };
  defaultImageFit?: ImageFit;
}): Promise<{ image: HTMLImageElement; fit: ImageFit }> => {
  const { resolve, promise } = Promise.withResolvers<{
    image: HTMLImageElement;
    fit: ImageFit;
  }>();

  const dialog = document.createElement('dialog');
  dialog.classList.add('fullscreen');
  dialog.id = 'image-editor-dialog';

  const dialogForm = document.createElement('form');
  dialogForm.method = 'dialog';

  const cropperCanvas = document.createElement('cropper-canvas');
  const aspectRatio = imageSize.width / imageSize.height;
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
        `<option value="${option}" ${option === defaultImageFit ? 'selected' : ''}>${t(`image-fit-${option}`)}</option>`,
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
