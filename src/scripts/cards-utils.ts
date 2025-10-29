import { loadImage, readFileAsDataUrl } from './utils';
import { t } from './i18n';
import type { CRCMDBSchema } from './db';
import type { Card, RendererBaseOptions } from './renderers/types';
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
  const cardImageBlob = await loadImage(params.image.src)
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
    id: params.cardId,
    templateId: params.template.id,
    language: params.language,
    cardName: params.cardName,
    rarity: params.rarity,
    level: params.level,
    cardType: params.cardType,
    elixirCost: Number.isNaN(parsedElixirCost) ? null : parsedElixirCost,
    description: params.description,
    image: {
      src: cardImageBlob,
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
    ? await readFileAsDataUrl(card.image.src)
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

export const parseCard = async (file: File): Promise<RendererBaseOptions> => {
  const brotli = await import('brotli-wasm').then((mod) => mod.default);
  const cardDataArrayBuffer = await file.arrayBuffer();
  const fullCard = new Uint8Array(cardDataArrayBuffer);
  // NOTE: Currently, we only have version 0, so we don't need to perform version checks
  const cardDataBrotliUint8Array = fullCard.slice(1); // Remove version byte
  const cardDataUint8Array = brotli.decompress(cardDataBrotliUint8Array);
  const utf8Decoder = new TextDecoder();
  const card: Card = JSON.parse(utf8Decoder.decode(cardDataUint8Array));
  return card;
};

export const exportCard = async (params: RendererBaseOptions) => {
  const [brotli, { saveAs }] = await Promise.all([
    import('brotli-wasm').then((mod) => mod.default),
    import('file-saver'),
  ]);
  const cardData = JSON.stringify({
    ...params,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } satisfies Card);
  const utf8Encoder = new TextEncoder();
  const cardDataUint8Array = utf8Encoder.encode(cardData);
  const cardDataBrotliUint8Array = brotli.compress(cardDataUint8Array, {
    quality: 9,
  }) as Uint8Array<ArrayBuffer>;
  const fullCard = new Uint8Array(cardDataBrotliUint8Array.length + 1);
  fullCard.set(new Uint8Array([0x0]), 0); // Version byte
  fullCard.set(cardDataBrotliUint8Array, 1);
  const cardDataBrotliBlob = new Blob([fullCard], {
    type: 'application/octet-stream',
  });
  const cardName = params.cardName || t('clash-royale-card');
  saveAs(cardDataBrotliBlob, `${cardName}.crcard`);
};

export const saveCard = async (params: RendererBaseOptions) => {
  const { db } = await import('./db');
  const dbCard = await rendererOptionsToDbCard(params);
  await db.cards.add(dbCard);
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
