import { get, set } from './settings';

export const supportedLocales = [
  'en',
  'fr',
  'de',
  'es',
  'it',
  'ja',
  'pt',
  'nl',
  'ru',
];
export const [defaultLocale] = supportedLocales;

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
    .querySelectorAll(
      '[data-i18n],[data-i18n-href],[data-i18n-title],[data-i18n-aria-label]',
    )
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
      if (el.hasAttribute('data-i18n-href')) {
        const key = el.getAttribute('data-i18n-href')!;
        const value = t(key);
        el.setAttribute('href', value);
      }
      if (el.hasAttribute('data-i18n')) {
        const key = el.getAttribute('data-i18n')!;
        const value = t(key);
        el.textContent = value;
      }
    });
};

const getLocaleFromSettings = (): Promise<string | null> =>
  get<string | null>('locale', null);

const getLocaleFromPath = (): string | null => {
  const pathParts = window.location.pathname.split('/');
  return pathParts.length > 1 ? (pathParts[1] ?? null) : null;
};

const getLocaleFromNavigator = (): string | null =>
  navigator.languages
    .find((lang) => supportedLocales.includes(lang.slice(0, 2)))
    ?.slice(0, 2) ?? null;

export const getLocale = async () => {
  const guessedLocale =
    (await getLocaleFromSettings()) ??
    getLocaleFromPath() ??
    getLocaleFromNavigator();

  return guessedLocale && supportedLocales.includes(guessedLocale)
    ? guessedLocale
    : defaultLocale;
};

export const setLocale = async (locale: string) => {
  const newLocale = supportedLocales.includes(locale) ? locale : defaultLocale;
  currentLocaleData = await getLocaleData(newLocale);
  updateView();
  await set('locale', newLocale);
};

export const setupI18n = async () => {
  const locale = await getLocale();
  currentLocaleData = await getLocaleData(locale);
  updateView();
};
