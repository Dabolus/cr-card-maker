import { loadImage } from './utils';
import { showNotification } from './ui/notifications';
import { t } from './i18n';
import type { CRCMDBSchema } from './db';
import type { RendererBaseOptions } from './renderers/types';
import type { DrawCanvasOptions } from './renderers/canvas/types';
import type { $Schema as TemplateSchema } from '../templates/generated/types';

export const canShareImages =
  'canShare' in navigator &&
  navigator.canShare({
    files: Array.from(
      { length: 2 },
      (_, index) => new File([], `${index}.png`, { type: 'image/png' }),
    ),
  });

const renderImage = async (params: DrawCanvasOptions) => {
  const { drawCanvas } = await import('./renderers/canvas');
  const canvas = await drawCanvas(params);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png', 1),
  );
  const i18n =
    params.template.i18n?.[
      params.language as keyof typeof params.template.i18n
    ] ?? {};
  const pageIndex = (params.page ?? 1) - 1;
  const cardName = params.cardName || t('clash-royale-card');
  const pageName = t(
    params.template.pages?.[pageIndex]?.['name-translation-key'] ?? '',
    {},
    i18n,
  );
  const fullName = `${cardName}${pageName ? ` - ${pageName}` : ''}`;
  return new File([blob!], `${fullName}.png`, {
    type: 'image/png',
  });
};

export const rendererOptionsToDbCard = async (
  params: RendererBaseOptions,
): Promise<CRCMDBSchema['cards']['value']> => {
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
  return {
    id: params.cardId ?? crypto.randomUUID(),
    templateId: params.template.id,
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
  };
};

export const dbCardToRendererOptions = async (
  card: CRCMDBSchema['cards']['value'],
): Promise<RendererBaseOptions> => {
  const { default: template } = (await import(
    `../templates/${card.templateId}.json`
  )) as { default: TemplateSchema };
  const cardImageSrc = card.image.src
    ? URL.createObjectURL(card.image.src)
    : (await import('../images/placeholder.svg')).default;
  return {
    cardId: card.id,
    template,
    language: card.language,
    cardName: card.cardName,
    rarity: card.rarity,
    level: card.level,
    cardType: card.cardType,
    elixirCost: card.elixirCost ?? '?',
    description: card.description,
    image: {
      src: cardImageSrc,
      fit: card.image.fit,
    },
    stats: card.stats,
  };
};

export const saveCard = async (params: RendererBaseOptions) => {
  const { cardsCollection } = await import('./db');
  cardsCollection.addCard(await rendererOptionsToDbCard(params));
  showNotification({ message: t('card-saved') });
};

export const downloadCard = async (params: RendererBaseOptions) => {
  const totalPages = params.template.pages?.length ?? 1;
  const [{ saveAs }, ...imageFiles] = await Promise.all([
    import('file-saver'),
    ...Array.from({ length: totalPages }, (_, index) =>
      renderImage({ ...params, page: index + 1 }),
    ),
  ]);
  imageFiles.forEach((file) => saveAs(file));
};

export const shareCard = async (params: RendererBaseOptions) => {
  const totalPages = params.template.pages?.length ?? 1;
  const imageFiles = await Promise.all(
    Array.from({ length: totalPages }, (_, index) =>
      renderImage({ ...params, page: index + 1 }),
    ),
  );
  await navigator.share({ files: imageFiles });
};
