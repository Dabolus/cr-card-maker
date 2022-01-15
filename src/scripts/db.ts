import { DBSchema, openDB } from 'idb';

export const dbName = 'crcm';
export const dbVersion = 1;

export interface CRCMDBSchema extends DBSchema {
  settings: {
    key: string;
    value: unknown;
  };
  cards: {
    key: number;
    value: {
      id: number;
      language: string;
      name: string;
      rarity: string;
      level: number;
      type: string;
      cost: string;
      description: string;
      image: string;
    };
    indexes: {
      byLanguage: 'language';
      byCategory: 'category';
      byNumber: 'number';
    };
  };
}

export const db = await openDB<CRCMDBSchema>(dbName, dbVersion, {
  upgrade(db) {
    db.createObjectStore('settings');
    db.createObjectStore('cards', {
      keyPath: 'id',
      autoIncrement: true,
    });
  },
});
