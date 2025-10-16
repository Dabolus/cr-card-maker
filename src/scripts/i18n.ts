import { get, set } from './settings';

export const supportedLocales = ['en', 'it', 'es'];

const localesCache: Record<
  string,
  Promise<{ default: typeof import('../locales/en.json') }>
> = {};

let currentLocaleData: typeof import('../locales/en.json');

const getLocaleData = async (locale: string) => {
  if (!(locale in localesCache)) {
    localesCache[locale] = import(`../locales/${locale}.json`);
  }
  const { default: localeData } = await localesCache[locale];
  return localeData;
};

export const t = (
  key: string,
  params: Record<string, unknown> = {},
  localeData: Record<string, string> = currentLocaleData,
) => {
  const rawTranslation = localeData[key];

  if (!rawTranslation) {
    if (import.meta.env.DEV) {
      console.warn(`Missing localization for key: ${key}`);
    }
    return key;
  }

  return Object.entries(params).reduce(
    (str, [placeholder, value]) =>
      str.replaceAll(`{{${placeholder}}}`, String(value)),
    rawTranslation,
  );
};

export const updateView = () => {
  document
    .querySelectorAll('[data-i18n],[data-i18n-title],[data-i18n-aria-label]')
    .forEach((el) => {
      if (el.hasAttribute('data-i18n-title')) {
        const key = el.getAttribute('data-i18n-title')!;
        const value = t(key);
        el.setAttribute('title', value);
      }
      if (el.hasAttribute('data-i18n-aria-label')) {
        const key = el.getAttribute('data-i18n-aria-label')!;
        const value = t(key);
        el.setAttribute('aria-label', value);
      }
      if (el.hasAttribute('data-i18n')) {
        const key = el.getAttribute('data-i18n')!;
        const value = t(key);
        el.textContent = value;
      }
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
  currentLocaleData = await getLocaleData(newLocale);
  updateView();
  await set('locale', newLocale);
};

export const setupI18n = async () => {
  const locale = await getLocale();
  currentLocaleData = await getLocaleData(locale);
  updateView();
};
