import { cardsCollection, type CRCMDBSchema } from '../db';
import {
  frameContainerNominalHeight,
  frameContainerNominalWidth,
  getShapeImageSrc,
  raritiesConfig,
  shapesConfig,
} from '../renderers/shared';
import { createToRelativeMapper } from '../renderers/form/utils';

type StoredCard = CRCMDBSchema['cards']['value'];

const createCardPreviewElement = (
  card: StoredCard,
  cardPreviewDialog: HTMLDialogElement,
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

  const containerSize = {
    width: frameContainerNominalWidth,
    height: frameContainerNominalHeight,
  };
  const toContainerRelative = createToRelativeMapper(0, containerSize.width);

  const shapeKey = raritiesConfig[card.rarity].shape;
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
    const [{ drawCanvas }, { default: template }] = await Promise.all([
      import('../renderers/canvas'),
      import(`../../templates/${card.templateId}.json`),
    ]);
    const imageUrl = card.image.src ? URL.createObjectURL(card.image.src) : '';
    const canvas = await drawCanvas({
      template,
      language: card.language,
      cardName: card.cardName,
      rarity: card.rarity,
      level: card.level,
      cardType: card.cardType,
      elixirCost: card.elixirCost === null ? '?' : card.elixirCost,
      description: card.description,
      image: {
        src: imageUrl,
        fit: card.image.fit,
      },
      stats: card.stats,
    });
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    cardPreviewDialog.innerHTML = '';
    cardPreviewDialog.appendChild(canvas);
    cardPreviewDialog.showModal();
  });

  return cardElement;
};

const updateCardsList = async (cardPreviewDialog: HTMLDialogElement) => {
  const cards = await cardsCollection.getCards();
  const listContainer = document.querySelector('#cards-list')!;
  listContainer.innerHTML = '';
  cards.forEach((card) => {
    const cardElement = createCardPreviewElement(card, cardPreviewDialog);
    listContainer.appendChild(cardElement);
  });
};

export const onPageLoad = async () => {
  const cardPreviewDialog = document.querySelector<HTMLDialogElement>(
    '#card-preview-dialog',
  )!;
  cardPreviewDialog.addEventListener('click', () => {
    cardPreviewDialog.close();
  });
  cardsCollection.addEventListener('change', () =>
    updateCardsList(cardPreviewDialog),
  );
  await updateCardsList(cardPreviewDialog);
};
