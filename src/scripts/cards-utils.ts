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

const readWholeStream = async (
  stream: ReadableStream<Uint8Array<ArrayBuffer>>,
): Promise<Uint8Array<ArrayBuffer>> => {
  const reader = stream.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let done = false;
  while (!done) {
    const { value, done: readerDone } = await reader.read();
    if (value) {
      chunks.push(value);
    }
    done = readerDone;
  }
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
};

interface BrotliWrapper {
  compress(
    input: Uint8Array<ArrayBuffer>,
    options?: { quality: number },
  ): Promise<Uint8Array<ArrayBuffer>>;
  decompress(input: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>>;
}

const getBrotliNative = (): BrotliWrapper => ({
  compress: async (input, _options) => {
    const compressionStream = new CompressionStream(
      // Currently TS doesn't recognize 'brotli' as valid CompressionFormat
      'brotli' as unknown as CompressionFormat,
    );
    const writer = compressionStream.writable.getWriter();
    writer.write(input);
    writer.close();
    const compressedStream = compressionStream.readable;
    return await readWholeStream(compressedStream);
  },
  decompress: async (input) => {
    const decompressionStream = new DecompressionStream(
      // Currently TS doesn't recognize 'brotli' as valid CompressionFormat
      'brotli' as unknown as CompressionFormat,
    );
    const writer = decompressionStream.writable.getWriter();
    writer.write(input);
    writer.close();
    const decompressedStream = decompressionStream.readable;
    return await readWholeStream(decompressedStream);
  },
});

const getBrotliWasm = (): BrotliWrapper => {
  const brotliPromise = import('brotli-wasm').then((mod) => mod.default);
  return {
    compress: async (input, options) => {
      const brotli = await brotliPromise;
      return brotli.compress(input, options) as Uint8Array<ArrayBuffer>;
    },
    decompress: async (input) => {
      const brotli = await brotliPromise;
      return brotli.decompress(input) as Uint8Array<ArrayBuffer>;
    },
  };
};

const getBrotli = (): BrotliWrapper => {
  try {
    if (
      'CompressionStream' in globalThis &&
      'DecompressionStream' in globalThis
    ) {
      // If Compression/DecompressionStreams are available, check if they support brotli
      // Currently TS doesn't recognize 'brotli' as valid CompressionFormat
      new CompressionStream('brotli' as unknown as CompressionFormat);
      new DecompressionStream('brotli' as unknown as CompressionFormat);
      return getBrotliNative();
    } else {
      // Otherwise, throw to fall back to the catch block (i.e. WASM implementation)
      throw new Error();
    }
  } catch {
    return getBrotliWasm();
  }
};

export const parseCard = async (file: File): Promise<RendererBaseOptions> => {
  const brotli = getBrotli();
  const cardDataArrayBuffer = await file.arrayBuffer();
  const fullCard = new Uint8Array(cardDataArrayBuffer);
  // NOTE: Currently, we only have version 0, so we don't need to perform version checks
  const cardDataBrotliUint8Array = fullCard.slice(1); // Remove version byte
  const cardDataUint8Array = await brotli.decompress(cardDataBrotliUint8Array);
  const utf8Decoder = new TextDecoder();
  const card: Card = JSON.parse(utf8Decoder.decode(cardDataUint8Array));
  return card;
};

export const exportCard = async (params: RendererBaseOptions) => {
  const { saveAs } = await import('file-saver');
  const brotli = getBrotli();
  const cardData = JSON.stringify({
    ...params,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } satisfies Card);
  const utf8Encoder = new TextEncoder();
  const cardDataUint8Array = utf8Encoder.encode(cardData);
  const cardDataBrotliUint8Array = await brotli.compress(cardDataUint8Array, {
    quality: 9,
  });
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
