import { setupI18n, t } from './i18n';
import { setupRouting } from './routing';
import { registerLaunchQueueConsumer, registerServiceWorker } from './pwa';
import type { RendererBaseOptions } from './renderers/types';
import '../styles/main.scss';

const i18nReadyPromise = setupI18n();
setupRouting(i18nReadyPromise);
registerLaunchQueueConsumer({
  onFileReceived: async (file) => {
    const [{ parseCard }, { db }] = await Promise.all([
      import('./cards-utils'),
      import('./db'),
      i18nReadyPromise,
    ]);
    const card = await parseCard(file);
    await db.settings.set<RendererBaseOptions>('currentCard', card);
    history.replaceState({}, '', t('page-path-create'));
  },
});
await registerServiceWorker(i18nReadyPromise);
