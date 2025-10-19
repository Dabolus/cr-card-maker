import { CRCMDBSchema, db } from './db';

export const get = async <T extends CRCMDBSchema['settings']['value']>(
  key: CRCMDBSchema['settings']['key'],
  defaultValue: T,
): Promise<T> => {
  const storedVal = await db.get('settings', key);
  return (storedVal ?? defaultValue) as T;
};

export const set = <T extends CRCMDBSchema['settings']['value']>(
  key: CRCMDBSchema['settings']['key'],
  val: T,
) => db.put('settings', val, key);

export const remove = (key: CRCMDBSchema['settings']['key']) =>
  db.delete('settings', key);

export const clear = () => db.clear('settings');

export const keys = () => db.getAllKeys('settings');
