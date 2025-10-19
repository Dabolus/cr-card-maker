import { setupI18n } from './i18n';
import { setupRouting } from './routing';
import { registerServiceWorker } from './pwa';
import '../styles/main.scss';

const i18nReadyPromise = setupI18n();
setupRouting(i18nReadyPromise);
await registerServiceWorker(i18nReadyPromise);
