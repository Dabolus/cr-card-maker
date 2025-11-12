import type {
  $Schema as TemplateSchema,
  Rarity,
  Type,
} from '../../templates/generated/types';
import type { Icon, ImageFit } from './shared';

export type { Rarity } from '../../templates/generated/types';
export type { ImageFit } from './shared';

export type CardStat = {
  /**
   * The name of the stat.
   */
  name: string;
  /**
   * The value of the stat.
   */
  value: string | number;
  /**
   * The icon to show for the stat.
   * It must be one of the available icons.
   */
  icon: Icon;
  /**
   * Whether to show the icon background or not.
   */
  showIconBackground?: boolean;
};

export type CardImage = {
  /**
   * The source URL of the image.
   * It can also be a valid data URL (e.g. a base64 encoded image).
   */
  src?: string;
  /**
   * The fit of the image.
   * Similarly to the CSS property, it can be:
   * - "fill" (the image will fill the frame, possibly being stretched)
   * - "contain" (the image will be centered in the frame)
   * - "cover" (the image will cover the frame, possibly being cropped)
   */
  fit: ImageFit;
};

export type Card = {
  /**
   * The template to use for generating the card.
   */
  template: TemplateSchema;
  /**
   * The language of the generated card.
   *
   * Available languages:
   * - en (English)
   * - ja (Japanese)
   * - fr (French)
   * - de (German)
   * - es (Spanish)
   * - it (Italian)
   * - nl (Dutch)
   * - no (Norwegian)
   * - pt (Portuguese)
   * - tr (Turkish)
   * - ru (Russian)
   */
  language: string;
  /**
   * The ID of the card. It is used to uniquely identify the card.
   */
  cardId: string;
  /**
   * The name of the card.
   */
  cardName: string;
  /**
   * The rarity of the card.
   *
   * Available rarities:
   * - common
   * - rare
   * - epic
   * - legendary
   * - champion
   */
  rarity: Rarity;
  /**
   * The level of the card.
   *
   * There are no controls on this value.
   * This means that if you want to let the user generate his own card,
   * you should check for the various level caps by yourself.
   */
  level: number;
  /**
   * The type of the card.
   *
   * Available types:
   * - troop
   * - building
   * - spell
   * - tower-troop
   */
  cardType: Type;
  /**
   * The elixir cost of the card.
   *
   * There are no controls on this value.
   * This means that if you want to let the user generate his own card,
   * you should check for the the input value by yourself.
   */
  elixirCost: string | number;
  /**
   * The description of the card.
   */
  description: string;
  /**
   * The image of the card.
   */
  image?: CardImage;
  /**
   * The hero image of the card.
   */
  heroImage?: CardImage;
  /**
   * The stats to show on the card.
   */
  stats?: CardStat[];
  /**
   * The creation date of the card.
   */
  createdAt: string;
  /**
   * The last update date of the card.
   */
  updatedAt: string;
};

export type RendererBaseOptions = Omit<Card, 'createdAt' | 'updatedAt'>;
