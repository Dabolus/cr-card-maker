import { get, set } from './settings';

export const supportedLocales = ['en', 'it'];

const localesCache: Record<
  string,
  Promise<{ default: typeof import('../locales/en.json') }>
> = {};

const getLocaleData = async (locale: string) => {
  if (!(locale in localesCache)) {
    localesCache[locale] = import(`../locales/${locale}.json`);
  }
  const { default: localeData } = await localesCache[locale];
  return localeData;
};

const updateView = async (locale: string) => {
  const localeData = await getLocaleData(locale);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n')!;
    el.textContent = localeData[key as keyof typeof localeData];
  });
};

export const getLocale = async () => {
  const userLocale =
    (await get<string>('locale')) || navigator.language.slice(0, 2);

  return supportedLocales.includes(userLocale)
    ? userLocale
    : supportedLocales[0];
};

export const setLocale = async (locale: string) => {
  const newLocale = supportedLocales.includes(locale) ? locale : 'en';
  await Promise.all([updateView(newLocale), set('locale', newLocale)]);
};

export const setupI18n = async () => {
  const locale = await getLocale();
  await updateView(locale);
};
