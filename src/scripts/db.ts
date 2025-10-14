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

class CardsCollection extends EventTarget {
  async addCard(card: CRCMDBSchema['cards']['value']) {
    await db.add('cards', card);
    this.dispatchEvent(new Event('change'));
  }

  async updateCard(card: CRCMDBSchema['cards']['value']) {
    await db.put('cards', card);
    this.dispatchEvent(new Event('change'));
  }

  async deleteCard(cardId: string) {
    await db.delete('cards', cardId);
    this.dispatchEvent(new Event('change'));
  }

  async getCards() {
    return await db.getAll('cards');
  }
}

export interface CardsCollectionEventMap {
  change: Event;
}

declare interface CardsCollection {
  addEventListener<K extends keyof CardsCollectionEventMap>(
    type: K,
    listener: (event: CardsCollectionEventMap[K]) => void,
  ): void;
}

export const cardsCollection = new CardsCollection();
