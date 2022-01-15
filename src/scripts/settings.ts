import { CRCMDBSchema, db } from './db';

export const get = <T extends CRCMDBSchema['settings']['value']>(
  key: CRCMDBSchema['settings']['key'],
): Promise<T> => db.get('settings', key) as Promise<T>;

export const set = (
  key: CRCMDBSchema['settings']['key'],
  val: CRCMDBSchema['settings']['value'],
) => db.put('settings', val, key);

export const remove = (key: CRCMDBSchema['settings']['key']) =>
  db.delete('settings', key);

export const clear = () => db.clear('settings');

export const keys = () => db.getAllKeys('settings');
