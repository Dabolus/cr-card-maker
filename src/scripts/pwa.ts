import { registerSW } from 'virtual:pwa-register';
import { showNotification } from './notifications';
import { t } from './i18n';
import { set } from './settings';

const updateCheckInterval = 60 * 60 * 1000;

export const registerServiceWorker = (i18nReadyPromise: Promise<void>) => {
  const update = registerSW({
    onNeedRefresh() {
      showNotification({
        message: t('pwa-update-available'),
        timer: 10000,
        onClick: () => update(),
      });
    },
    async onOfflineReady() {
      await i18nReadyPromise;
      showNotification({ message: t('pwa-offline-ready') });
    },
    onRegisteredSW(scriptUrl, registration) {
      if (registration) {
        setInterval(async () => {
          if (registration.installing || !navigator) {
            return;
          }

          if ('connection' in navigator && !navigator.onLine) {
            return;
          }

          const resp = await fetch(scriptUrl, {
            cache: 'no-store',
            headers: {
              cache: 'no-store',
              'cache-control': 'no-cache',
            },
          });

          if (resp?.status === 200) {
            await registration.update();
          }
        }, updateCheckInterval);
      }
    },
  });

  // After each update, show a dialog with the changelog
  const latestOpenedVersion = window.localStorage.getItem(
    'latestOpenedVersion',
  );

  if (
    latestOpenedVersion &&
    latestOpenedVersion !== import.meta.env.VITE_APP_VERSION
  ) {
    i18nReadyPromise.then(() =>
      showNotification({
        message: t('pwa-updated', {
          version: import.meta.env.VITE_APP_VERSION,
        }),
      }),
    );
  }

  set('latestOpenedVersion', import.meta.env.VITE_APP_VERSION);
};
