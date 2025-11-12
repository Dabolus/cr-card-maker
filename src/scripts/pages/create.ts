import placeholderPortraitUrl from '../../images/portrait-placeholder.svg?url';
import placeholderHeroUrl from '../../images/hero-placeholder.svg?url';
import { drawForm } from '../renderers/form';
import { getLocale, t } from '../i18n';
import { setupDropdown } from '../ui/dropdowns';
import { showNotification } from '../ui/notifications';
import {
  canShareImages,
  downloadCard,
  exportCard,
  getTemplate,
  parseCard,
  saveCard,
  shareCard,
} from '../cards-utils';
import { db } from '../db';
import type { RendererBaseOptions } from '../renderers/types';

const defaultParams: Omit<RendererBaseOptions, 'cardId'> = {
  template: await getTemplate('standard'),
  language: 'en',
  cardName: '',
  rarity: 'common',
  level: 1,
  cardType: 'troop',
  elixirCost: '?',
  description: '',
  image: {
    fit: 'contain',
  },
  heroImage: {
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
  const dbCurrentCard = await db.settings.get<RendererBaseOptions>(
    'currentCard',
    {
      ...defaultParams,
      cardId: crypto.randomUUID(),
      language: await getLocale(),
    },
  );
  let currentParams: RendererBaseOptions = {
    ...dbCurrentCard,
    // Make sure to always load the template afresh, in case it was updated
    template: await getTemplate(dbCurrentCard.template.id),
  };

  const cardEditor = document.querySelector<HTMLDivElement>('#card-editor')!;

  const renderForm = async () => {
    const result = await drawForm({
      ...currentParams,
      imagePlaceholderSrc: placeholderPortraitUrl,
      heroImagePlaceholderSrc: placeholderHeroUrl,
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
  // Select the current template in the select
  templateSelect.value = currentParams.template.id;
  templateSelect.addEventListener('change', async (e) => {
    const selectedTemplateId = (e.target as HTMLSelectElement).value;
    const newTemplate = await getTemplate(selectedTemplateId);
    currentParams.template = newTemplate;
    // Adjust current params to fit new template constraints
    if (
      newTemplate['supported-rarities'] &&
      !newTemplate['supported-rarities'].includes(currentParams.rarity)
    ) {
      currentParams.rarity = newTemplate['supported-rarities'][0];
    }
    if (
      newTemplate['supported-types'] &&
      !newTemplate['supported-types'].includes(currentParams.cardType)
    ) {
      currentParams.cardType = newTemplate['supported-types'][0];
    }
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
            template: currentParams.template,
            cardId: crypto.randomUUID(),
            language: await getLocale(),
          });
          // showNotification({ message: t('card-cleared') });
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
