import standardTemplate from '../../templates/standard.json' with { type: 'json' };
import placeholderImageUrl from '../../images/placeholder.svg';
import { drawForm } from '../renderers/form';
import { t } from '../i18n';
import { loadImage } from '../utils';
import type { RendererBaseOptions } from '../renderers/types';
import type { $Schema as TemplateSchema } from '../../templates/generated/types';

const defaultParams: RendererBaseOptions = {
  template: standardTemplate as unknown as TemplateSchema,
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

const renderImage = async (params: RendererBaseOptions) => {
  const { drawCanvas } = await import('../renderers/canvas');
  const canvas = await drawCanvas(params);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png', 1),
  );
  return new File([blob!], `${params.cardName || t('clash-royale-card')}.png`, {
    type: 'image/png',
  });
};

const handleSave = async (params: RendererBaseOptions, templateId: string) => {
  const { cardsCollection } = await import('../db');
  const cardImage = await loadImage(params.image.src)
    .then((img) => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      return new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png', 1),
      );
    })
    .catch(() => null);
  const parsedElixirCost = Number(params.elixirCost);
  cardsCollection.addCard({
    id: crypto.randomUUID(),
    templateId: templateId,
    language: params.language,
    cardName: params.cardName,
    rarity: params.rarity,
    level: params.level,
    cardType: params.cardType,
    elixirCost: Number.isNaN(parsedElixirCost) ? null : parsedElixirCost,
    description: params.description,
    image: {
      src: cardImage,
      fit: params.image.fit,
    },
    stats: params.stats ?? [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

const handleDownload = async (params: RendererBaseOptions) => {
  const [{ saveAs }, imageFile] = await Promise.all([
    import('file-saver'),
    renderImage(params),
  ]);
  saveAs(imageFile);
};

const handleShare = async (params: RendererBaseOptions) => {
  const imageFile = await renderImage(params);
  await navigator.share({ files: [imageFile] });
};

export const onPageLoad = async () => {
  let currentParams: RendererBaseOptions = defaultParams;

  const cardEditor = document.querySelector<HTMLDivElement>('#card-editor')!;

  const renderForm = async () => {
    const cardElement = await drawForm({
      ...currentParams,
      onChange: (_, key, val) => {
        (currentParams as Record<string, unknown>)[key] = val;
      },
    });
    cardElement.style.aspectRatio = `${currentParams.template.width} / ${currentParams.template.height}`;
    cardEditor.removeChild(cardEditor.firstElementChild!);
    cardEditor.appendChild(cardElement);
  };

  const templateSelect =
    document.querySelector<HTMLSelectElement>('#template-select')!;
  templateSelect.addEventListener('change', async (e) => {
    const selectedTemplateId = (e.target as HTMLSelectElement).value;
    currentParams.template = await import(
      `../../templates/${selectedTemplateId}.json`
    ).then((mod) => mod.default);
    await renderForm();
  });

  await renderForm();

  const actionsButton =
    document.querySelector<HTMLButtonElement>('#actions-button')!;
  const actionsMenu = document.querySelector<HTMLUListElement>(
    '#actions-button-menu',
  )!;
  document.addEventListener('click', (e) => {
    if (
      e.target !== actionsButton &&
      !actionsButton.contains(e.target as Node)
    ) {
      actionsButton.setAttribute('aria-expanded', 'false');
      actionsMenu.hidden = true;
    } else if (
      e.target === actionsButton ||
      actionsButton.contains(e.target as Node)
    ) {
      const expanded = actionsButton.getAttribute('aria-expanded') === 'true';
      actionsButton.setAttribute('aria-expanded', String(!expanded));
      actionsMenu.hidden = expanded;
      const menuSize = actionsMenu.getBoundingClientRect();
      // Make the menu open on the top of the button, aligned on its right
      actionsMenu.style.top = `${actionsButton.offsetTop - menuSize.height - 7}px`;
      actionsMenu.style.left = `${
        actionsButton.offsetLeft +
        actionsButton.offsetWidth -
        menuSize.width +
        5
      }px`;
    }
  });

  // Show the share button only if sharing images is supported by this browser
  if (
    !('canShare' in navigator) ||
    !navigator.canShare({
      files: [new File([], 'test.png', { type: 'image/png' })],
    })
  ) {
    document.querySelector<HTMLButtonElement>('#share-button')!.hidden = true;
  }

  document
    .querySelector<HTMLButtonElement>('#save-button')!
    .addEventListener('click', async () =>
      handleSave(currentParams, templateSelect.value),
    );
  document
    .querySelector<HTMLButtonElement>('#download-button')!
    .addEventListener('click', async () => handleDownload(currentParams));
  document
    .querySelector<HTMLButtonElement>('#share-button')!
    .addEventListener('click', async () => handleShare(currentParams));
};
