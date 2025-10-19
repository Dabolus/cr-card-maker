import standardTemplate from '../../templates/standard.json' with { type: 'json' };
import placeholderImageUrl from '../../images/placeholder.svg';
import { drawForm } from '../renderers/form';
import { getLocale, t } from '../i18n';
import { loadImage } from '../utils';
import { showNotification } from '../notifications';
import type { RendererBaseOptions } from '../renderers/types';
import type { $Schema as TemplateSchema } from '../../templates/generated/types';
import type { DrawCanvasOptions } from '../renderers/canvas/types';

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

const updatePagesSelect = (
  params: RendererBaseOptions,
  pageSelect: HTMLSelectElement,
  pageSelectContainer: HTMLDivElement,
) => {
  if (params.template.pages && params.template.pages.length > 1) {
    const i18n =
      params.template.i18n?.[
        params.language as keyof typeof params.template.i18n
      ] ?? {};
    pageSelectContainer.hidden = false;
    pageSelect.innerHTML = params.template.pages
      .map(
        (page, i) =>
          `<option value="${i + 1}">${t(page['name-translation-key'], {}, i18n)}</option>`,
      )
      .join('');
    pageSelect.value = '1';
  } else {
    pageSelectContainer.hidden = true;
  }
};

const renderImage = async (params: DrawCanvasOptions) => {
  const { drawCanvas } = await import('../renderers/canvas');
  const canvas = await drawCanvas(params);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png', 1),
  );
  const pageIndex = (params.page ?? 1) - 1;
  const cardName = params.cardName || t('clash-royale-card');
  const pageName = params.template.pages?.[pageIndex]?.name;
  const fullName = `${cardName}${pageName ? ` - ${pageName}` : ''}`;
  return new File([blob!], `${fullName}.png`, {
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
  showNotification({ message: t('card-saved') });
};

const handleDownload = async (params: RendererBaseOptions) => {
  const totalPages = params.template.pages?.length ?? 1;
  const [{ saveAs }, ...imageFiles] = await Promise.all([
    import('file-saver'),
    ...Array.from({ length: totalPages }, (_, index) =>
      renderImage({ ...params, page: index + 1 }),
    ),
  ]);
  imageFiles.forEach((file) => saveAs(file));
};

const handleShare = async (params: RendererBaseOptions) => {
  const totalPages = params.template.pages?.length ?? 1;
  const imageFiles = await Promise.all(
    Array.from({ length: totalPages }, (_, index) =>
      renderImage({ ...params, page: index + 1 }),
    ),
  );
  await navigator.share({ files: imageFiles });
};

export const onPageLoad = async () => {
  let currentParams: RendererBaseOptions = {
    ...defaultParams,
    language: await getLocale(),
  };

  const cardEditor = document.querySelector<HTMLDivElement>('#card-editor')!;

  const renderForm = async () => {
    const result = await drawForm({
      ...currentParams,
      onChange: (_, key, val) => {
        (currentParams as Record<string, unknown>)[key] = val;
      },
    });
    cardEditor.firstElementChild?.replaceWith(result.element);
    return result;
  };

  let renderResult = await renderForm();

  const pageSelectContainer = document.querySelector<HTMLDivElement>(
    '#page-select-container',
  )!;
  const pageSelect = document.querySelector<HTMLSelectElement>('#page-select')!;
  pageSelect.addEventListener('change', async (e) => {
    const selectedPage = Number((e.target as HTMLSelectElement).value);
    await renderResult.setPage(selectedPage);
  });

  const templateSelect =
    document.querySelector<HTMLSelectElement>('#template-select')!;
  templateSelect.addEventListener('change', async (e) => {
    const selectedTemplateId = (e.target as HTMLSelectElement).value;
    currentParams.template = await import(
      `../../templates/${selectedTemplateId}.json`
    ).then((mod) => mod.default);
    updatePagesSelect(currentParams, pageSelect, pageSelectContainer);
    renderResult = await renderForm();
  });
  updatePagesSelect(currentParams, pageSelect, pageSelectContainer);

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

  // Show the share button only if sharing multiple images is supported by this browser
  if (
    !('canShare' in navigator) ||
    !navigator.canShare({
      files: Array.from(
        { length: 2 },
        (_, index) => new File([], `${index}.png`, { type: 'image/png' }),
      ),
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
