import standardTemplate from '../../templates/standard.json' with { type: 'json' };
import placeholderImageUrl from '../../images/placeholder.svg';
import { drawForm } from '../renderers/form';
import { getLocale, t } from '../i18n';
import { setupDropdown } from '../ui/dropdowns';
import { showNotification } from '../ui/notifications';
import {
  canShareImages,
  downloadCard,
  exportCard,
  parseCard,
  saveCard,
  shareCard,
} from '../cards-utils';
import { db } from '../db';
import type { RendererBaseOptions } from '../renderers/types';
import type { $Schema as TemplateSchema } from '../../templates/generated/types';

const defaultParams: Omit<RendererBaseOptions, 'cardId'> = {
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

export const onPageLoad = async () => {
  let currentParams = await db.settings.get<RendererBaseOptions>(
    'currentCard',
    {
      ...defaultParams,
      cardId: crypto.randomUUID(),
      language: await getLocale(),
    },
  );

  const cardEditor = document.querySelector<HTMLDivElement>('#card-editor')!;

  const renderForm = async () => {
    const result = await drawForm({
      ...currentParams,
      onChange: async (_, key, val) => {
        (currentParams as Record<string, unknown>)[key] = val;
        await db.settings.set<RendererBaseOptions>(
          'currentCard',
          currentParams,
        );
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

  db.settings.addEventListener('change', async (event) => {
    if (
      event.detail.key === 'currentCard' &&
      (event.detail.value as RendererBaseOptions).cardId !==
        currentParams.cardId
    ) {
      currentParams = event.detail.value as RendererBaseOptions;
      updatePagesSelect(currentParams, pageSelect, pageSelectContainer);
      renderResult = await renderForm();
    }
  });

  setupDropdown(
    document.querySelector<HTMLElement>('#actions-menu-container')!,
    [
      {
        selector: '#clear-button',
        action: async () => {
          await db.settings.set<RendererBaseOptions>('currentCard', {
            ...defaultParams,
            cardId: crypto.randomUUID(),
            language: await getLocale(),
          });
          showNotification({ message: t('card-cleared') });
        },
      },
      {
        selector: '#export-button',
        action: async () => {
          await exportCard(currentParams);
          showNotification({ message: t('card-exported') });
        },
      },
      {
        selector: '#save-button',
        action: async () => {
          await saveCard(currentParams);
          showNotification({ message: t('card-saved') });
        },
      },
      {
        selector: '#download-button',
        action: () => downloadCard(currentParams),
      },
      {
        selector: '#share-button',
        action: () => shareCard(currentParams),
      },
    ],
  );

  document
    .querySelector('#import-card-input')!
    .addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }
      const parsedCard = await parseCard(file);
      await db.settings.set<RendererBaseOptions>('currentCard', parsedCard);
      (e.target as HTMLInputElement).value = '';
      showNotification({ message: t('card-imported') });
    });

  // Show the share button only if sharing multiple images is supported by this browser
  if (!canShareImages) {
    document.querySelector<HTMLButtonElement>('#share-button')!.hidden = true;
  }
};
