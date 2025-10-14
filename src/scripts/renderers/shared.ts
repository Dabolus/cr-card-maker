import { loadImage } from '../utils';
import type { Rarity, Type } from '../../templates/generated/types';

export const shapes = [
  'normal',
  'legendary',
  'champion',
  'tower-troop',
  'ruler',
] as const;

export type Shape = (typeof shapes)[number];

export const raritiesConfig: Record<
  Rarity,
  {
    minLevel: number;
    shape: Shape;
  }
> = {
  common: {
    minLevel: 1,
    shape: 'normal',
  },
  rare: {
    minLevel: 3,
    shape: 'normal',
  },
  epic: {
    minLevel: 6,
    shape: 'normal',
  },
  legendary: {
    minLevel: 9,
    shape: 'legendary',
  },
  champion: {
    minLevel: 11,
    shape: 'champion',
  },
};

export const rarities = Object.keys(raritiesConfig) as Rarity[];

export const types: Type[] = [
  'troop',
  'building',
  'spell',
  'tower-troop',
  'ruler',
];

export const frameContainerNominalWidth = 280;
export const frameContainerNominalHeight = 385;

export interface Coordinates {
  x: number;
  y: number;
}

export const shapesConfig: Record<
  Shape,
  {
    image: {
      width: number;
      height: number;
      paddingTop: number;
      paddingRight: number;
      paddingBottom: number;
      paddingLeft: number;
      clip?: (
        width: number,
        height: number,
      ) => [
        // If clip is provided, we expect at least 4 coordinates (one for each corner), but can be more for complex shapes
        Coordinates,
        Coordinates,
        Coordinates,
        Coordinates,
        ...Coordinates[],
      ];
    };
    frame: {
      width: number;
      height: number;
      offsetX: number;
      offsetY: number;
    };
  }
> = {
  normal: {
    frame: {
      width: 280,
      height: 345,
      offsetX: 0,
      offsetY: 20,
    },
    image: {
      width: 261,
      height: 341,
      paddingTop: 2,
      paddingRight: 10,
      paddingBottom: 2,
      paddingLeft: 9,
      clip: (width, height) => [
        { x: 32, y: 0 },
        { x: width - 32, y: 0 },
        { x: width, y: 32 },
        { x: width, y: height - 32 },
        { x: width - 32, y: height },
        { x: 32, y: height },
        { x: 0, y: height - 32 },
        { x: 0, y: 32 },
      ],
    },
  },
  legendary: {
    frame: {
      width: 279,
      height: 381,
      offsetX: 0.5,
      offsetY: 2,
    },
    image: {
      width: 261,
      height: 341,
      paddingTop: 20,
      paddingRight: 9,
      paddingBottom: 20,
      paddingLeft: 9,
      clip: (width, height) => [
        { x: width / 2, y: 0 },
        { x: width / 2, y: 0 },
        { x: width, y: 60 },
        { x: width, y: height - 60 },
        { x: width / 2, y: height },
        { x: width / 2, y: height },
        { x: 0, y: height - 60 },
        { x: 0, y: 60 },
      ],
    },
  },
  champion: {
    frame: {
      width: 256,
      height: 375,
      offsetX: 12,
      offsetY: 5,
    },
    image: {
      width: 222,
      height: 291,
      paddingTop: 60,
      paddingRight: 18,
      paddingBottom: 24,
      paddingLeft: 16,
      clip: (width, height) => [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: height - 105 },
        { x: width / 2, y: height - 30 },
        { x: width / 2, y: height - 30 },
        { x: 0, y: height - 105 },
      ],
    },
  },
  'tower-troop': {
    frame: {
      width: 259,
      height: 362,
      offsetX: 10.5,
      offsetY: 11.5,
    },
    image: {
      width: 215,
      height: 280,
      paddingTop: 63,
      paddingRight: 22,
      paddingBottom: 19,
      paddingLeft: 22,
      clip: (width, height) => [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: height - 90 },
        { x: width / 2, y: height - 30 },
        { x: width / 2, y: height - 30 },
        { x: 0, y: height - 90 },
      ],
    },
  },
  ruler: {
    frame: {
      width: 238,
      height: 341,
      offsetX: 21,
      offsetY: 22,
    },
    image: {
      width: 184,
      height: 240,
      paddingTop: 61,
      paddingRight: 27,
      paddingBottom: 40,
      paddingLeft: 27,
    },
  },
};

export const icons = [
  'hp',
  'shield-hp',
  'dps',
  'damage',
  'area-damage',
  'tower-damage',
  'death-damage',
  'hit-speed',
  'target',
  'speed',
  'range',
  'lifetime',
  'deploy-time',
  'stun-duration',
  'radius',
  'troop',
  'count',
  'boost',
  'rage-fx',
  'common-cards',
  'rare-cards',
  'epic-cards',
  'legendary-cards',
  'trophy',
  'gold',
  'elixir',
  'dark-elixir',
  'gem',
  'transport',
  'upgrade',
] as const;

export type Icon = (typeof icons)[number];

export const imageFitOptions = ['contain', 'fill', 'cover'] as const;

export type ImageFit = (typeof imageFitOptions)[number];

export const getShapeImageSrc = (shape: Shape): string =>
  `/cards-assets/shapes/${shape}.png`;

export const getShapeImage = async (shape: Shape): Promise<HTMLImageElement> =>
  await loadImage(getShapeImageSrc(shape));

export const getIconImageSrc = (icon: Icon): string =>
  `/cards-assets/icons/${icon}.png`;

export const getIconsImages = async (
  neededIcons: Icon[],
): Promise<Record<Icon, HTMLImageElement>> =>
  Object.fromEntries(
    await Promise.all(
      neededIcons.map(async (icon) => [
        icon,
        await loadImage(getIconImageSrc(icon)),
      ]),
    ),
  );
