import standard2Template from '../../templates/standard-2.json' with { type: 'json' };
import placeholderImageUrl from '../../images/placeholder.svg';
import { drawForm } from '../renderers/form';
import type { RendererBaseOptions } from '../renderers/types';
import type { $Schema as TemplateSchema } from '../../templates/generated/types';
import { t } from '../i18n';

const defaultParams: RendererBaseOptions = {
  template: standard2Template as unknown as TemplateSchema,
  language: 'en',
  cardName: '',
  rarity: 'common',
  level: 1,
  cardType: 'troop',
  elixirCost: '?',
  description: '',
  image: {
    src: placeholderImageUrl,
    fit: 'contain',
  },
  stats: [],
};

export const onPageLoad = async () => {
  // Show the share button only if sharing images is supported by this browser
  if (
    'canShare' in navigator &&
    navigator.canShare({
      files: [new File([], 'test.png', { type: 'image/png' })],
    })
  ) {
    document.querySelector<HTMLButtonElement>('#share-button')!.hidden = false;
  }

  let currentParams: RendererBaseOptions = defaultParams;

  const cardEditor = document.querySelector<HTMLDivElement>('#card-editor')!;

  const renderForm = async () => {
    const cardElement = await drawForm({
      ...currentParams,
      onChange: (_, key, val) => {
        (currentParams as Record<string, unknown>)[key] = val;
      },
    });
    cardElement.style.aspectRatio = `${standard2Template.width} / ${standard2Template.height}`;
    cardEditor.removeChild(cardEditor.firstElementChild!);
    cardEditor.appendChild(cardElement);
  };

  const renderImage = async () => {
    const { drawCanvas } = await import('../renderers/canvas');
    const canvas = await drawCanvas(currentParams);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png', 1),
    );
    return new File(
      [blob!],
      `${currentParams.cardName || t('clash-royale-card')}.png`,
      { type: 'image/png' },
    );
  };

  document
    .querySelector<HTMLSelectElement>('#template-select')!
    .addEventListener('change', async (e) => {
      const selectedTemplateId = (e.target as HTMLSelectElement).value;
      currentParams.template = await import(
        `../../templates/${selectedTemplateId}.json`
      ).then((mod) => mod.default);
      await renderForm();
    });

  await renderForm();

  document
    .querySelector<HTMLButtonElement>('#download-button')!
    .addEventListener('click', async () => {
      const [{ saveAs }, imageFile] = await Promise.all([
        import('file-saver'),
        renderImage(),
      ]);
      saveAs(imageFile);
    });
  document
    .querySelector<HTMLButtonElement>('#share-button')!
    .addEventListener('click', async () => {
      const imageFile = await renderImage();
      await navigator.share({ files: [imageFile] });
    });
};
