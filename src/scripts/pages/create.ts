import standardTemplate from '../../templates/standard.json' with { type: 'json' };
import placeholderImageUrl from '../../images/placeholder.svg';
import { drawForm } from '../renderers/form';
import { getLocale, t } from '../i18n';
import { setupDropdown } from '../ui/dropdowns';
import {
  canShareImages,
  downloadCard,
  saveCard,
  shareCard,
} from '../cards-utils';
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

  setupDropdown(
    document.querySelector<HTMLElement>('#actions-menu-container')!,
    [
      {
        selector: '#save-button',
        action: () => saveCard(currentParams),
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

  // Show the share button only if sharing multiple images is supported by this browser
  if (!canShareImages) {
    document.querySelector<HTMLButtonElement>('#share-button')!.hidden = true;
  }
};
