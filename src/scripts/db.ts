import { openDB, type DBSchema } from 'idb';
import type { Rarity, Type } from '../templates/generated/types';
import type { Icon, ImageFit } from './renderers/shared';

export const dbName = 'crcm';
export const dbVersion = 1;

export interface CRCMDBSchema extends DBSchema {
  settings: {
    key: string;
    value: unknown;
  };
  cards: {
    key: string;
    value: {
      id: string;
      templateId: string;
      language: string;
      cardName: string;
      rarity: Rarity;
      level: number;
      cardType: Type;
      elixirCost: number | null;
      description: string;
      image: {
        src: Blob | null;
        fit: ImageFit;
      };
      stats?: {
        name: string;
        value: string | number;
        icon: Icon;
        showIconBackground?: boolean;
      }[];
      createdAt: Date;
      updatedAt: Date;
    };
    indexes: {
      byLanguage: 'language';
      byRarity: 'rarity';
      byLevel: 'level';
      byCardType: 'cardType';
      byElixirCost: 'elixirCost';
      byCreatedAt: 'createdAt';
      byUpdatedAt: 'updatedAt';
    };
  };
}

export const db = await openDB<CRCMDBSchema>(dbName, dbVersion, {
  upgrade(db) {
    db.createObjectStore('settings');
    const cardsStore = db.createObjectStore('cards', {
      keyPath: 'id',
    });
    cardsStore.createIndex('byLanguage', 'language');
    cardsStore.createIndex('byRarity', 'rarity');
    cardsStore.createIndex('byLevel', 'level');
    cardsStore.createIndex('byCardType', 'cardType');
    cardsStore.createIndex('byElixirCost', 'elixirCost');
    cardsStore.createIndex('byCreatedAt', 'createdAt');
    cardsStore.createIndex('byUpdatedAt', 'updatedAt');
  },
});
