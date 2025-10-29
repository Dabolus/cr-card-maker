import { openDB, type DBSchema } from 'idb';
import type { Rarity, Type } from '../templates/generated/types';
import type { Icon, ImageFit } from './renderers/shared';

export const dbName = 'crcm';
export const dbVersion = 1;

interface CRCMDBSchemaConfig {
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

export type CRCMDBSchema = DBSchema & CRCMDBSchemaConfig;

const idb = await openDB<CRCMDBSchema>(dbName, dbVersion, {
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

class DBEvent<T extends keyof CRCMDBSchemaConfig> extends Event {
  constructor(
    public readonly storeName: T,
    eventName: string,
  ) {
    super(eventName);
  }
}

class DBChangeEvent<T extends keyof CRCMDBSchemaConfig> extends DBEvent<T> {
  constructor(
    storeName: T,
    public readonly detail: Pick<CRCMDBSchemaConfig[T], 'key' | 'value'>,
  ) {
    super(storeName, 'change');
  }
}

class DBCollection<T extends keyof CRCMDBSchemaConfig> extends EventTarget {
  constructor(private storeName: T) {
    super();
  }

  async add(value: CRCMDBSchemaConfig[T]['value']): Promise<void> {
    const key = await idb.add(this.storeName, value);
    this.dispatchEvent(new DBChangeEvent(this.storeName, { key, value }));
  }

  async set<
    TValue extends
      CRCMDBSchema['settings']['value'] = CRCMDBSchema['settings']['value'],
  >(key: CRCMDBSchemaConfig[T]['key'], value: TValue): Promise<void> {
    await idb.put(this.storeName, value, key);
    this.dispatchEvent(new DBChangeEvent(this.storeName, { key, value }));
  }

  async remove(key: CRCMDBSchemaConfig[T]['key']): Promise<void> {
    await idb.delete(this.storeName, key);
    this.dispatchEvent(new DBChangeEvent(this.storeName, { key, value: null }));
  }

  async clear(): Promise<void> {
    await idb.clear(this.storeName);
    this.dispatchEvent(new DBEvent(this.storeName, 'clear'));
  }

  async keys(): Promise<CRCMDBSchemaConfig[T]['key'][]> {
    return await idb.getAllKeys(this.storeName);
  }

  async getAll(): Promise<CRCMDBSchemaConfig[T]['value'][]> {
    return await idb.getAll(this.storeName);
  }

  async get<TValue extends CRCMDBSchemaConfig[T]['value']>(
    key: CRCMDBSchemaConfig[T]['key'],
  ): Promise<TValue | undefined>;
  async get<TValue extends CRCMDBSchemaConfig[T]['value']>(
    key: CRCMDBSchemaConfig[T]['key'],
    defaultValue: TValue,
  ): Promise<TValue>;
  async get<TValue extends CRCMDBSchemaConfig[T]['value']>(
    key: CRCMDBSchemaConfig[T]['key'],
    defaultValue?: TValue,
  ): Promise<TValue | undefined> {
    const storedVal = await idb.get(this.storeName, key);
    return (storedVal ?? defaultValue) as TValue | undefined;
  }
}

export interface DBCollectionEventMap<T extends keyof CRCMDBSchemaConfig> {
  change: DBChangeEvent<T>;
  clear: DBEvent<T>;
}

declare interface DBCollection<T extends keyof CRCMDBSchemaConfig> {
  addEventListener<K extends keyof DBCollectionEventMap<T>>(
    type: K,
    listener: (event: DBCollectionEventMap<T>[K]) => void,
  ): void;
}

export const db = {
  settings: new DBCollection('settings'),
  cards: new DBCollection('cards'),
};
