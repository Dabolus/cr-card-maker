import { db, type CRCMDBSchema } from '../db';
import {
  frameContainerNominalHeight,
  frameContainerNominalWidth,
  getShape,
  getShapeImageSrc,
  rarities,
  shapesConfig,
} from '../renderers/shared';
import { createToRelativeMapper } from '../renderers/form/utils';
import { t } from '../i18n';
import { setupDropdown } from '../ui/dropdowns';
import {
  canShareImages,
  dbCardToRendererOptions,
  downloadCard,
  exportCard,
  getTemplate,
  shareCard,
} from '../cards-utils';
import { showNotification } from '../ui/notifications';
import placeholderPortraitUrl from '../../images/portrait-placeholder.svg?url';
import placeholderHeroUrl from '../../images/hero-placeholder.svg?url';
import type { $Schema as TemplateSchema } from '../../templates/generated/types';

type StoredCard = CRCMDBSchema['cards']['value'];

type SortBy = 'creation' | 'elixir' | 'level' | 'name' | 'rarity' | 'type';
type SortDirection = 'asc' | 'desc';
interface SortInfo {
  by: SortBy;
  direction: SortDirection;
}

let openedCardReference: StoredCard | null = null;
let openedTemplateReference: TemplateSchema | null = null;

const renderImage = async (
  card: StoredCard,
  template: TemplateSchema,
  page: number,
  cardPreviewDialog: HTMLDialogElement,
) => {
  const { drawCanvas } = await import('../renderers/canvas');
  const imageUrl = card.image?.src ? URL.createObjectURL(card.image.src) : '';
  const heroImageUrl = card.heroImage?.src
    ? URL.createObjectURL(card.heroImage.src)
    : '';
  const canvas = await drawCanvas({
    template,
    language: card.language,
    cardId: card.id,
    cardName: card.cardName,
    rarity: card.rarity,
    level: card.level,
    cardType: card.cardType,
    elixirCost: card.elixirCost === null ? '?' : card.elixirCost,
    description: card.description,
    image: {
      src: imageUrl,
      fit: card.image?.fit ?? 'contain',
    },
    heroImage: {
      src: heroImageUrl,
      fit: card.heroImage?.fit ?? 'contain',
    },
    stats: card.stats,
    page,
    imagePlaceholderSrc: placeholderPortraitUrl,
    heroImagePlaceholderSrc: placeholderHeroUrl,
  });
  if (imageUrl) {
    URL.revokeObjectURL(imageUrl);
  }
  cardPreviewDialog.querySelector('canvas')?.replaceWith(canvas);
};

const createCardPreviewElement = (
  card: StoredCard,
  cardPreviewDialog: HTMLDialogElement,
  cardPreviewConfigSelectsContainer: HTMLDivElement,
) => {
  const cardElement = document.createElement('article');
  cardElement.classList.add('card-preview');

  const cardImageContainer = document.createElement('div');
  cardImageContainer.classList.add('card-preview-image-container');

  const cardImageFrame = document.createElement('div');
  cardImageFrame.classList.add('card-preview-image-frame');
  const cardImageShape = document.createElement('div');
  cardImageShape.classList.add('card-preview-image-shape');

  const cardImageViewport = document.createElement('div');
  cardImageViewport.classList.add('card-preview-image-viewport');

  if (card.image) {
    const cardImage = document.createElement('img');
    cardImage.classList.add('card-preview-image');
    cardImage.loading = 'lazy';
    cardImage.decoding = 'async';
    cardImage.alt = '';
    cardImage.style.objectFit = card.image.fit;
    cardImage.style.objectPosition = 'center';
    if (card.image.src) {
      const objectUrl = URL.createObjectURL(card.image.src);
      cardImage.src = objectUrl;
      cardImage.addEventListener('load', () => URL.revokeObjectURL(objectUrl), {
        once: true,
      });
    }
    cardImageViewport.appendChild(cardImage);
  }

  const containerSize = {
    width: frameContainerNominalWidth,
    height: frameContainerNominalHeight,
  };
  const toContainerRelative = createToRelativeMapper(0, containerSize.width);

  const shapeKey = getShape(card);
  const shapeConfig = shapesConfig[shapeKey];
  const scaleX = containerSize.width / frameContainerNominalWidth;
  const scaleY = containerSize.height / frameContainerNominalHeight;
  const scale = Math.min(scaleX, scaleY);

  const frameLeft = shapeConfig.frame.offsetX * scale;
  const frameTop = shapeConfig.frame.offsetY * scale;
  const frameWidth = shapeConfig.frame.width * scale;
  const frameHeight = shapeConfig.frame.height * scale;

  const toFrameRelative = createToRelativeMapper(0, shapeConfig.frame.width);

  cardImageShape.style.left = toContainerRelative(frameLeft);
  cardImageShape.style.top = toContainerRelative(frameTop);
  cardImageShape.style.width = toContainerRelative(frameWidth);
  cardImageShape.style.height = toContainerRelative(frameHeight);

  if (shapeConfig.image.clip) {
    const clipCoordinates = shapeConfig.image
      .clip(shapeConfig.frame.width, shapeConfig.frame.height)
      .map((coord) => `${toFrameRelative(coord.x)} ${toFrameRelative(coord.y)}`)
      .join(', ');
    const clipPath = `polygon(${clipCoordinates})`;
    cardImageShape.style.clipPath = clipPath;
  }

  cardImageViewport.style.left = toFrameRelative(shapeConfig.image.paddingLeft);
  cardImageViewport.style.top = toFrameRelative(shapeConfig.image.paddingTop);
  cardImageViewport.style.width = toFrameRelative(shapeConfig.image.width);
  cardImageViewport.style.height = toFrameRelative(shapeConfig.image.height);

  cardImageFrame.style.left = toContainerRelative(frameLeft);
  cardImageFrame.style.top = toContainerRelative(frameTop);
  cardImageFrame.style.width = toContainerRelative(frameWidth);
  cardImageFrame.style.height = toContainerRelative(frameHeight);
  cardImageFrame.style.backgroundImage = `url("${getShapeImageSrc(shapeKey)}")`;

  const elixirElement = document.createElement('div');
  elixirElement.classList.add('card-preview-elixir');
  const elixirDrop = document.createElement('div');
  elixirDrop.classList.add('card-preview-elixir-drop');
  const elixirCost = document.createElement('span');
  elixirCost.classList.add('card-preview-elixir-cost');

  elixirCost.textContent =
    typeof card.elixirCost === 'number' ? card.elixirCost.toString() : '?';

  elixirElement.appendChild(elixirDrop);
  elixirElement.appendChild(elixirCost);

  cardImageShape.appendChild(cardImageViewport);
  cardImageContainer.appendChild(cardImageShape);
  cardImageContainer.appendChild(cardImageFrame);
  cardElement.appendChild(cardImageContainer);
  cardElement.appendChild(elixirElement);

  cardElement.addEventListener('click', async () => {
    const template = await getTemplate(card.templateId);

    openedCardReference = card;
    openedTemplateReference = template;

    await renderImage(card, template, 1, cardPreviewDialog);

    if (template.pages && template.pages.length > 1) {
      const pageSelect = cardPreviewDialog.querySelector<HTMLSelectElement>(
        '#card-preview-page-select',
      )!;
      const i18n =
        template.i18n?.[card.language as keyof typeof template.i18n] ?? {};
      pageSelect.innerHTML = template.pages
        .map(
          (page, i) =>
            `<option value="${i + 1}">${t(page['name-translation-key'], {}, i18n)}</option>`,
        )
        .join('');
      pageSelect.value = '1';
      cardPreviewConfigSelectsContainer.hidden = false;
    } else {
      cardPreviewConfigSelectsContainer.hidden = true;
    }

    cardPreviewDialog.showModal();
  });

  return cardElement;
};

const updateCardsList = async (
  cardPreviewDialog: HTMLDialogElement,
  cardPreviewConfigSelectsContainer: HTMLDivElement,
  sortInfo: SortInfo,
) => {
  const cards = await db.cards.getAll();
  const sortedCards = cards.toSorted((a, b) => {
    let compareResult = 0;
    switch (sortInfo.by) {
      case 'creation':
        compareResult = a.createdAt.valueOf() - b.createdAt.valueOf();
        break;
      case 'elixir':
        compareResult =
          (typeof a.elixirCost === 'number' ? a.elixirCost : Infinity) -
          (typeof b.elixirCost === 'number' ? b.elixirCost : Infinity);
        break;
      case 'level':
        compareResult = a.level - b.level;
        break;
      case 'name':
        compareResult = a.cardName.localeCompare(b.cardName);
        break;
      case 'rarity':
        compareResult = rarities.indexOf(a.rarity) - rarities.indexOf(b.rarity);
        break;
      case 'type':
        compareResult = a.cardType.localeCompare(b.cardType);
        break;
    }
    return sortInfo.direction === 'asc' ? compareResult : -compareResult;
  });
  const listContainer = document.querySelector('#cards-list')!;
  listContainer.innerHTML = '';
  sortedCards.forEach((card) => {
    const cardElement = createCardPreviewElement(
      card,
      cardPreviewDialog,
      cardPreviewConfigSelectsContainer,
    );
    listContainer.appendChild(cardElement);
  });
};

export const onPageLoad = async () => {
  const sortInfo = await db.settings.get<SortInfo>('cardsSortInfo', {
    by: 'creation',
    direction: 'desc',
  });

  const cardsSortDirectionButton = document.querySelector<HTMLButtonElement>(
    '#cards-sort-direction',
  )!;
  const cardsSortByButton =
    document.querySelector<HTMLButtonElement>('#cards-sort-by')!;
  const cardPreviewDialog = document.querySelector<HTMLDialogElement>(
    '#card-preview-dialog',
  )!;
  cardsSortByButton.textContent = t(`sort-by-${sortInfo.by}`);
  cardsSortDirectionButton.textContent =
    sortInfo.direction === 'asc' ? '▲' : '▼';
  cardsSortDirectionButton.setAttribute(
    'aria-label',
    t(`sort-direction-${sortInfo.direction}`),
  );

  cardsSortDirectionButton.addEventListener('click', async () => {
    sortInfo.direction = sortInfo.direction === 'asc' ? 'desc' : 'asc';
    cardsSortDirectionButton.textContent =
      sortInfo.direction === 'asc' ? '▲' : '▼';
    cardsSortDirectionButton.setAttribute(
      'aria-label',
      t(`sort-direction-${sortInfo.direction}`),
    );
    await Promise.all([
      db.settings.set<SortInfo>('cardsSortInfo', sortInfo),
      updateCardsList(
        cardPreviewDialog,
        cardPreviewConfigSelectsContainer,
        sortInfo,
      ),
    ]);
  });

  cardsSortByButton.addEventListener('click', async () => {
    const sortByOptions: SortBy[] = [
      'creation',
      'elixir',
      'level',
      'name',
      'rarity',
      'type',
    ];
    const currentIndex = sortByOptions.indexOf(sortInfo.by);
    const nextIndex = (currentIndex + 1) % sortByOptions.length;
    sortInfo.by = sortByOptions[nextIndex];
    cardsSortByButton.textContent = t(`sort-by-${sortInfo.by}`);
    await Promise.all([
      db.settings.set<SortInfo>('cardsSortInfo', sortInfo),
      updateCardsList(
        cardPreviewDialog,
        cardPreviewConfigSelectsContainer,
        sortInfo,
      ),
    ]);
  });

  const cardPreviewConfigSelectsContainer =
    cardPreviewDialog.querySelector<HTMLDivElement>(
      '#card-preview-config-selects-container',
    )!;
  const cardPreviewPageSelect =
    cardPreviewDialog.querySelector<HTMLSelectElement>(
      '#card-preview-page-select',
    )!;
  cardPreviewDialog.addEventListener('click', (e) => {
    // Avoid closing the dialog when clicking on one of the interactive elements in the dialog
    if (
      e
        .composedPath()
        .every(
          (el) =>
            (el as HTMLElement).tagName !== 'SELECT' &&
            (el as HTMLElement).tagName !== 'INPUT' &&
            (el as HTMLElement).tagName !== 'BUTTON',
        )
    ) {
      cardPreviewDialog.close();
    }
  });
  cardPreviewPageSelect.addEventListener('change', async (e) => {
    if (!openedCardReference || !openedTemplateReference) {
      return;
    }
    const selectedPage = Number((e.target as HTMLSelectElement).value);
    await renderImage(
      openedCardReference,
      openedTemplateReference,
      selectedPage,
      cardPreviewDialog,
    );
  });
  db.cards.addEventListener('change', () =>
    updateCardsList(
      cardPreviewDialog,
      cardPreviewConfigSelectsContainer,
      sortInfo,
    ),
  );

  setupDropdown(
    document.querySelector<HTMLElement>('#card-preview-menu-container')!,
    [
      {
        selector: '#card-preview-delete-button',
        action: async () => {
          if (!openedCardReference) {
            return;
          }
          await db.cards.remove(openedCardReference.id);
          cardPreviewDialog.close();
        },
      },
      {
        selector: '#card-preview-export-button',
        action: async () => {
          if (!openedCardReference || !openedTemplateReference) {
            return;
          }
          const cardRendererOptions =
            await dbCardToRendererOptions(openedCardReference);
          await exportCard(cardRendererOptions);
          showNotification({ message: t('card-exported') });
        },
      },
      {
        selector: '#card-preview-download-button',
        action: async () => {
          if (!openedCardReference || !openedTemplateReference) {
            return;
          }
          const cardRendererOptions =
            await dbCardToRendererOptions(openedCardReference);
          await downloadCard(cardRendererOptions);
        },
      },
      {
        selector: '#card-preview-share-button',
        action: async () => {
          if (!openedCardReference || !openedTemplateReference) {
            return;
          }
          const cardRendererOptions =
            await dbCardToRendererOptions(openedCardReference);
          await shareCard(cardRendererOptions);
        },
      },
    ],
  );

  // Show the share button only if sharing multiple images is supported by this browser
  if (!canShareImages) {
    document.querySelector<HTMLButtonElement>(
      '#card-preview-share-button',
    )!.hidden = true;
  }

  await updateCardsList(
    cardPreviewDialog,
    cardPreviewConfigSelectsContainer,
    sortInfo,
  );
};
