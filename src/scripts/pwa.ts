import { registerSW } from 'virtual:pwa-register';
import { showNotification } from './ui/notifications';
import { t } from './i18n';
import { get, set } from './settings';

const updateCheckInterval = 60 * 60 * 1000;

export const registerServiceWorker = async (
  i18nReadyPromise: Promise<void>,
) => {
  const update = registerSW({
    async onNeedRefresh() {
      await i18nReadyPromise;
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
  const latestOpenedVersion = await get<string | null>(
    'latestOpenedVersion',
    null,
  );

  if (
    latestOpenedVersion &&
    latestOpenedVersion !== import.meta.env.VITE_APP_VERSION
  ) {
    await i18nReadyPromise;
    showNotification({
      message: t('pwa-updated', {
        version: import.meta.env.VITE_APP_VERSION,
      }),
    });
  }

  await set('latestOpenedVersion', import.meta.env.VITE_APP_VERSION);
};
